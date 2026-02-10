import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const productId = searchParams.get('productId') || '';
    const isApproved = searchParams.get('isApproved');
    const rating = searchParams.get('rating') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (productId) {
      where.productId = productId;
    }
    
    if (isApproved !== null) {
      where.isApproved = isApproved === 'true';
    }
    
    if (rating) {
      where.rating = parseInt(rating);
    }

    const [reviews, total, products] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.review.count({ where }),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          sku: true
        },
        orderBy: { name: 'asc' }
      })
    ]);

    return NextResponse.json({
      reviews,
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Review IDs are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    let result: { count: number } | undefined;
    let actionText = '';

    switch (action) {
      case 'approve':
        result = await prisma.review.updateMany({
          where: { id: { in: ids } },
          data: { isApproved: true }
        });
        actionText = 'approved';
        break;
        
      case 'reject':
        result = await prisma.review.updateMany({
          where: { id: { in: ids } },
          data: { isApproved: false }
        });
        actionText = 'rejected';
        break;
        
      case 'delete':
        result = await prisma.review.deleteMany({
          where: { id: { in: ids } }
        });
        actionText = 'deleted';
        break;
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `BULK_${action.toUpperCase()}_REVIEWS`,
        entity: 'Review',
        details: `Bulk ${actionText} ${ids.length} reviews`
      }
    });

    return NextResponse.json({ 
      message: `Successfully ${actionText} ${result?.count || 0} reviews`,
      count: result?.count || 0
    });

  } catch (error) {
    console.error('Error processing reviews:', error);
    return NextResponse.json(
      { error: 'Failed to process reviews' },
      { status: 500 }
    );
  }
}