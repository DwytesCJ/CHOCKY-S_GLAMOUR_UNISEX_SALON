import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/promotions - List all promotions (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Parse productIds and attach product details
    const promoWithProducts = await Promise.all(
      promotions.map(async (promo) => {
        const ids = promo.productIds ? JSON.parse(promo.productIds) as string[] : [];
        const products = ids.length > 0
          ? await prisma.product.findMany({
              where: { id: { in: ids } },
              select: { id: true, name: true, price: true, compareAtPrice: true, images: { take: 1, select: { url: true } } },
            })
          : [];
        return { ...promo, products };
      })
    );

    return NextResponse.json({ success: true, data: promoWithProducts });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

// POST /api/promotions - Create a promotion (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, discountPct, startDate, endDate, isActive, productIds } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Name, start date and end date are required' }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        name,
        description: description || null,
        type: type || 'FLASH_DEAL',
        discountPct: discountPct || 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
        productIds: JSON.stringify(productIds || []),
      },
    });

    return NextResponse.json({ success: true, data: promotion }, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ success: false, error: 'Failed to create promotion' }, { status: 500 });
  }
}

// PUT /api/promotions - Update a promotion (admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Promotion ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.discountPct !== undefined) updateData.discountPct = data.discountPct;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.productIds !== undefined) updateData.productIds = JSON.stringify(data.productIds);

    const promotion = await prisma.promotion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: promotion });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json({ success: false, error: 'Failed to update promotion' }, { status: 500 });
  }
}

// DELETE /api/promotions - Delete a promotion (admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Promotion ID is required' }, { status: 400 });
    }

    await prisma.promotion.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Promotion deleted' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete promotion' }, { status: 500 });
  }
}
