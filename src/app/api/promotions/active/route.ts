import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/promotions/active - Get currently active promotions (public)
export async function GET() {
  try {
    const now = new Date();

    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: 'asc' },
    });

    // Get all product IDs from active promotions
    const allProductIds: string[] = [];
    for (const promo of promotions) {
      try {
        const ids = JSON.parse(promo.productIds) as string[];
        allProductIds.push(...ids);
      } catch { /* skip invalid JSON */ }
    }

    // Fetch all products at once
    const products = allProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: [...new Set(allProductIds)] }, isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            images: { take: 1, select: { url: true } },
            category: { select: { name: true } },
            averageRating: true,
            reviewCount: true,
          },
        })
      : [];

    const productMap = new Map(products.map(p => [p.id, p]));

    const result = promotions.map(promo => {
      let ids: string[] = [];
      try { ids = JSON.parse(promo.productIds); } catch { /* skip */ }
      const promoProducts = ids
        .map(id => productMap.get(id))
        .filter(Boolean)
        .map(p => ({
          id: p!.id,
          name: p!.name,
          slug: p!.slug,
          price: Number(p!.price),
          originalPrice: p!.compareAtPrice ? Number(p!.compareAtPrice) : undefined,
          image: p!.images[0]?.url || '/images/placeholder.jpg',
          category: p!.category?.name || 'Beauty',
          rating: p!.averageRating || 0,
          reviews: p!.reviewCount || 0,
        }));

      return {
        id: promo.id,
        name: promo.name,
        description: promo.description,
        type: promo.type,
        discountPct: promo.discountPct,
        endDate: promo.endDate.toISOString(),
        products: promoProducts,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch promotions' }, { status: 500 });
  }
}
