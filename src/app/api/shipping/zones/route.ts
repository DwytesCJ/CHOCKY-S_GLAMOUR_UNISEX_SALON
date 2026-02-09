import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/shipping/zones - Public: list active shipping zones for checkout
export async function GET() {
  try {
    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: [{ region: 'asc' }, { distanceKm: 'asc' }],
      select: {
        id: true,
        name: true,
        district: true,
        region: true,
        distanceKm: true,
        baseFee: true,
        perKgFee: true,
        estimatedDays: true,
      },
    });

    // Group by region
    const grouped = zones.reduce((acc: Record<string, typeof zones>, zone: typeof zones[number]) => {
      const region = zone.region || 'Other';
      if (!acc[region]) acc[region] = [];
      acc[region].push(zone);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: { zones, grouped },
    });
  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping zones' },
      { status: 500 }
    );
  }
}

// POST /api/shipping/calculate - Calculate shipping cost
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zoneId, weight } = body;

    if (!zoneId) {
      return NextResponse.json(
        { success: false, error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    const zone = await prisma.shippingZone.findUnique({
      where: { id: zoneId, isActive: true },
    });

    if (!zone) {
      return NextResponse.json(
        { success: false, error: 'Shipping zone not found' },
        { status: 404 }
      );
    }

    const itemWeight = weight || 1; // Default to 1kg
    const shippingCost = Number(zone.baseFee) + (Number(zone.perKgFee) * itemWeight);

    return NextResponse.json({
      success: true,
      data: {
        zoneName: zone.name,
        district: zone.district,
        distanceKm: zone.distanceKm,
        shippingCost: Math.round(shippingCost),
        estimatedDays: zone.estimatedDays,
        note: 'Admin will confirm exact drop-off point with delivery van.',
      },
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
