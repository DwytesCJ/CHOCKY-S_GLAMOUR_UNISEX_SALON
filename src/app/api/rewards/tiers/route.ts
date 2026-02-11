import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch all reward tiers (public)
export async function GET() {
  try {
    const tiers = await prisma.rewardTier.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'asc' },
    });

    return NextResponse.json({ success: true, data: tiers });
  } catch (error) {
    console.error('Error fetching reward tiers:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
