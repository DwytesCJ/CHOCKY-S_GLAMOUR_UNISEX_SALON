import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch all active FAQs (public)
export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });

    // Group by category
    const grouped: Record<string, typeof faqs> = {};
    faqs.forEach((faq) => {
      const cat = faq.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(faq);
    });

    return NextResponse.json({ success: true, data: { faqs, grouped } });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ success: true, data: { faqs: [], grouped: {} } });
  }
}
