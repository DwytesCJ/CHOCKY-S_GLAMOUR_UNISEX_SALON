import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function addProductImages() {
  try {
    console.log('Starting image addition process...');
    
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true
      },
      orderBy: { name: 'asc' }
    });
    
    // Get all categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
    
    console.log(`Found ${products.length} products and ${categories.length} categories`);
    
    // Map category slugs to folder names
    const categoryFolderMap: Record<string, string> = {
      'hair-styling': 'hair',
      'makeup': 'makeup',
      'skincare': 'skincare',
      'perfumes': 'perfumes',
      'jewelry': 'jewelry',
      'bags': 'bags'
    };
    
    // Get available images for each category
    const categoryImages: Record<string, string[]> = {};
    
    for (const [categorySlug, folderName] of Object.entries(categoryFolderMap)) {
      const folderPath = path.join(process.cwd(), 'public', 'images', 'products', folderName);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath).filter(file => 
          file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
        );
        categoryImages[categorySlug] = files;
        console.log(`Found ${files.length} images for category ${categorySlug} in ${folderName}/`);
      }
    }
    
    // Add images to products
    let imageCount = 0;
    const usedImages = new Set<string>();
    
    for (const product of products) {
      const category = categories.find(c => c.id === product.categoryId);
      if (!category) continue;
      
      const folderName = categoryFolderMap[category.slug];
      const availableImages = categoryImages[category.slug];
      
      if (!folderName || !availableImages || availableImages.length === 0) {
        console.log(`No images found for category: ${category.name}`);
        continue;
      }
      
      // Check if product already has images
      const existingImages = await prisma.productImage.findMany({
        where: { productId: product.id }
      });
      
      if (existingImages.length > 0) {
        console.log(`Product ${product.name} already has ${existingImages.length} images, skipping...`);
        continue;
      }
      
      // Assign images to product (1-3 images per product)
      const numImages = Math.min(3, availableImages.length);
      const imagesToAdd = [];
      
      for (let i = 0; i < numImages; i++) {
        // Find an unused image
        let imageFile: string | undefined;
        let attempts = 0;
        
        while (attempts < availableImages.length) {
          const randomIndex = Math.floor(Math.random() * availableImages.length);
          const candidateImage = availableImages[randomIndex];
          
          if (!usedImages.has(candidateImage)) {
            imageFile = candidateImage;
            usedImages.add(candidateImage);
            break;
          }
          attempts++;
        }
        
        // If all images are used, pick any available one
        if (!imageFile) {
          imageFile = availableImages[Math.floor(Math.random() * availableImages.length)];
        }
        
        imagesToAdd.push({
          productId: product.id,
          url: `/images/products/${folderName}/${imageFile}`,
          alt: `${product.name} - Image ${i + 1}`,
          sortOrder: i,
          isPrimary: i === 0
        });
      }
      
      // Add images to database
      if (imagesToAdd.length > 0) {
        await prisma.productImage.createMany({
          data: imagesToAdd
        });
        
        imageCount += imagesToAdd.length;
        console.log(`Added ${imagesToAdd.length} images to product: ${product.name}`);
      }
    }
    
    console.log(`\n✅ Successfully added ${imageCount} images to ${products.length} products`);
    console.log(`📊 Images per category:`);
    
    for (const [categorySlug, images] of Object.entries(categoryImages)) {
      console.log(`  ${categorySlug}: ${images.length} available images`);
    }
    
  } catch (error) {
    console.error('Error adding product images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductImages();