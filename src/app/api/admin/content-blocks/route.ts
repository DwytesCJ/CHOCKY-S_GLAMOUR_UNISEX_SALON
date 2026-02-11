import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/content-blocks - Get all content blocks (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const section = searchParams.get('section');

    const where: any = {};
    if (page) where.page = page;
    if (section) where.section = section;

    const blocks = await prisma.contentBlock.findMany({
      where,
      orderBy: [{ page: 'asc' }, { sortOrder: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: blocks,
    });
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content blocks' },
      { status: 500 }
    );
  }
}

// POST /api/admin/content-blocks - Create a new content block
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, title, content, type, page, section, sortOrder, isActive, metadata } = body;

    if (!key || !content) {
      return NextResponse.json(
        { success: false, error: 'Key and content are required' },
        { status: 400 }
      );
    }

    // Check if key already exists
    const existing = await prisma.contentBlock.findUnique({
      where: { key },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A content block with this key already exists' },
        { status: 400 }
      );
    }

    const block = await prisma.contentBlock.create({
      data: {
        key,
        title: title || null,
        content,
        type: type || 'text',
        page: page || 'home',
        section: section || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: block,
    });
  } catch (error) {
    console.error('Error creating content block:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create content block' },
      { status: 500 }
    );
  }
}
