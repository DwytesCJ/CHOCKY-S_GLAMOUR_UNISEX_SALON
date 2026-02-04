import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/salon/services - Get all salon services grouped by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const grouped = searchParams.get('grouped') === 'true';
    
    if (grouped) {
      // Get services grouped by category
      const categories = await prisma.serviceCategory.findMany({
        where: { isActive: true },
        include: {
          services: {
            where: { isActive: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });
      
      return NextResponse.json({
        success: true,
        data: categories.map(cat => ({
          id: cat.id,
          category: cat.name,
          icon: cat.icon,
          items: cat.services.map(service => ({
            id: service.id,
            name: service.name,
            price: Number(service.price),
            duration: `${Math.floor(service.duration / 60)} ${Math.floor(service.duration / 60) === 1 ? 'hour' : 'hours'}${service.duration % 60 ? ` ${service.duration % 60} mins` : ''}`,
            description: service.description || '',
          })),
        })),
      });
    }
    
    // Get all services or filter by category
    const where: any = { isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    const services = await prisma.salonService.findMany({
      where,
      include: {
        category: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error('Error fetching salon services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
