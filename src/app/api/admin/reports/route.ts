import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y
    
    // Calculate date range
    const endDate = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch all analytics data in parallel
    const [
      // Sales Metrics
      totalRevenue,
      orderCount,
      averageOrderValue,
      revenueByDay,
      
      // Customer Metrics
      totalCustomers,
      newCustomers,
      customerRetentionRate,
      
      // Product Metrics
      topSellingProducts,
      lowStockProducts,
      productViews,
      
      // Order Metrics
      orderStatusDistribution,
      paymentMethodDistribution,
      
      // Appointment Metrics
      totalAppointments,
      appointmentStatusDistribution,
      
      // Review Metrics
      reviewStats,
      
      // Traffic Metrics
      pageViews,
      
      // Financial Summary
      profitMargins
    ] = await Promise.all([
      // Sales Metrics
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' },
          paymentStatus: 'COMPLETED'
        },
        _sum: { totalAmount: true }
      }),
      
      prisma.order.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' },
          paymentStatus: 'COMPLETED'
        }
      }),
      
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' },
          paymentStatus: 'COMPLETED'
        },
        _avg: { totalAmount: true }
      }),
      
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' },
          paymentStatus: 'COMPLETED'
        },
        _sum: { totalAmount: true },
        orderBy: { createdAt: 'asc' }
      }),
      
      // Customer Metrics
      prisma.user.count({
        where: { role: 'CUSTOMER' }
      }),
      
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      
      // Simplified retention rate calculation
      prisma.order.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' }
        },
        having: { userId: { _count: { equals: 1 } } }
      }).then(result => result.length),
      
      // Product Metrics
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { orderItems: true } },
          images: { take: 1 }
        },
        orderBy: { soldCount: 'desc' },
        take: 10
      }),
      
      prisma.product.findMany({
        where: {
          isActive: true,
          stockQuantity: { lte: 5 }
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
          lowStockThreshold: true
        }
      }),
      
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          viewCount: true,
          soldCount: true
        },
        orderBy: { viewCount: 'desc' },
        take: 10
      }),
      
      // Order Metrics
      prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: startDate, lte: endDate }
        },
        _count: true
      }),
      
      prisma.order.groupBy({
        by: ['paymentMethod'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: 'COMPLETED'
        },
        _count: true
      }),
      
      // Appointment Metrics
      prisma.appointment.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      
      prisma.appointment.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: startDate, lte: endDate }
        },
        _count: true
      }),
      
      // Review Metrics
      prisma.review.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        },
        _count: true,
        _avg: { rating: true }
      }),
      
      // Traffic Metrics (simplified)
      prisma.pageView.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      
      // Financial Summary (simplified profit calculation)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' },
          paymentStatus: 'COMPLETED'
        },
        _sum: { 
          totalAmount: true,
          subtotal: true 
        }
      })
    ]);

    // Process and format the data
    const analyticsData = {
      period,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      
      // Sales Overview
      sales: {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        orderCount: orderCount,
        averageOrderValue: averageOrderValue._avg.totalAmount || 0,
        revenueTrend: revenueByDay.map(item => ({
          date: new Date(item.createdAt).toISOString().split('T')[0],
          revenue: item._sum.totalAmount || 0
        }))
      },
      
      // Customer Insights
      customers: {
        total: totalCustomers,
        new: newCustomers,
        retentionRate: totalCustomers > 0 ? ((totalCustomers - newCustomers) / totalCustomers) * 100 : 0
      },
      
      // Product Performance
      products: {
        topSelling: topSellingProducts.map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          soldCount: product.soldCount,
          image: product.images[0]?.url || null
        })),
        lowStock: lowStockProducts,
        popular: productViews.map(product => ({
          id: product.id,
          name: product.name,
          views: product.viewCount,
          sold: product.soldCount,
          conversionRate: product.viewCount > 0 ? (product.soldCount / product.viewCount) * 100 : 0
        }))
      },
      
      // Order Statistics
      orders: {
        statusDistribution: orderStatusDistribution.map(item => ({
          status: item.status,
          count: item._count
        })),
        paymentMethods: paymentMethodDistribution.map(item => ({
          method: item.paymentMethod,
          count: item._count
        }))
      },
      
      // Appointment Data
      appointments: {
        total: totalAppointments,
        statusDistribution: appointmentStatusDistribution.map(item => ({
          status: item.status,
          count: item._count
        }))
      },
      
      // Review Metrics
      reviews: {
        total: reviewStats._count || 0,
        averageRating: reviewStats._avg.rating || 0
      },
      
      // Traffic
      traffic: {
        totalPageViews: pageViews
      },
      
      // Financial Summary
      financial: {
        grossRevenue: profitMargins._sum.totalAmount ? parseFloat(profitMargins._sum.totalAmount.toString()) : 0,
        // Simplified cost calculation (assuming 60% cost of goods)
        estimatedProfit: (profitMargins._sum.totalAmount ? parseFloat(profitMargins._sum.totalAmount.toString()) : 0) * 0.4,
        profitMargin: 40 // Simplified percentage
      }
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}