import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT - Update a testimonial
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, title, image, content, rating, sortOrder, isActive, isFeatured } = body;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(image !== undefined && { image }),
        ...(content !== undefined && { content }),
        ...(rating !== undefined && { rating }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
    });

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE - Delete a testimonial
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.testimonial.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
