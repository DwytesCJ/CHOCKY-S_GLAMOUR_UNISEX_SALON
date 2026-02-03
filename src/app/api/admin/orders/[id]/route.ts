import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isStaff } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !isStaff(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        payments: true,
        address: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !isStaff(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    const { status, notes, trackingNumber, trackingUrl } = body;
    
    // Get current order
    const currentOrder = await prisma.order.findUnique({
      where: { id },
    });
    
    if (!currentOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Update order
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === 'PROCESSING') {
        updateData.processedAt = new Date();
      } else if (status === 'SHIPPED') {
        updateData.shippedAt = new Date();
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (trackingUrl) updateData.trackingUrl = trackingUrl;
      } else if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        
        // Restore stock for cancelled orders
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: id },
        });
        
        for (const item of orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: item.quantity },
              soldCount: { decrement: item.quantity },
            },
          });
        }
      }
    }
    
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (trackingUrl) updateData.trackingUrl = trackingUrl;
    
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { email: true, firstName: true } },
      },
    });
    
    // Add status history entry
    if (status && status !== currentOrder.status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note: notes || `Status changed from ${currentOrder.status} to ${status}`,
          createdBy: session.user.id,
        },
      });
    }
    
    // Award points for completed orders
    if (status === 'DELIVERED' && order.userId) {
      const pointsEarned = Math.floor(Number(order.totalAmount) / 1000); // 1 point per 1000 UGX
      
      await prisma.rewardPoint.create({
        data: {
          userId: order.userId,
          points: pointsEarned,
          type: 'EARNED_PURCHASE',
          description: `Points earned from order ${order.orderNumber}`,
          orderId: order.id,
        },
      });
    }
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'ORDER_STATUS_UPDATED',
        entity: 'order',
        entityId: order.id,
        details: JSON.stringify({
          orderNumber: order.orderNumber,
          previousStatus: currentOrder.status,
          newStatus: status,
        }),
      },
    });
    
    // TODO: Send notification email to customer
    
    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
