import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes((session.user as any).role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        appointments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            appointmentNumber: true,
            status: true,
            date: true,
            startTime: true,
            service: { select: { name: true } },
            stylist: { select: { name: true } },
          },
        },
        rewardPoints: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            points: true,
            type: true,
            description: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            orders: true,
            appointments: true,
            reviews: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch customer' }, { status: 500 });
  }
}
