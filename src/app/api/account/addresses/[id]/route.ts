import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const body = await request.json();
    if (body.isDefault) {
      await prisma.address.updateMany({ where: { userId: user.id, id: { not: id } }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({
      where: { id },
      data: { type: body.type, firstName: body.firstName, lastName: body.lastName, phone: body.phone, addressLine1: body.addressLine1, addressLine2: body.addressLine2 || null, city: body.city, district: body.district, country: body.country, postalCode: body.postalCode || null, isDefault: body.isDefault || false },
    });
    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
