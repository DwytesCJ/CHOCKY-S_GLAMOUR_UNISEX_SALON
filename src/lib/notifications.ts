import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

export async function createOrderNotification(
  userId: string,
  orderNumber: string,
  status: string,
  orderId?: string
) {
  const statusMessages: Record<string, { type: NotificationType; title: string; message: string }> = {
    PENDING: {
      type: 'ORDER_PLACED',
      title: 'Order Placed Successfully',
      message: `Your order ${orderNumber} has been placed and is awaiting confirmation.`,
    },
    CONFIRMED: {
      type: 'ORDER_PLACED',
      title: 'Order Confirmed',
      message: `Your order ${orderNumber} has been confirmed and is being prepared.`,
    },
    PROCESSING: {
      type: 'ORDER_PLACED',
      title: 'Order Being Processed',
      message: `Your order ${orderNumber} is now being processed.`,
    },
    SHIPPED: {
      type: 'ORDER_SHIPPED',
      title: 'Order Shipped',
      message: `Your order ${orderNumber} has been shipped! Track your delivery in your account.`,
    },
    OUT_FOR_DELIVERY: {
      type: 'ORDER_SHIPPED',
      title: 'Out for Delivery',
      message: `Your order ${orderNumber} is out for delivery and will arrive soon!`,
    },
    DELIVERED: {
      type: 'ORDER_DELIVERED',
      title: 'Order Delivered',
      message: `Your order ${orderNumber} has been delivered. Enjoy your purchase!`,
    },
    CANCELLED: {
      type: 'SYSTEM',
      title: 'Order Cancelled',
      message: `Your order ${orderNumber} has been cancelled. Contact support for details.`,
    },
  };

  const info = statusMessages[status];
  if (!info) return null;

  return createNotification({
    userId,
    type: info.type,
    title: info.title,
    message: info.message,
    link: orderId ? `/account/orders/${orderId}` : '/account/orders',
  });
}

export async function createAppointmentNotification(
  userId: string,
  appointmentNumber: string,
  status: string,
  serviceName: string,
  appointmentId?: string
) {
  const statusMessages: Record<string, { type: NotificationType; title: string; message: string }> = {
    CONFIRMED: {
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Appointment Confirmed',
      message: `Your appointment ${appointmentNumber} for ${serviceName} has been confirmed.`,
    },
    REMINDER: {
      type: 'APPOINTMENT_REMINDER',
      title: 'Appointment Reminder',
      message: `Reminder: Your appointment ${appointmentNumber} for ${serviceName} is coming up soon!`,
    },
    CANCELLED: {
      type: 'SYSTEM',
      title: 'Appointment Cancelled',
      message: `Your appointment ${appointmentNumber} for ${serviceName} has been cancelled.`,
    },
    COMPLETED: {
      type: 'SYSTEM',
      title: 'Appointment Completed',
      message: `Thank you for visiting! Your appointment for ${serviceName} is complete.`,
    },
  };

  const info = statusMessages[status];
  if (!info) return null;

  return createNotification({
    userId,
    type: info.type,
    title: info.title,
    message: info.message,
    link: appointmentId ? `/account/appointments` : '/account',
  });
}
