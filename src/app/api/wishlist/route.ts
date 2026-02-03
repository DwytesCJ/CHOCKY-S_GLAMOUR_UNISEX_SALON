import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const items = wishlistItems.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: item.product.images[0]?.url,
      price: item.product.price,
      compareAtPrice: item.product.compareAtPrice,
      isOnSale: item.product.isOnSale,
      inStock: item.product.stockQuantity > 0,
      averageRating: item.product.reviews.length > 0
        ? item.product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / item.product.reviews.length
        : 0,
      addedAt: item.createdAt,
    }));
    
    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Please login to add items to wishlist' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { productId } = body;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
      },
    });
    
    if (existingItem) {
      return NextResponse.json({
        success: true,
        message: 'Item already in wishlist',
        data: existingItem,
      });
    }
    
    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId,
      },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Item added to wishlist',
      data: wishlistItem,
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const itemId = searchParams.get('itemId');
    
    if (!productId && !itemId) {
      return NextResponse.json(
        { success: false, error: 'Product ID or Item ID is required' },
        { status: 400 }
      );
    }
    
    const where: any = { userId: session.user.id };
    if (itemId) {
      where.id = itemId;
    } else if (productId) {
      where.productId = productId;
    }
    
    await prisma.wishlistItem.deleteMany({ where });
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist',
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
}
