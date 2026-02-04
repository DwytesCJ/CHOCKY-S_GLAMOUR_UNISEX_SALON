import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id }
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);

  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      code, 
      description, 
      discountType, 
      discountValue, 
      minOrderAmount, 
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      isActive,
      applicableCategories,
      applicableProducts
    } = body;

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id }
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check if coupon code already exists (excluding current coupon)
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (existingCoupon) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    
    if (code) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = new Prisma.Decimal(discountValue);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount ? new Prisma.Decimal(minOrderAmount) : null;
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount ? new Prisma.Decimal(maxDiscountAmount) : null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (perUserLimit !== undefined) updateData.perUserLimit = perUserLimit;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (applicableCategories !== undefined) updateData.applicableCategories = applicableCategories;
    if (applicableProducts !== undefined) updateData.applicableProducts = applicableProducts;

    const updatedCoupon = await prisma.coupon.update({
      where: { id: params.id },
      data: updateData
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_COUPON',
        entity: 'Coupon',
        entityId: params.id,
        details: `Updated coupon: ${updatedCoupon.code}`
      }
    });

    return NextResponse.json(updatedCoupon);

  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id }
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    await prisma.coupon.delete({
      where: { id: params.id }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_COUPON',
        entity: 'Coupon',
        entityId: params.id,
        details: `Deleted coupon: ${coupon.code}`
      }
    });

    return NextResponse.json({ message: 'Coupon deleted successfully' });

  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}