import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products - Get all products with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Filtering
    const categorySlug = searchParams.get('category');
    const brandSlug = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const newArrivals = searchParams.get('newArrivals');
    const onSale = searchParams.get('onSale');
    const bestseller = searchParams.get('bestseller');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build where clause
    const where: any = {
      isActive: true,
    };
    
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    
    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }
    
    if (featured === 'true') where.isFeatured = true;
    if (newArrivals === 'true') where.isNewArrival = true;
    if (onSale === 'true') where.isOnSale = true;
    if (bestseller === 'true') where.isBestseller = true;
    
    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'rating') {
      orderBy.reviews = { _count: sortOrder };
    } else {
      orderBy.createdAt = sortOrder;
    }
    
    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 3 },
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true, wishlistItems: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    
    // Calculate average ratings
    const productsWithRatings = products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;
      
      return {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: product._count.reviews,
        wishlistCount: product._count.wishlistItems,
        reviews: undefined,
        _count: undefined,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
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

// POST /api/products - Create a new product (Admin only)
export async function POST(request: NextRequest) {
  try {
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
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });
    
    const finalSlug = existingProduct ? `${slug}-${Date.now()}` : slug;
    
    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        sku,
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
        isNewArrival: isNewArrival ?? false,
        isBestseller: isBestseller ?? false,
        isOnSale: isOnSale ?? false,
        saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
        metaTitle,
        metaDescription,
        tags,
        images: images ? {
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
        action: 'PRODUCT_CREATED',
        entity: 'product',
        entityId: product.id,
        details: JSON.stringify({ name: product.name, sku: product.sku }),
      },
    });
    
    return NextResponse.json({
      success: true,
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
