import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch single FAQ
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const faq = await prisma.fAQ.findUnique({ where: { id } });

    if (!faq) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 });
  }
}

// PUT - Update a FAQ
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { question, answer, category, sortOrder, isActive } = body;

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(question !== undefined && { question }),
        ...(answer !== undefined && { answer }),
        ...(category !== undefined && { category }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

// DELETE - Delete a FAQ
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.fAQ.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
