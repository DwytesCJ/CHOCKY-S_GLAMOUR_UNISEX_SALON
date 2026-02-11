import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch all stylists (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stylists = await prisma.stylist.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: stylists });
  } catch (error) {
    console.error('Error fetching stylists:', error);
    return NextResponse.json({ error: 'Failed to fetch stylists' }, { status: 500 });
  }
}

// POST - Create a new stylist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, title, image, bio, specialties, experience, rating, isActive, isFeatured, phone, email, workingHours } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const stylist = await prisma.stylist.create({
      data: {
        name,
        slug,
        title: title || 'Stylist',
        image: image || null,
        bio: bio || null,
        phone: phone || null,
        email: email || null,
        specialties: specialties || null,
        experience: experience ? parseInt(experience) : null,
        rating: rating || 5.0,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        workingHours: workingHours || null,
      },
    });

    return NextResponse.json({ success: true, data: stylist }, { status: 201 });
  } catch (error) {
    console.error('Error creating stylist:', error);
    return NextResponse.json({ error: 'Failed to create stylist' }, { status: 500 });
  }
}
