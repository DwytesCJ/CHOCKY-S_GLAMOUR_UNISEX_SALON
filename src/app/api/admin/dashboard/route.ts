import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Get various statistics
    const [
      totalOrders,
      todayOrders,
      monthOrders,
      lastMonthOrders,
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalCustomers,
      newCustomersMonth,
      totalProducts,
      lowStockProducts,
      pendingOrders,
      todayAppointments,
      pendingAppointments,
      recentOrders,
      topProducts,
      recentReviews,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      
      // Today's orders
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      
      // This month's orders
      prisma.order.count({
        where: { createdAt: { gte: thisMonth } },
      }),
      
      // Last month's orders
      prisma.order.count({
        where: {
          createdAt: { gte: lastMonth, lte: lastMonthEnd },
        },
      }),
      
      // Total revenue
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true },
      }),
      
      // This month's revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: thisMonth },
          status: 'DELIVERED',
        },
        _sum: { totalAmount: true },
      }),
      
      // Last month's revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: lastMonth, lte: lastMonthEnd },
          status: 'DELIVERED',
        },
        _sum: { totalAmount: true },
      }),
      
      // Total customers
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),
      
      // New customers this month
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: thisMonth },
        },
      }),
      
      // Total products
      prisma.product.count({
        where: { isActive: true },
      }),
      
      // Low stock products
      prisma.product.count({
        where: {
          isActive: true,
          stockQuantity: { lte: 5 },
        },
      }),
      
      // Pending orders
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      
      // Today's appointments
      prisma.appointment.count({
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Pending appointments
      prisma.appointment.count({
        where: { status: 'PENDING' },
      }),
      
      // Recent orders
      prisma.order.findMany({
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      
      // Top selling products
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { soldCount: 'desc' },
        select: {
          id: true,
          name: true,
          price: true,
          soldCount: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
        take: 5,
      }),
      
      // Recent reviews
      prisma.review.findMany({
        include: {
          user: { select: { firstName: true, lastName: true } },
          product: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);
    
    // Calculate growth percentages
    const orderGrowth = lastMonthOrders > 0
      ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 100;
    
    const lastMonthRev = Number(lastMonthRevenue._sum.totalAmount) || 0;
    const currentMonthRev = Number(monthRevenue._sum.totalAmount) || 0;
    
    const revenueGrowth = lastMonthRev > 0
      ? ((currentMonthRev - lastMonthRev) / lastMonthRev) * 100
      : 100;
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          todayOrders,
          monthOrders,
          orderGrowth: Math.round(orderGrowth * 10) / 10,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          monthRevenue: monthRevenue._sum.totalAmount || 0,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          totalCustomers,
          newCustomersMonth,
          totalProducts,
          lowStockProducts,
          pendingOrders,
          todayAppointments,
          pendingAppointments,
        },
        recentOrders: recentOrders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customer: order.user
            ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email
            : order.email,
          total: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        })),
        topProducts: topProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          soldCount: product.soldCount,
          image: product.images[0]?.url,
        })),
        recentReviews: recentReviews.map((review: any) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          customer: `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim(),
          product: review.product.name,
          createdAt: review.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
