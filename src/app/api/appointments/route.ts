import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
    
    const where: any = { userId: session.user.id };
    
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
      stylistId,
      date,
      appointmentTime,
      notes,
      customerName,
      customerEmail,
      customerPhone,
    } = body;
    
    // Validate required fields
    if (!serviceId || !date || !appointmentTime) {
      return NextResponse.json(
        { success: false, error: 'Service, date, and time are required' },
        { status: 400 }
      );
    }
    
    // Get service details
    const service = await prisma.salonService.findUnique({
      where: { id: serviceId },
    });
    
    if (!service || !service.isActive) {
      return NextResponse.json(
        { success: false, error: 'Service not found or unavailable' },
        { status: 404 }
      );
    }
    
    // Parse appointment datetime
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    
    // Check if the time slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        stylistId: stylistId || undefined,
        date: dateTime,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
    
    if (existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked' },
        { status: 400 }
      );
    }
    
    // Calculate end time based on service duration
    const endTime = new Date(dateTime);
    endTime.setMinutes(endTime.getMinutes() + service.duration);
    
    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        appointmentNumber: generateAppointmentNumber(),
        userId: session?.user?.id as string,
        serviceId,
        stylistId,
        date: dateTime,
        startTime: appointmentTime,
        endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
        totalAmount: Number(service.price),
        status: 'PENDING',
        notes,
      },
      include: {
        service: true,
        stylist: true,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session?.user?.id,
        action: 'APPOINTMENT_CREATED',
        entity: 'appointment',
        entityId: appointment.id,
        details: JSON.stringify({
          appointmentNumber: appointment.appointmentNumber,
          service: service.name,
          date: dateTime.toISOString(),
        }),
      },
    });
    
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
