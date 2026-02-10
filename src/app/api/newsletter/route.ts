import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/newsletter - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: true, message: 'You are already subscribed!' },
          { status: 200 }
        );
      }
      // Re-subscribe
      await prisma.newsletterSubscriber.update({
        where: { email: email.toLowerCase() },
        data: { isActive: true },
      });
      return NextResponse.json({
        success: true,
        message: 'Welcome back! You have been re-subscribed.',
      });
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: { email: email.toLowerCase() },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! Welcome to the Glamour Club.',
    }, { status: 201 });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
