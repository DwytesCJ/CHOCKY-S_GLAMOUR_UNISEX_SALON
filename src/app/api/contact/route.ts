import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/contact - Submit a contact inquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      subject,
      message,
      type = 'GENERAL',
    } = body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Create contact inquiry
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone,
        subject: subject || 'General Inquiry',
        message,
        status: 'NEW',
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CONTACT_INQUIRY_CREATED',
        entity: 'contact_inquiry',
        entityId: inquiry.id,
        details: JSON.stringify({ name, email, subject }),
      },
    });
    
    // TODO: Send notification email to admin
    // TODO: Send confirmation email to user
    
    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: { id: inquiry.id },
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting contact inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit your message. Please try again.' },
      { status: 500 }
    );
  }
}
