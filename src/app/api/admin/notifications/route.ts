import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Fetch all notification-worthy counts
    const [
      pendingOrders,
      pendingAppointments,
      lowStockProducts,
      pendingReviews,
      outOfStockProducts
    ] = await Promise.all([
      prisma.order.count({
        where: { 
          status: 'PENDING' 
        }
      }),
      prisma.appointment.count({
        where: { 
          status: 'PENDING' 
        }
      }),
      prisma.product.count({
        where: { 
          stockQuantity: {
            lte: 5 // Low stock threshold
          },
          isActive: true
        }
      }),
      prisma.review.count({
        where: { 
          isApproved: false
        }
      }),
      prisma.product.count({
        where: { 
          stockQuantity: 0,
          isActive: true
        }
      })
    ]);

    const totalNotifications = pendingOrders + pendingAppointments + lowStockProducts + pendingReviews + outOfStockProducts;

    return NextResponse.json({
      success: true,
      data: {
        total: totalNotifications,
        breakdown: {
          pendingOrders,
          pendingAppointments,
          lowStockProducts,
          pendingReviews,
          outOfStockProducts
        },
        details: {
          pendingOrders,
          pendingAppointments,
          lowStockAlerts: lowStockProducts,
          pendingReviews,
          outOfStockAlerts: outOfStockProducts
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}