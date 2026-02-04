const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function checkImagePaths() {
  const prisma = new PrismaClient();
  
  try {
    const images = await prisma.productImage.findMany({
      include: {
        product: {
          select: { name: true, slug: true }
        }
      }
    });
    
    console.log('Current Product Images:');
    images.forEach((img, index) => {
      console.log(`${index + 1}. ${img.product.name}: ${img.url}`);
    });
    
    console.log('\nChecking file existence:');
    images.forEach(img => {
      const fullPath = path.join(process.cwd(), 'public', img.url);
      const exists = fs.existsSync(fullPath);
      console.log(`${img.url}: ${exists ? '✅ Found' : '❌ Missing'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImagePaths();