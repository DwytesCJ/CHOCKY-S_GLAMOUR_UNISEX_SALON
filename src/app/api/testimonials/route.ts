import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch active testimonials (public)
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
