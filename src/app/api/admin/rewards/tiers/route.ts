import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Create new tier
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, minPoints, maxPoints, pointsMultiplier, benefits, icon, color, isActive } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const tier = await prisma.rewardTier.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
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
    console.error('Error creating tier:', error);
    return NextResponse.json({ success: false, error: 'Failed to create tier' }, { status: 500 });
  }
}
