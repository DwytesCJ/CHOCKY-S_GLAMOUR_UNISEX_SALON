import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch active banners (public)
export async function GET() {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
