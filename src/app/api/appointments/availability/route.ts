import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/appointments/availability?date=YYYY-MM-DD&stylistId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const stylistId = searchParams.get('stylistId');

    if (!date) {
      return NextResponse.json({ success: false, error: 'Date required' }, { status: 400 });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const where: any = {
      date: { gte: dayStart, lte: dayEnd },
      status: { in: ['PENDING', 'CONFIRMED'] },
    };

    if (stylistId && stylistId !== 'none') {
      where.stylistId = stylistId;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      select: { startTime: true, endTime: true, stylistId: true },
    });

    // Return booked time ranges
    const bookedSlots = appointments.map(a => ({
      start: a.startTime || '',
      end: a.endTime || '',
      stylistId: a.stylistId,
    }));

    return NextResponse.json({ success: true, data: { bookedSlots } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
