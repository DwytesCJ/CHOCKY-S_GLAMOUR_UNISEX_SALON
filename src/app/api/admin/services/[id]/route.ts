import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session || !session.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = await prisma.salonService.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        appointments: {
          select: {
            id: true,
            appointmentNumber: true,
            date: true,
            status: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);

  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session || !session.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, categoryId, price, duration, image, isActive } = body;

    // Validate required fields
    if (!name || !categoryId || !price || !duration) {
      return NextResponse.json(
        { error: 'Name, category, price, and duration are required' },
        { status: 400 }
      );
    }

    const service = await prisma.salonService.findUnique({
      where: { id }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Generate new slug if name changed
    let slug = service.slug;
    if (name !== service.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Check if new slug already exists (excluding current service)
      const existingService = await prisma.salonService.findFirst({
        where: {
          slug,
          NOT: { id }
        }
      });

      if (existingService) {
        return NextResponse.json(
          { error: 'Service with this name already exists' },
          { status: 400 }
        );
      }
    }

    const updatedService = await prisma.salonService.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        categoryId,
        price: new Prisma.Decimal(price),
        duration,
        image,
        isActive
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_SERVICE',
        entity: 'SalonService',
        entityId: id,
        details: `Updated service: ${updatedService.name}`
      }
    });

    return NextResponse.json(updatedService);

  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session || !session.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = await prisma.salonService.findUnique({
      where: { id },
      include: {
        appointments: true
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if service has appointments
    if (service.appointments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete service with existing appointments. Cancel or reschedule appointments first.' },
        { status: 400 }
      );
    }

    await prisma.salonService.delete({
      where: { id }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_SERVICE',
        entity: 'SalonService',
        entityId: id,
        details: `Deleted service: ${service.name}`
      }
    });

    return NextResponse.json({ message: 'Service deleted successfully' });

  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}