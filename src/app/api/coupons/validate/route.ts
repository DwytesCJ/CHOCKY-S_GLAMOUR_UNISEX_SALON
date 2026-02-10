import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/coupons/validate - Validate a coupon code
export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    // Check if active
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'This coupon is no longer active' },
        { status: 400 }
      );
    }

    // Check expiry
    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    // Check start date
    if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
      return NextResponse.json(
        { success: false, error: 'This coupon is not yet active' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'This coupon has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check minimum order
    if (coupon.minOrderAmount && orderTotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json(
        { success: false, error: `Minimum order amount is UGX ${Number(coupon.minOrderAmount).toLocaleString()}` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((orderTotal * Number(coupon.discountValue)) / 100);
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, Number(coupon.maxDiscountAmount));
      }
    } else {
      discount = Math.min(Number(coupon.discountValue), orderTotal);
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.discountType,
        value: Number(coupon.discountValue),
        discount,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
