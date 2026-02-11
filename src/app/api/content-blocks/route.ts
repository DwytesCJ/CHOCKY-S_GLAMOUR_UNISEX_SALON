import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/content-blocks - Get content blocks (public)
// Query params: key, page, section, type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const page = searchParams.get('page');
    const section = searchParams.get('section');
    const type = searchParams.get('type');

    // If specific key requested, return single block
    if (key) {
      const block = await prisma.contentBlock.findUnique({
        where: { key },
      });

      // Return null with 200 if not found (allows frontend to use fallbacks gracefully)
      if (!block || !block.isActive) {
        return NextResponse.json({
          success: true,
          data: null,
        });
      }

      return NextResponse.json({
        success: true,
        data: block,
      });
    }

    // Build filter
    const where: any = { isActive: true };
    if (page) where.page = page;
    if (section) where.section = section;
    if (type) where.type = type;

    const blocks = await prisma.contentBlock.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: blocks,
    });
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content blocks' },
      { status: 500 }
    );
  }
}
