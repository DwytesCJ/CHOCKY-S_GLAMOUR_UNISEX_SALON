import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/shipping-zones - List all shipping zones
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const zones = await prisma.shippingZone.findMany({
      orderBy: [{ region: 'asc' }, { distanceKm: 'asc' }],
    });

    return NextResponse.json({ success: true, data: zones });
  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch shipping zones' }, { status: 500 });
  }
}

// POST /api/admin/shipping-zones - Create a new shipping zone
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, district, region, distanceKm, baseFee, perKgFee, estimatedDays, isActive } = body;

    if (!name || !district || distanceKm === undefined || baseFee === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const zone = await prisma.shippingZone.create({
      data: {
        name,
        district,
        region: region || 'Central',
        distanceKm: Number(distanceKm),
        baseFee: Number(baseFee),
        perKgFee: Number(perKgFee || 0),
        estimatedDays: Number(estimatedDays || 1),
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, data: zone }, { status: 201 });
  } catch (error) {
    console.error('Error creating shipping zone:', error);
    return NextResponse.json({ success: false, error: 'Failed to create shipping zone' }, { status: 500 });
  }
}

// PUT /api/admin/shipping-zones - Update a shipping zone
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Zone ID is required' }, { status: 400 });
    }

    // Convert numeric fields
    if (updateData.distanceKm !== undefined) updateData.distanceKm = Number(updateData.distanceKm);
    if (updateData.baseFee !== undefined) updateData.baseFee = Number(updateData.baseFee);
    if (updateData.perKgFee !== undefined) updateData.perKgFee = Number(updateData.perKgFee);
    if (updateData.estimatedDays !== undefined) updateData.estimatedDays = Number(updateData.estimatedDays);

    const zone = await prisma.shippingZone.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: zone });
  } catch (error) {
    console.error('Error updating shipping zone:', error);
    return NextResponse.json({ success: false, error: 'Failed to update shipping zone' }, { status: 500 });
  }
}

// DELETE /api/admin/shipping-zones - Delete a shipping zone
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Zone ID is required' }, { status: 400 });
    }

    await prisma.shippingZone.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Shipping zone deleted' });
  } catch (error) {
    console.error('Error deleting shipping zone:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete shipping zone' }, { status: 500 });
  }
}
