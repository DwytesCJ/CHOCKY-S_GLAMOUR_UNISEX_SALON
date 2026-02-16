import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - List all gallery items
export async function GET() {
  try {
    const items = await prisma.gallery.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

// POST - Create new gallery item
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, beforeImage, afterImage, category, stylistName, isActive, sortOrder } = body;

    if (!title || !beforeImage || !afterImage) {
      return NextResponse.json({ success: false, error: 'Title, before image, and after image are required' }, { status: 400 });
    }

    const item = await prisma.gallery.create({
      data: {
        title,
        description: description || null,
        beforeImage,
        afterImage,
        category: category || 'Hair',
        stylistName: stylistName || null,
        isActive: isActive !== false,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create gallery item' }, { status: 500 });
  }
}
