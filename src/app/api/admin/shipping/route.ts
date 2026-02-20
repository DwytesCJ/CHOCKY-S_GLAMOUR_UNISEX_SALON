import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const zones = await prisma.shippingZone.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ success: true, data: zones });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes((session.user as any).role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const zone = await prisma.shippingZone.create({
      data: { name: body.name, district: body.district, region: body.region || '', distanceKm: body.distanceKm || 0, baseFee: body.baseFee || 0, perKgFee: body.perKgFee || 0, estimatedDays: body.estimatedDays || 1, isActive: body.isActive !== false },
    });
    return NextResponse.json({ success: true, data: zone });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
