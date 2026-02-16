import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT - Update tier
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, minPoints, maxPoints, pointsMultiplier, benefits, icon, color, isActive } = body;

    const tier = await prisma.rewardTier.update({
      where: { id },
      data: {
        name,
        slug: slug || name?.toLowerCase().replace(/\s+/g, '-'),
        minPoints: Number(minPoints) || 0,
        maxPoints: maxPoints ? Number(maxPoints) : null,
        pointsMultiplier: Number(pointsMultiplier) || 1,
        benefits: benefits || null,
        icon: icon || null,
        color: color || null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, data: tier });
  } catch (error) {
    console.error('Error updating tier:', error);
    return NextResponse.json({ success: false, error: 'Failed to update tier' }, { status: 500 });
  }
}

// DELETE - Delete tier
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.rewardTier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Tier deleted successfully' });
  } catch (error) {
    console.error('Error deleting tier:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete tier' }, { status: 500 });
  }
}
