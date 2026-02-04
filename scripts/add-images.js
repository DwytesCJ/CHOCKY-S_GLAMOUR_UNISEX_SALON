const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function addImages() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Getting products...');
    const products = await prisma.product.findMany({
      select: { id: true, name: true, categoryId: true }
    });
    
    console.log('Getting categories...');
    const categories = await prisma.category.findMany({
      select: { id: true, slug: true }
    });
    
    console.log(`Found ${products.length} products`);
    
    // Simple mapping
    const catMap = {
      'hair-styling': 'hair',
      'makeup': 'makeup', 
      'skincare': 'skincare',
      'perfumes': 'perfumes',
      'jewelry': 'jewelry',
      'bags': 'bags'
    };
    
    let totalImages = 0;
    
    for (const product of products) {
      const category = categories.find(c => c.id === product.categoryId);
      if (!category) continue;
      
      const folder = catMap[category.slug];
      if (!folder) continue;
      
      const folderPath = path.join(process.cwd(), 'public', 'images', 'products', folder);
      if (!fs.existsSync(folderPath)) continue;
      
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg'));
      if (files.length === 0) continue;
      
      // Check if already has images
      const existing = await prisma.productImage.count({
        where: { productId: product.id }
      });
      
      if (existing > 0) {
        console.log(`Product ${product.name} already has images`);
        continue;
      }
      
      // Add one image
      const imagePath = `/images/products/${folder}/${files[0]}`;
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imagePath,
          alt: product.name,
          sortOrder: 0,
          isPrimary: true
        }
      });
      
      console.log(`Added image to: ${product.name}`);
      totalImages++;
    }
    
    console.log(`✅ Added ${totalImages} images`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addImages();