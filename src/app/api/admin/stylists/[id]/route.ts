import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT - Update a stylist
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, title, image, bio, specialties, experience, rating, isActive, isFeatured, phone, email, workingHours } = body;

    // Generate slug from name if name is being updated
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

    const stylist = await prisma.stylist.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(title !== undefined && { title }),
        ...(image !== undefined && { image }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(specialties !== undefined && { specialties }),
        ...(experience !== undefined && { experience: experience ? parseInt(experience) : null }),
        ...(rating !== undefined && { rating }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(workingHours !== undefined && { workingHours }),
      },
    });

    return NextResponse.json({ success: true, data: stylist });
  } catch (error) {
    console.error('Error updating stylist:', error);
    return NextResponse.json({ error: 'Failed to update stylist' }, { status: 500 });
  }
}

// DELETE - Delete a stylist
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.stylist.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Stylist deleted' });
  } catch (error) {
    console.error('Error deleting stylist:', error);
    return NextResponse.json({ error: 'Failed to delete stylist' }, { status: 500 });
  }
}
