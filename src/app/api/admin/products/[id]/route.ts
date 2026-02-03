import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isStaff } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

// GET /api/admin/products/[id] - Get product details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !isStaff(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        reviews: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { reviews: true, orderItems: true, wishlistItems: true } },
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !isStaff(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const body = await request.json();
    
    // Get current product
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    
    if (!currentProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    const {
      name,
      sku,
      description,
      shortDescription,
      price,
      compareAtPrice,
      costPrice,
      categoryId,
      brandId,
      stockQuantity,
      lowStockThreshold,
      weight,
      dimensions,
      isActive,
      isFeatured,
      isNewArrival,
      isBestseller,
      isOnSale,
      saleStartDate,
      saleEndDate,
      metaTitle,
      metaDescription,
      tags,
      images,
    } = body;
    
    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        description,
        shortDescription,
        price,
        compareAtPrice,
        costPrice,
        categoryId,
        brandId,
        stockQuantity,
        lowStockThreshold,
        weight,
        dimensions: dimensions ? JSON.stringify(dimensions) : undefined,
        isActive,
        isFeatured,
        isNewArrival,
        isBestseller,
        isOnSale,
        saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
        metaTitle,
        metaDescription,
        tags,
      },
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });
    
    // Update images if provided
    if (images && Array.isArray(images)) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });
      
      // Create new images
      await prisma.productImage.createMany({
        data: images.map((img: any, index: number) => ({
          productId: id,
          url: img.url,
          alt: img.alt || name,
          sortOrder: index,
          isPrimary: index === 0,
        })),
      });
    }
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'PRODUCT_UPDATED',
        entity: 'product',
        entityId: product.id,
        details: JSON.stringify({ name: product.name }),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !isStaff(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';
    
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    if (permanent) {
      // Permanently delete
      await prisma.product.delete({
        where: { id },
      });
    } else {
      // Soft delete
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
    }
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: permanent ? 'PRODUCT_DELETED_PERMANENT' : 'PRODUCT_DELETED',
        entity: 'product',
        entityId: id,
        details: JSON.stringify({ name: product.name }),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
