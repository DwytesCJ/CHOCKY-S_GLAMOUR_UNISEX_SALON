import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant?.price || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    return NextResponse.json({
      success: true,
      data: {
        items: cartItems.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          productSlug: item.product.slug,
          productImage: item.product.images[0]?.url,
          variantId: item.variantId,
          variantName: item.variant?.name,
          price: item.variant?.price || item.product.price,
          compareAtPrice: item.product.compareAtPrice,
          quantity: item.quantity,
          stockQuantity: item.variant?.stockQuantity || item.product.stockQuantity,
        })),
        subtotal,
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Please login to add items to cart' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { productId, variantId, quantity = 1 } = body;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check stock
    const availableStock = product.stockQuantity;
    if (availableStock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Not enough stock available' },
        { status: 400 }
      );
    }
    
    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        variantId: variantId || null,
      },
    });
    
    let cartItem;
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > availableStock) {
        return NextResponse.json(
          { success: false, error: 'Cannot add more than available stock' },
          { status: 400 }
        );
      }
      
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variantId,
          quantity,
        },
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      data: cartItem,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { itemId, quantity } = body;
    
    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Item ID and quantity are required' },
        { status: 400 }
      );
    }
    
    // Get cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: session.user.id },
      include: { product: true },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    if (quantity <= 0) {
      // Remove item
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({
        success: true,
        message: 'Item removed from cart',
      });
    }
    
    // Check stock
    if (quantity > cartItem.product.stockQuantity) {
      return NextResponse.json(
        { success: false, error: 'Not enough stock available' },
        { status: 400 }
      );
    }
    
    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        variant: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart or clear cart
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
    const itemId = searchParams.get('itemId');
    const clearAll = searchParams.get('clearAll') === 'true';
    
    if (clearAll) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id },
      });
      return NextResponse.json({
        success: true,
        message: 'Cart cleared',
      });
    }
    
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    await prisma.cartItem.deleteMany({
      where: { id: itemId, userId: session.user.id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
