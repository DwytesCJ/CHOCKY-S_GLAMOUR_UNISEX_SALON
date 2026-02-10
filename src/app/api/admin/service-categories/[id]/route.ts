import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, sortOrder, isActive } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const existing = await prisma.serviceCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Service category not found' }, { status: 404 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const slugConflict = await prisma.serviceCategory.findFirst({
      where: { slug, NOT: { id } },
    });
    if (slugConflict) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
    }

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        sortOrder: sortOrder ?? existing.sortOrder,
        isActive: isActive ?? existing.isActive,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Error updating service category:', error);
    return NextResponse.json({ error: 'Failed to update service category' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const serviceCount = await prisma.salonService.count({
      where: { categoryId: id },
    });

    if (serviceCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${serviceCount} service(s) are using this category. Reassign them first.` },
        { status: 400 }
      );
    }

    await prisma.serviceCategory.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Service category deleted' });
  } catch (error) {
    console.error('Error deleting service category:', error);
    return NextResponse.json({ error: 'Failed to delete service category' }, { status: 500 });
  }
}
