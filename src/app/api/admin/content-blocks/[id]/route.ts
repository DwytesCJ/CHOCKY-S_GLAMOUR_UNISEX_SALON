import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/content-blocks/[id] - Get a single content block
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const block = await prisma.contentBlock.findUnique({
      where: { id },
    });

    if (!block) {
      return NextResponse.json(
        { success: false, error: 'Content block not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: block,
    });
  } catch (error) {
    console.error('Error fetching content block:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content block' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/content-blocks/[id] - Update a content block
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { key, title, content, type, page, section, sortOrder, isActive, metadata } = body;

    // Check if block exists
    const existing = await prisma.contentBlock.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Content block not found' },
        { status: 404 }
      );
    }

    // If key is being changed, check for duplicates
    if (key && key !== existing.key) {
      const duplicate = await prisma.contentBlock.findUnique({
        where: { key },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'A content block with this key already exists' },
          { status: 400 }
        );
      }
    }

    const block = await prisma.contentBlock.update({
      where: { id },
      data: {
        ...(key && { key }),
        ...(title !== undefined && { title }),
        ...(content && { content }),
        ...(type && { type }),
        ...(page && { page }),
        ...(section !== undefined && { section }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(metadata !== undefined && { metadata: metadata ? JSON.stringify(metadata) : null }),
      },
    });

    return NextResponse.json({
      success: true,
      data: block,
    });
  } catch (error) {
    console.error('Error updating content block:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update content block' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/content-blocks/[id] - Delete a content block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if block exists
    const existing = await prisma.contentBlock.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Content block not found' },
        { status: 404 }
      );
    }

    await prisma.contentBlock.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Content block deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting content block:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete content block' },
      { status: 500 }
    );
  }
}
