import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/categories - Get all active categories with hierarchy
export async function GET() {
  try {
    // Fetch all active categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        icon: true,
        parentId: true,
        sortOrder: true,
      },
    });

    // Organize into parent-child structure
    const parentCategories = categories.filter(cat => !cat.parentId);
    const childCategories = categories.filter(cat => cat.parentId);

    // Build hierarchy
    const categoriesWithChildren = parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => child.parentId === parent.id),
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithChildren,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
