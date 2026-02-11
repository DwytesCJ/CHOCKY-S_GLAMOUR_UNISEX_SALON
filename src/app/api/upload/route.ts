import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Generate unique filename
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

// POST - Upload image(s)
export async function POST(request: NextRequest) {
  try {
    // Check authentication - only admins can upload
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedFiles: { filename: string; url: string; originalName: string; size: number }[] = [];
    const errors: string[] = [];

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large. Maximum size is 10MB`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = generateFilename(file.name);
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        const url = `/uploads/${folder}/${filename}`;
        uploadedFiles.push({
          filename,
          url,
          originalName: file.name,
          size: file.size,
        });
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        errors.push(`${file.name}: Failed to save file`);
      }
    }

    if (uploadedFiles.length === 0 && errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'All uploads failed', 
        errors 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}

// DELETE - Delete an uploaded image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL required' }, { status: 400 });
    }

    // Security: Only allow deleting files from /uploads/ directory
    if (!fileUrl.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const filepath = path.join(process.cwd(), 'public', fileUrl);
    
    const { unlink } = await import('fs/promises');
    await unlink(filepath);

    return NextResponse.json({ success: true, message: 'File deleted' });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
