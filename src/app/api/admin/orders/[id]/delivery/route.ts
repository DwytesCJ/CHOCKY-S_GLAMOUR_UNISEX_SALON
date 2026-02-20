import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes((session.user as any).role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { trackingNumber } = await request.json();

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SHIPPED',
        trackingNumber: trackingNumber || undefined,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        statusHistory: {
          create: {
            status: 'SHIPPED',
            note: `Order sent to delivery team${trackingNumber ? `. Tracking: ${trackingNumber}` : ''}`,
            createdBy: session.user.email || 'admin',
          },
        },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        address: true,
        items: { include: { product: { include: { images: { take: 1 } } } } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error sending order to delivery:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
