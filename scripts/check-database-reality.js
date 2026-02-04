const { PrismaClient } = require('@prisma/client');

async function checkDatabaseReality() {
  const prisma = new PrismaClient();
  
  try {
    // Check actual database counts
    const [
      userCount,
      orderCount,
      appointmentCount,
      productCount,
      categoryCount,
      reviewCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.appointment.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.review.count()
    ]);
    
    console.log('=== DATABASE REALITY CHECK ===');
    console.log('Users: ' + userCount);
    console.log('Orders: ' + orderCount);
    console.log('Appointments: ' + appointmentCount);
    console.log('Products: ' + productCount);
    console.log('Categories: ' + categoryCount);
    console.log('Reviews: ' + reviewCount);
    
    // Check actual appointment statuses
    const appointmentStatuses = await prisma.appointment.groupBy({
      by: ['status'],
      _count: true
    });
    console.log('\nAppointment Status Distribution:');
    appointmentStatuses.forEach(status => {
      console.log('  ' + status.status + ': ' + status._count);
    });
    
    // Check actual order statuses
    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      _count: true
    });
    console.log('\nOrder Status Distribution:');
    orderStatuses.forEach(status => {
      console.log('  ' + status.status + ': ' + status._count);
    });
    
    // Sample actual data
    console.log('\n=== SAMPLE ACTUAL DATA ===');
    
    const sampleUsers = await prisma.user.findMany({ take: 3 });
    console.log('Sample Users:');
    sampleUsers.forEach(u => {
      console.log('  ' + u.firstName + ' ' + u.lastName + ' (' + u.email + ') - Role: ' + u.role);
    });
    
    const sampleProducts = await prisma.product.findMany({ 
      take: 3,
      include: { category: true }
    });
    console.log('\nSample Products:');
    sampleProducts.forEach(p => {
      console.log('  ' + p.name + ' - ' + (p.category?.name || 'No Category') + ' - UGX ' + p.price);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseReality();