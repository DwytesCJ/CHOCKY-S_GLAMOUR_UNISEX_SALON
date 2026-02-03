import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CHK-${timestamp}-${random}`;
}

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    const where: any = { userId: session.user.id };
    if (status) where.status = status;
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const {
      items,
      shippingAddressId,
      billingAddressId,
      shippingMethod,
      shippingCost,
      paymentMethod,
      notes,
      couponCode,
      useRewardPoints,
    } = body;
    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }
    
    // Get product details and calculate totals
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    
    if (products.length !== items.length) {
      return NextResponse.json(
        { success: false, error: 'Some products are no longer available' },
        { status: 400 }
      );
    }
    
    // Calculate subtotal
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product) throw new Error('Product not found');
      
      const price = product.isOnSale && product.compareAtPrice 
        ? product.price 
        : product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      
      return {
        productId: product.id,
        productName: product.name,
        productImage: item.image || '',
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        price,
        total: itemTotal,
      };
    });
    
    // Apply coupon if provided
    let discount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });
      
      if (coupon) {
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          return NextResponse.json(
            { success: false, error: `Minimum order amount is ${coupon.minOrderAmount} UGX` },
            { status: 400 }
          );
        }
        
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
          }
        } else {
          discount = coupon.discountValue;
        }
        
        couponId = coupon.id;
        
        // Increment coupon usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }
    
    // Apply reward points if user is logged in
    let pointsUsed = 0;
    let pointsDiscount = 0;
    if (session?.user?.id && useRewardPoints) {
      const userPoints = await prisma.rewardPoint.aggregate({
        where: { userId: session.user.id },
        _sum: { points: true },
      });
      
      const availablePoints = userPoints._sum.points || 0;
      if (availablePoints > 0) {
        // 100 points = 5000 UGX
        const maxPointsDiscount = Math.floor(availablePoints / 100) * 5000;
        pointsDiscount = Math.min(maxPointsDiscount, subtotal - discount);
        pointsUsed = Math.ceil(pointsDiscount / 50); // 50 UGX per point
      }
    }
    
    // Calculate tax (18% VAT in Uganda)
    const taxRate = 0.18;
    const taxableAmount = subtotal - discount - pointsDiscount;
    const tax = Math.round(taxableAmount * taxRate);
    
    // Calculate total
    const total = subtotal - discount - pointsDiscount + (shippingCost || 0) + tax;
    
    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.user?.id,
        email: body.email || session?.user?.email,
        phone: body.phone,
        status: 'PENDING',
        subtotal,
        discount,
        tax,
        shippingCost: shippingCost || 0,
        total,
        currency: 'UGX',
        shippingAddressId,
        billingAddressId,
        shippingMethod: shippingMethod || 'STANDARD',
        paymentMethod: paymentMethod || 'MOBILE_MONEY',
        notes,
        couponId,
        couponCode,
        couponDiscount: discount,
        pointsUsed,
        pointsDiscount,
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            notes: 'Order placed',
          },
        },
      },
      include: {
        items: true,
      },
    });
    
    // Deduct reward points if used
    if (session?.user?.id && pointsUsed > 0) {
      await prisma.rewardPoint.create({
        data: {
          userId: session.user.id,
          points: -pointsUsed,
          type: 'REDEEMED',
          description: `Redeemed for order ${order.orderNumber}`,
          orderId: order.id,
        },
      });
    }
    
    // Update product stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }
    
    // Clear user's cart if logged in
    if (session?.user?.id) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id },
      });
    }
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session?.user?.id,
        action: 'ORDER_CREATED',
        entity: 'order',
        entityId: order.id,
        details: JSON.stringify({ orderNumber: order.orderNumber, total: order.total }),
      },
    });
    
    return NextResponse.json({
      success: true,
      data: order,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
