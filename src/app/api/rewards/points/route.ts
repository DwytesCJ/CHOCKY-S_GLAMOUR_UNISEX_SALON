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

    // Get user with reward points
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rewardPoints: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Last 20 transactions
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Calculate total points
    const totalPoints = user.rewardPoints.reduce((sum, rp) => sum + rp.points, 0);

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

    // Calculate points to next tier
    const pointsToNextTier = nextTier ? nextTier.minPoints - totalPoints : 0;

    // Format history
    const history = user.rewardPoints.map(rp => ({
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

    // Calculate discount value (100 points = UGX 5,000)
    const discountValue = Math.floor(pointsToRedeem / 100) * 5000;

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
