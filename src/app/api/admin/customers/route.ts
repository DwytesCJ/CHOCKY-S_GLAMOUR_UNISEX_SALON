import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    // Get all users with customer role or all users if needed
    const users = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER' // Adjust this based on your role system
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        // Add order count and total spent if you have order relations
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match frontend expectations
    const customers = users.map(user => ({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
      image: user.avatar,
      isActive: user.isActive,
      totalOrders: user._count?.orders || 0,
      createdAt: user.createdAt,
      // These would need separate calculations from order data
      totalSpent: 0,
      rewardPoints: 0,
      rewardTier: 'Bronze'
    }));

    return NextResponse.json({
      success: true,
      data: customers,
      meta: {
        total: customers.length,
        active: customers.filter(c => c.isActive).length
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}