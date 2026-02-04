const { PrismaClient } = require('@prisma/client');

async function getDetailedInfo() {
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.user.findMany();
    console.log('ALL USERS:');
    users.forEach(u => {
      console.log(u.firstName + ' ' + u.lastName + ' - ' + u.email + ' - ' + u.role);
    });
    
    const products = await prisma.product.findMany({ include: { category: true } });
    console.log('\nALL PRODUCTS:');
    products.forEach(p => {
      console.log(p.name + ' - ' + (p.category?.name || 'No Category') + ' - UGX ' + p.price + ' - Stock: ' + p.stockQuantity);
    });
    
    const categories = await prisma.category.findMany();
    console.log('\nALL CATEGORIES:');
    categories.forEach(c => {
      console.log(c.name + ' (' + c.slug + ')');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getDetailedInfo();