import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createOrderNotification } from '@/lib/notifications';
import { sendOrderConfirmation } from '@/lib/email';

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
          payments: true,
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
      shippingAddress,
      contactInfo,
      shippingMethod,
      deliveryMethod,
      shippingCost,
      shippingZoneId,
      paymentMethod,
      notes,
      couponCode,
      couponDiscount: clientCouponDiscount,
      useRewardPoints,
      total: clientTotal,
      subtotal: clientSubtotal,
      isFreeShipping,
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
      
      const price = Number(product.price);
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      
      return {
        productId: product.id,
        productName: product.name,
        variantId: item.variantId,
        variantName: item.variantName,
        sku: product.sku || '',
        quantity: item.quantity,
        price,
        totalPrice: itemTotal,
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
        const minAmount = Number(coupon.minOrderAmount) || 0;
        if (minAmount > 0 && subtotal < minAmount) {
          return NextResponse.json(
            { success: false, error: `Minimum order amount is ${minAmount} UGX` },
            { status: 400 }
          );
        }
        
        const discValue = Number(coupon.discountValue);
        const maxDisc = Number(coupon.maxDiscountAmount) || Infinity;
        
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (subtotal * discValue) / 100;
          if (discount > maxDisc) {
            discount = maxDisc;
          }
        } else {
          discount = discValue;
        }
        
        couponId = coupon.id;
        
        // Increment coupon usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
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

    // Resolve address: use shippingAddressId if provided, or create from shippingAddress object
    let resolvedAddressId = shippingAddressId || null;
    if (!resolvedAddressId && shippingAddress && session?.user?.id) {
      try {
        const newAddress = await prisma.address.create({
          data: {
            userId: session.user.id,
            type: 'SHIPPING',
            firstName: shippingAddress.firstName || '',
            lastName: shippingAddress.lastName || '',
            phone: contactInfo?.phone || '',
            addressLine1: shippingAddress.address || '',
            city: shippingAddress.city || '',
            district: shippingAddress.district || '',
            country: 'Uganda',
            isDefault: true,
          },
        });
        resolvedAddressId = newAddress.id;
      } catch (addrErr) {
        console.error('Error creating address:', addrErr);
      }
    }

    // Resolve shipping method from deliveryMethod
    const resolvedShippingMethod = deliveryMethod === 'pickup' ? 'STORE_PICKUP' : (shippingMethod || 'STANDARD');
    
    // Map payment method from frontend to Prisma enum
    const mapPaymentMethod = (method: string, provider?: string): string => {
      if (method === 'mobile_money') {
        if (provider === 'airtel') return 'AIRTEL_MONEY';
        return 'MTN_MOBILE_MONEY';
      }
      if (method === 'card') return 'CREDIT_CARD';
      if (method === 'cod') return 'CASH_ON_DELIVERY';
      return 'MTN_MOBILE_MONEY';
    };

    // Require authentication - userId is required in schema
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to place an order' },
        { status: 401 }
      );
    }

    // Build order data using Prisma relation connect syntax
    const orderData: any = {
      orderNumber: generateOrderNumber(),
      status: 'PENDING',
      subtotal,
      discountAmount: discount + pointsDiscount,
      taxAmount: tax,
      shippingCost: shippingCost || 0,
      totalAmount: total,
      shippingMethod: resolvedShippingMethod as any,
      paymentMethod: mapPaymentMethod(paymentMethod, body.mobileProvider),
      notes: notes || null,
      couponCode: couponCode || null,
      items: {
        create: orderItems,
      },
      statusHistory: {
        create: {
          status: 'PENDING',
          note: 'Order placed',
        },
      },
      // Connect user relation (required)
      user: {
        connect: { id: session.user.id },
      },
    };

    // Connect address relation if resolved
    if (resolvedAddressId) {
      orderData.address = { connect: { id: resolvedAddressId } };
    }

    // Connect shipping zone relation if provided
    if (shippingZoneId) {
      orderData.shippingZone = { connect: { id: shippingZoneId } };
    }

    // Append contact info to notes if provided
    if (contactInfo?.email || contactInfo?.phone) {
      const contactNote = `[Contact: ${contactInfo.email || ''}, ${contactInfo.phone || ''}]`;
      orderData.notes = orderData.notes ? `${orderData.notes}\n${contactNote}` : contactNote;
    }

    // Create order
    const order = await prisma.order.create({
      data: orderData,
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
        details: JSON.stringify({ orderNumber: order.orderNumber, total: order.totalAmount }),
      },
    });
    
    // Create notification for user
    if (session?.user?.id) {
      await createOrderNotification(
        session.user.id,
        order.orderNumber,
        'PENDING',
        order.id
      );
    }

    // Send order confirmation email
    if (body.contactInfo?.email || session?.user?.email) {
      const email = body.contactInfo?.email || session?.user?.email;
      const customerName = body.shippingAddress 
        ? `${body.shippingAddress.firstName || ''} ${body.shippingAddress.lastName || ''}`.trim()
        : session?.user?.name || 'Customer';
      
      sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerName,
        email,
        items: orderItems.map((item: any) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
          variant: item.variantName,
        })),
        subtotal,
        shippingCost: shippingCost || 0,
        total,
        shippingAddress: body.shippingAddress 
          ? `${body.shippingAddress.address || ''}, ${body.shippingAddress.city || ''}, ${body.shippingAddress.district || ''}` 
          : 'Store Pickup',
        estimatedDelivery: body.deliveryMethod === 'pickup' ? 'Ready in 24 hours' : '2-5 business days',
        paymentMethod: paymentMethod || 'Mobile Money',
      }).then(() => {
        prisma.order.update({ where: { id: order.id }, data: { emailSent: true } }).catch(() => {});
      }).catch(err => console.error('Email send error:', err));
    }
    
    return NextResponse.json({
      success: true,
      data: order,
      orderNumber: order.orderNumber,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
