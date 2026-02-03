import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/blog/[slug] - Get a single blog post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [{ id: slug }, { slug }],
        status: 'PUBLISHED',
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        comments: {
          where: { isApproved: true, parentId: null },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
            replies: {
              where: { isApproved: true },
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, avatar: true },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { comments: true, likes: true } },
      },
    });
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
    
    // Get related posts
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        categoryId: post.categoryId,
        id: { not: post.id },
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ...post,
        author: {
          id: post.authorId,
          name: post.authorName,
          avatar: post.authorImage,
          bio: '', // Bio not available in simplified author model
        },
        commentCount: post._count.comments,
        likeCount: post._count.likes,
        readTime: '5 min read', // Missing in schema
        relatedPosts,
        _count: undefined,
      },
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
