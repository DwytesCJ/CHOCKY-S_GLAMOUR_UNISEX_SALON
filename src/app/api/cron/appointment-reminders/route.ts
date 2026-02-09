import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAppointmentReminder } from '@/lib/email';
import { addDays, format } from 'date-fns';

// GET /api/cron/appointment-reminders
// Called by Vercel Cron daily at 8:00 AM EAT
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const tomorrow = addDays(now, 1);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

    // Find appointments for tomorrow that haven't been reminded yet
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(`${tomorrowStr}T00:00:00`),
          lt: new Date(`${tomorrowStr}T23:59:59`),
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
        reminderSentAt: null,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        service: { select: { name: true } },
        stylist: { select: { name: true } },
      },
    });

    let sentCount = 0;
    const errors: string[] = [];

    for (const apt of upcomingAppointments) {
      try {
        const customerName = `${(apt as any).user?.firstName || ''} ${(apt as any).user?.lastName || ''}`.trim() || 'Customer';
        const email = (apt as any).user?.email;
        
        if (!email) continue;

        // Send reminder email to customer
        await sendAppointmentReminder({
          customerName,
          email,
          serviceName: (apt as any).service?.name || 'Service',
          date: format(new Date(apt.date), 'EEEE, MMMM d, yyyy'),
          time: apt.startTime,
          stylist: (apt as any).stylist ? (apt as any).stylist.name : undefined,
        });

        // Mark reminder as sent
        await prisma.appointment.update({
          where: { id: apt.id },
          data: { reminderSentAt: new Date() },
        });

        // Create notification for user
        if (apt.userId) {
          await prisma.notification.create({
            data: {
              userId: apt.userId,
              type: 'APPOINTMENT_REMINDER',
              title: 'Appointment Tomorrow',
              message: `Reminder: Your ${(apt as any).service?.name || 'appointment'} is scheduled for tomorrow at ${apt.startTime}`,
              link: '/account/appointments',
            },
          });
        }

        sentCount++;
      } catch (err) {
        errors.push(`Failed for appointment ${apt.id}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reminder(s) out of ${upcomingAppointments.length} upcoming appointments`,
      sentCount,
      total: upcomingAppointments.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Cron appointment reminders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}
