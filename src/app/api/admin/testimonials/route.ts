import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch all testimonials (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST - Create a new testimonial
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, title, image, content, rating, sortOrder, isActive, isFeatured } = body;

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        title: title || null,
        image: image || null,
        content,
        rating: rating || 5,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false,
      },
    });

    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
