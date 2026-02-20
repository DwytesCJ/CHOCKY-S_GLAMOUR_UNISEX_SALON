import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET user's reward points and tier
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get ALL user reward points for accurate total
    const allPoints = await prisma.rewardPoint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!allPoints) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Calculate total points (exclude expired positive points)
    const now = new Date();
    const totalPoints = allPoints.reduce((sum: number, rp: any) => {
      // Skip expired earned points (positive points with past expiresAt)
      if (rp.points > 0 && rp.expiresAt && new Date(rp.expiresAt) < now) {
        return sum;
      }
      return sum + rp.points;
    }, 0);

    // Last 20 for history display
    const recentPoints = allPoints.slice(0, 20);

    // Get all tiers to determine user's current tier
    const tiers = await prisma.rewardTier.findMany({
      where: { isActive: true },
      orderBy: { minPoints: 'asc' },
    });

    // Find current tier based on total points
    let currentTier = tiers[0] || null;
    let nextTier = null;
    
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      if (totalPoints >= tier.minPoints) {
        currentTier = tier;
        nextTier = tiers[i + 1] || null;
      }
    }

    // Get points value rate from settings
    let pointsValueRate = 10; // default: 1 point = 10 UGX
    let pointsPerPurchase = 1; // default: 1 point per 1000 UGX
    try {
      const settings = await prisma.siteSetting.findMany({
        where: { key: { in: ['pointsValueRate', 'pointsPerPurchase', 'rewardPointsPerUGX'] } },
      });
      for (const s of settings) {
        if (s.key === 'pointsValueRate') pointsValueRate = parseInt(s.value) || 10;
        if (s.key === 'pointsPerPurchase' || s.key === 'rewardPointsPerUGX') pointsPerPurchase = parseInt(s.value) || 1;
      }
    } catch {}

    // Calculate points to next tier
    const pointsToNextTier = nextTier ? nextTier.minPoints - totalPoints : 0;

    // Format history
    const history = recentPoints.map((rp: any) => ({
      id: rp.id,
      points: rp.points,
      type: rp.type,
      description: rp.description,
      createdAt: rp.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalPoints,
        pointsValueRate,
        pointsPerPurchase,
        pointsValue: totalPoints * pointsValueRate, // total UGX value of points
        currentTier: currentTier ? {
          id: currentTier.id,
          name: currentTier.name,
          slug: currentTier.slug,
          pointsMultiplier: Number(currentTier.pointsMultiplier),
          benefits: currentTier.benefits,
          color: currentTier.color,
          icon: currentTier.icon,
        } : null,
        nextTier: nextTier ? {
          id: nextTier.id,
          name: nextTier.name,
          minPoints: nextTier.minPoints,
        } : null,
        pointsToNextTier,
        history,
      },
    });
  } catch (error) {
    console.error('Error fetching reward points:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reward points' }, { status: 500 });
  }
}

// POST - Redeem points
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { pointsToRedeem, redemptionType } = body;

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid points amount' }, { status: 400 });
    }

    // Get user's current points
    const userPoints = await prisma.rewardPoint.aggregate({
      where: { userId },
      _sum: { points: true },
    });

    const totalPoints = userPoints._sum.points || 0;

    if (pointsToRedeem > totalPoints) {
      return NextResponse.json({ success: false, error: 'Insufficient points' }, { status: 400 });
    }

    // Get points value rate from settings
    let pointsValueRate = 10;
    try {
      const pvr = await prisma.siteSetting.findUnique({ where: { key: 'pointsValueRate' } });
      if (pvr) pointsValueRate = parseInt(pvr.value) || 10;
    } catch {}

    // Calculate discount value dynamically
    const discountValue = pointsToRedeem * pointsValueRate;

    // Create redemption record (negative points)
    const redemption = await prisma.rewardPoint.create({
      data: {
        userId,
        points: -pointsToRedeem,
        type: 'REDEEMED',
        description: `Redeemed ${pointsToRedeem} points for UGX ${discountValue.toLocaleString()} discount`,
      },
    });

    // Generate a unique redemption code
    const redemptionCode = `RWD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      data: {
        redemptionId: redemption.id,
        pointsRedeemed: pointsToRedeem,
        discountValue,
        redemptionCode,
        newBalance: totalPoints - pointsToRedeem,
      },
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    return NextResponse.json({ success: false, error: 'Failed to redeem points' }, { status: 500 });
  }
}
