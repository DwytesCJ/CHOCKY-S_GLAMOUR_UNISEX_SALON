import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch reward settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get settings from SiteSetting table
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            'rewards_points_per_ugx',
            'rewards_signup_bonus',
            'rewards_review_bonus',
            'rewards_referral_bonus',
            'rewards_birthday_bonus',
            'rewards_salon_multiplier',
            'rewards_expire_months',
          ],
        },
      },
    });

    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      data: {
        pointsPerUGX: Number(settingsMap['rewards_points_per_ugx']) || 1000,
        signupBonus: Number(settingsMap['rewards_signup_bonus']) || 500,
        reviewBonus: Number(settingsMap['rewards_review_bonus']) || 50,
        referralBonus: Number(settingsMap['rewards_referral_bonus']) || 1000,
        birthdayBonus: Number(settingsMap['rewards_birthday_bonus']) || 500,
        salonMultiplier: Number(settingsMap['rewards_salon_multiplier']) || 2,
        pointsExpireMonths: Number(settingsMap['rewards_expire_months']) || 12,
      },
    });
  } catch (error) {
    console.error('Error fetching reward settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update reward settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      pointsPerUGX,
      signupBonus,
      reviewBonus,
      referralBonus,
      birthdayBonus,
      salonMultiplier,
      pointsExpireMonths,
    } = body;

    const settingsToUpdate = [
      { key: 'rewards_points_per_ugx', value: String(pointsPerUGX || 1000) },
      { key: 'rewards_signup_bonus', value: String(signupBonus || 500) },
      { key: 'rewards_review_bonus', value: String(reviewBonus || 50) },
      { key: 'rewards_referral_bonus', value: String(referralBonus || 1000) },
      { key: 'rewards_birthday_bonus', value: String(birthdayBonus || 500) },
      { key: 'rewards_salon_multiplier', value: String(salonMultiplier || 2) },
      { key: 'rewards_expire_months', value: String(pointsExpireMonths || 12) },
    ];

    for (const setting of settingsToUpdate) {
      await prisma.siteSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating reward settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
