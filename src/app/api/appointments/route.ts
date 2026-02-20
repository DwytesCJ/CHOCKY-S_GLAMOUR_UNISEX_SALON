import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isStaff } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Generate unique appointment number
function generateAppointmentNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `APT-${timestamp}-${random}`;
}

// GET /api/appointments - Get user's appointments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';
    
    const where: any = {};
    
    // Admin/staff see all appointments; regular users see only their own
    const userRole = (session.user as any).role || '';
    if (!isStaff(userRole)) {
      where.userId = session.user.id;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (upcoming) {
      where.date = { gte: new Date() };
      where.status = { in: ['PENDING', 'CONFIRMED'] };
    }
    
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: {
          include: {
            category: true,
          },
        },
        stylist: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { date: upcoming ? 'asc' : 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const {
      serviceId,
      serviceIds,
      stylistId,
      date,
      appointmentTime,
      notes,
      customerName,
      customerEmail,
      customerPhone,
      contactName,
      contactEmail,
      contactPhone,
      totalDuration: clientTotalDuration,
      totalAmount: clientTotalAmount,
    } = body;

    // Support both field naming conventions
    const finalName = contactName || customerName || '';
    const finalEmail = contactEmail || customerEmail || '';
    const finalPhone = contactPhone || customerPhone || '';
    
    // Validate required fields
    const primaryServiceId = serviceId || (serviceIds && serviceIds[0]);
    if (!primaryServiceId || !date || !appointmentTime) {
      return NextResponse.json(
        { success: false, error: 'Service, date, and time are required' },
        { status: 400 }
      );
    }
    
    // Get service details - try DB first, fall back to client-provided data
    const service = await prisma.salonService.findUnique({
      where: { id: primaryServiceId },
    });
    
    // If service not found in DB (e.g. fallback IDs), use client-provided data
    const serviceDuration = service?.duration || clientTotalDuration || 60;
    const servicePrice = service ? Number(service.price) : (clientTotalAmount || 0);
    const serviceName = service?.name || 'Salon Service';
    
    // For multi-service: calculate total duration and price
    let finalDuration = serviceDuration;
    let finalPrice = servicePrice;
    
    if (serviceIds && serviceIds.length > 1) {
      const dbServices = await prisma.salonService.findMany({
        where: { id: { in: serviceIds } },
      });
      
      if (dbServices.length > 0) {
        finalDuration = dbServices.reduce((sum, s) => sum + s.duration, 0);
        finalPrice = dbServices.reduce((sum, s) => sum + Number(s.price), 0);
      } else {
        // Use client-provided totals for fallback services
        finalDuration = clientTotalDuration || 60;
        finalPrice = clientTotalAmount || 0;
      }
    }
    
    // Parse appointment datetime
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    
    // Check for time range overlap conflicts
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const endTime24 = new Date(dateTime);
    endTime24.setMinutes(endTime24.getMinutes() + finalDuration);
    const newStart = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const newEnd = `${endTime24.getHours().toString().padStart(2, '0')}:${endTime24.getMinutes().toString().padStart(2, '0')}`;

    // Build conflict query - check same day, overlapping times
    const conflictWhere: any = {
      date: { gte: dayStart, lte: dayEnd },
      status: { in: ['PENDING', 'CONFIRMED'] },
    };
    
    // If stylist selected, check that stylist's schedule
    if (stylistId && stylistId !== 'none') {
      conflictWhere.stylistId = stylistId;
    }

    const existingAppointments = await prisma.appointment.findMany({
      where: conflictWhere,
      select: { id: true, startTime: true, endTime: true, stylistId: true },
    });

    // Check for time overlap
    const hasConflict = existingAppointments.some(apt => {
      const aptStart = apt.startTime || '00:00';
      const aptEnd = apt.endTime || '23:59';
      // Overlap: newStart < aptEnd AND newEnd > aptStart
      return newStart < aptEnd && newEnd > aptStart;
    });

    if (hasConflict) {
      return NextResponse.json(
        { success: false, error: 'This time slot conflicts with an existing appointment. Please choose a different time.' },
        { status: 400 }
      );
    }
    
    // Build appointment data
    const appointmentData: any = {
      appointmentNumber: generateAppointmentNumber(),
      date: dateTime,
      startTime: newStart,
      endTime: newEnd,
      totalAmount: finalPrice,
      status: 'PENDING',
      notes: notes || '',
      contactName: finalName,
      contactEmail: finalEmail,
      contactPhone: finalPhone,
    };

    // Only set serviceId if the service exists in DB
    if (service) {
      appointmentData.serviceId = primaryServiceId;
    }
    
    // Store multi-service info in notes if multiple services selected
    if (serviceIds && serviceIds.length > 1) {
      const dbServices = await prisma.salonService.findMany({
        where: { id: { in: serviceIds } },
        select: { name: true },
      });
      if (dbServices.length > 0) {
        const serviceNames = dbServices.map(s => s.name).join(', ');
        appointmentData.notes = `Services: ${serviceNames}${notes ? '. ' + notes : ''}`;
      }
    }

    // Link to user if authenticated
    if (session?.user?.id) {
      appointmentData.userId = session.user.id;
    }

    // Only set stylistId if it's a valid value (not 'none')
    if (stylistId && stylistId !== 'none') {
      appointmentData.stylistId = stylistId;
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: appointmentData,
      include: {
        service: true,
        stylist: true,
      },
    });
    
    // Log activity (only if user is authenticated)
    if (session?.user?.id) {
      try {
        await prisma.activityLog.create({
          data: {
            userId: session.user.id,
            action: 'APPOINTMENT_CREATED',
            entity: 'appointment',
            entityId: appointment.id,
            details: JSON.stringify({
              appointmentNumber: appointment.appointmentNumber,
              service: serviceName,
              date: dateTime.toISOString(),
            }),
          },
        });
      } catch { /* ignore activity log errors */ }
    }
    
    // TODO: Send confirmation email/SMS
    
    return NextResponse.json({
      success: true,
      data: appointment,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
