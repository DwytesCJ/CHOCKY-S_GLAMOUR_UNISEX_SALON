import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isStaff } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/products - Get all products (Admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !isStaff(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const lowStock = searchParams.get('lowStock') === 'true';
    
    const where: any = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }
    
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (status === 'featured') where.isFeatured = true;
    if (status === 'sale') where.isOnSale = true;
    
    if (lowStock) {
      where.stockQuantity = { lte: 5 };
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { reviews: true, orderItems: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: products.map((product: any) => ({
        ...product,
        image: product.images[0]?.url,
        reviewCount: product._count.reviews,
        orderCount: product._count.orderItems,
        images: undefined,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product (Admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !isStaff(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
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
    
    // Validate required fields
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }
    
    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: baseSlug },
    });
    
    const slug = existingProduct ? `${baseSlug}-${Date.now()}` : baseSlug;
    
    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku: sku || `SKU-${Date.now()}`,
        description,
        shortDescription,
        price,
        compareAtPrice,
        costPrice,
        categoryId,
        brandId,
        stockQuantity: stockQuantity || 0,
        lowStockThreshold: lowStockThreshold || 5,
        weight,
        dimensions: dimensions ? JSON.stringify(dimensions) : null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isNewArrival: isNewArrival ?? true,
        isBestseller: isBestseller ?? false,
        isOnSale: isOnSale ?? false,
        saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || shortDescription,
        tags,
        images: images?.length > 0 ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || name,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        } : undefined,
      },
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'PRODUCT_CREATED',
        entity: 'product',
        entityId: product.id,
        details: JSON.stringify({ name: product.name, sku: product.sku }),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
