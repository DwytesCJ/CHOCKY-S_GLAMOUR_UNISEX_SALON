import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/cron/expire-points - Expire reward points past their expiresAt date
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find all positive (earned) points that have expired and haven't been marked yet
    const expiredPoints = await prisma.rewardPoint.findMany({
      where: {
        points: { gt: 0 },
        expiresAt: { lt: now },
        type: { not: 'EXPIRED' },
      },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    if (expiredPoints.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired points found',
        data: { processed: 0 },
      });
    }

    // Group by user for batch processing
    const userExpiredMap: Record<string, { totalExpired: number; pointIds: string[] }> = {};
    
    for (const rp of expiredPoints) {
      if (!userExpiredMap[rp.userId]) {
        userExpiredMap[rp.userId] = { totalExpired: 0, pointIds: [] };
      }
      userExpiredMap[rp.userId].totalExpired += rp.points;
      userExpiredMap[rp.userId].pointIds.push(rp.id);
    }

    let totalProcessed = 0;

    // Create EXPIRED entries for each user (negative points to cancel out expired earned points)
    for (const [userId, data] of Object.entries(userExpiredMap)) {
      await prisma.rewardPoint.create({
        data: {
          userId,
          points: -data.totalExpired,
          type: 'EXPIRED',
          description: `${data.totalExpired} points expired`,
        },
      });
      totalProcessed += data.pointIds.length;
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${totalProcessed} expired point records for ${Object.keys(userExpiredMap).length} users`,
      data: {
        processed: totalProcessed,
        usersAffected: Object.keys(userExpiredMap).length,
      },
    });
  } catch (error) {
    console.error('Error expiring points:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to expire points' },
      { status: 500 }
    );
  }
}

// GET handler for Vercel cron compatibility
export async function GET(request: NextRequest) {
  return POST(request);
}
