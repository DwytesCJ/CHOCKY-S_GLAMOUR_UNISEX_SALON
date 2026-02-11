import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/districts - Public: retrieve distinct districts for market analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const includeStats = searchParams.get('stats') === 'true';

    const where: any = { isActive: true };
    if (region) where.region = region;

    const zones = await prisma.shippingZone.findMany({
      where,
      select: {
        id: true,
        name: true,
        district: true,
        region: true,
        distanceKm: true,
        baseFee: true,
        estimatedDays: true,
        ...(includeStats ? {
          _count: {
            select: { orders: true },
          },
        } : {}),
      },
      orderBy: [{ region: 'asc' }, { district: 'asc' }, { name: 'asc' }],
    });

    // Extract unique districts with their regions
    const districtMap = new Map<string, {
      district: string;
      region: string;
      zones: Array<{ id: string; name: string; distanceKm: any; baseFee: any; estimatedDays: number }>;
      orderCount: number;
    }>();

    for (const zone of zones) {
      const key = `${zone.district}-${zone.region}`;
      if (!districtMap.has(key)) {
        districtMap.set(key, {
          district: zone.district,
          region: zone.region,
          zones: [],
          orderCount: 0,
        });
      }
      const entry = districtMap.get(key)!;
      entry.zones.push({
        id: zone.id,
        name: zone.name,
        distanceKm: zone.distanceKm,
        baseFee: zone.baseFee,
        estimatedDays: zone.estimatedDays,
      });
      if (includeStats && (zone as any)._count) {
        entry.orderCount += (zone as any)._count.orders || 0;
      }
    }

    const districts = Array.from(districtMap.values());

    // Get unique regions for filtering
    const regions = [...new Set(zones.map(z => z.region))].sort();

    // Summary stats
    const summary = {
      totalDistricts: districts.length,
      totalZones: zones.length,
      regions,
      districtsByRegion: regions.reduce((acc, r) => {
        acc[r] = districts.filter(d => d.region === r).length;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      data: {
        districts,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}
