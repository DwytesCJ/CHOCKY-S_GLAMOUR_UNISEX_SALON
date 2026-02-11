import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch all banners (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

// POST - Create a new banner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, subtitle, image, link, buttonText, position, sortOrder, isActive, startDate, endDate } = body;

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        buttonText: buttonText || null,
        position: position || 'hero',
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
