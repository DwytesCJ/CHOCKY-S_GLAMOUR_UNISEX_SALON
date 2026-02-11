import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch active stylists (public)
export async function GET() {
  try {
    const stylists = await prisma.stylist.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: stylists });
  } catch (error) {
    console.error('Error fetching stylists:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
