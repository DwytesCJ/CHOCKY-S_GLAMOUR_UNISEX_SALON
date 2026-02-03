import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/blog - Get all blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    
    const where: any = {
      isPublished: true,
      publishedAt: { lte: new Date() },
    };
    
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }
    
    if (featured) {
      where.isFeatured = true;
    }
    
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);
    
    const postsWithMeta = posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      author: {
        id: post.author.id,
        name: `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim(),
        avatar: post.author.avatar,
      },
      category: post.category,
      publishedAt: post.publishedAt,
      readTime: post.readTime,
      isFeatured: post.isFeatured,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
    }));
    
    return NextResponse.json({
      success: true,
      data: postsWithMeta,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
