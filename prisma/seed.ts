import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create Reward Tiers
  const bronzeTier = await prisma.rewardTier.upsert({
    where: { slug: 'bronze' },
    update: {},
    create: {
      name: 'Bronze',
      slug: 'bronze',
      minPoints: 0,
      pointsMultiplier: 1.0,
      benefits: JSON.stringify([
        'Earn 1 point per 1,000 UGX spent',
        'Birthday reward',
        'Member-only pricing',
      ]),
      color: '#CD7F32',
    },
  });

  const silverTier = await prisma.rewardTier.upsert({
    where: { slug: 'silver' },
    update: {},
    create: {
      name: 'Silver',
      slug: 'silver',
      minPoints: 500,
      pointsMultiplier: 1.25,
      benefits: JSON.stringify([
        'Earn 1.25 points per 1,000 UGX spent',
        'Free shipping on orders over 100,000 UGX',
        'Early access to sales',
        'Birthday reward',
      ]),
      color: '#C0C0C0',
    },
  });

  const goldTier = await prisma.rewardTier.upsert({
    where: { slug: 'gold' },
    update: {},
    create: {
      name: 'Gold',
      slug: 'gold',
      minPoints: 1500,
      pointsMultiplier: 1.5,
      benefits: JSON.stringify([
        'Earn 1.5 points per 1,000 UGX spent',
        'Free shipping on all orders',
        'VIP event access',
        'Exclusive products',
        'Priority customer service',
        'Birthday reward',
      ]),
      color: '#FFD700',
    },
  });

  console.log('Created reward tiers');

  // Create Admin User
  const adminPassword = await hash('Admin@123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@chockys.ug' },
    update: {},
    create: {
      email: 'admin@chockys.ug',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+256703878485',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log('Created admin user: admin@chockys.ug / Admin@123');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'hair-styling' },
      update: {},
      create: {
        name: 'Hair Styling',
        slug: 'hair-styling',
        description: 'Wigs, extensions, hair care products, and styling tools',
        image: '/images/categories/hair.jpg',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'jewelry-ornaments' },
      update: {},
      create: {
        name: 'Jewelry & Ornaments',
        slug: 'jewelry-ornaments',
        description: 'Earrings, necklaces, bracelets, rings, and jewelry sets',
        image: '/images/categories/jewelry.jpg',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'bags-accessories' },
      update: {},
      create: {
        name: 'Bags & Accessories',
        slug: 'bags-accessories',
        description: 'Handbags, clutches, tote bags, and wallets',
        image: '/images/categories/bags.jpg',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'perfumes-fragrances' },
      update: {},
      create: {
        name: 'Perfumes & Fragrances',
        slug: 'perfumes-fragrances',
        description: 'Women\'s perfumes, men\'s cologne, and gift sets',
        image: '/images/categories/perfumes.jpg',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'makeup' },
      update: {},
      create: {
        name: 'Makeup',
        slug: 'makeup',
        description: 'Face, eyes, lips, nails, and makeup tools',
        image: '/images/categories/makeup.jpg',
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'skincare' },
      update: {},
      create: {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Cleansers, moisturizers, serums, and treatments',
        image: '/images/categories/skincare.jpg',
        sortOrder: 6,
      },
    }),
  ]);

  console.log('Created categories');

  // Create Brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'chockys-exclusive' },
      update: {},
      create: {
        name: "CHOCKY'S Exclusive",
        slug: 'chockys-exclusive',
        description: 'Our exclusive in-house brand',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'maybelline' },
      update: {},
      create: {
        name: 'Maybelline',
        slug: 'maybelline',
        description: 'Maybe she\'s born with it',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'loreal' },
      update: {},
      create: {
        name: "L'Oreal Paris",
        slug: 'loreal',
        description: 'Because you\'re worth it',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'mac' },
      update: {},
      create: {
        name: 'MAC Cosmetics',
        slug: 'mac',
        description: 'Professional makeup artistry',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'fenty-beauty' },
      update: {},
      create: {
        name: 'Fenty Beauty',
        slug: 'fenty-beauty',
        description: 'Beauty for all',
      },
    }),
  ]);

  console.log('Created brands');

  // Create ALL Current Website Products
  const products = [
    // Featured Products from homepage
    {
      name: 'Luxury Matte Lipstick',
      slug: 'luxury-matte-lipstick',
      sku: 'LIP-001',
      description: 'Premium luxury matte lipstick with long-lasting formula and rich pigmentation. Available in multiple shades.',
      shortDescription: 'Long-lasting velvet matte finish lipstick',
      price: 45000,
      compareAtPrice: 65000,
      categoryId: categories[4].id, // Makeup
      brandId: brands[3].id, // MAC
      stockQuantity: 120,
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      isBestseller: false,
      isOnSale: true,
    },
    {
      name: 'HD Lace Front Wig',
      slug: 'hd-lace-front-wig',
      sku: 'WIG-001',
      description: 'High-definition lace front wig with natural hairline and premium human hair. Perfect for daily wear.',
      shortDescription: 'Natural-looking HD lace front wig',
      price: 450000,
      categoryId: categories[0].id, // Hair
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 25,
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
    },
    {
      name: 'Vitamin C Serum',
      slug: 'vitamin-c-serum',
      sku: 'SERUM-001',
      description: 'Potent Vitamin C serum with 20% concentration for brightening and anti-aging benefits. Dermatologist tested.',
      shortDescription: 'Brightening Vitamin C facial serum',
      price: 120000,
      categoryId: categories[5].id, // Skincare
      brandId: brands[2].id, // L'Oreal
      stockQuantity: 85,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isOnSale: false,
    },
    {
      name: 'Designer Handbag',
      slug: 'designer-handbag',
      sku: 'BAG-001',
      description: 'Elegant designer handbag crafted from premium materials with spacious interior and elegant hardware.',
      shortDescription: 'Premium leather designer handbag',
      price: 285000,
      compareAtPrice: 350000,
      categoryId: categories[2].id, // Bags
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 30,
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      isOnSale: true,
    },
    {
      name: 'Gold Hoop Earrings',
      slug: 'gold-hoop-earrings',
      sku: 'JWL-001',
      description: 'Beautiful gold-plated hoop earrings with classic design. Perfect for everyday wear or special occasions.',
      shortDescription: 'Classic gold hoop earrings',
      price: 75000,
      categoryId: categories[1].id, // Jewelry
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 60,
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      isBestseller: false,
    },
    {
      name: 'Luxury Perfume Set',
      slug: 'luxury-perfume-set',
      sku: 'PERF-001',
      description: 'Exclusive luxury perfume set featuring premium fragrances for women. Long-lasting and captivating scents.',
      shortDescription: 'Premium women\'s perfume collection',
      price: 185000,
      categoryId: categories[3].id, // Perfumes
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 45,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
    },
    {
      name: 'Foundation Kit',
      slug: 'foundation-kit',
      sku: 'MKP-001',
      description: 'Complete foundation kit with multiple shades and professional applicators. Buildable coverage for flawless finish.',
      shortDescription: 'Professional foundation makeup kit',
      price: 95000,
      categoryId: categories[4].id, // Makeup
      brandId: brands[1].id, // Maybelline
      stockQuantity: 90,
      isActive: true,
      isFeatured: false,
      isNewArrival: false,
      isBestseller: true,
    },
    {
      name: 'Braiding Hair Extensions',
      slug: 'braiding-hair-extensions',
      sku: 'HAIR-001',
      description: 'High-quality braiding hair extensions for stunning hairstyles. Easy to install and maintain.',
      shortDescription: 'Premium braiding hair extensions',
      price: 35000,
      categoryId: categories[0].id, // Hair
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 150,
      isActive: true,
      isFeatured: false,
      isNewArrival: false,
      isBestseller: true,
    },
    // Additional products to enrich the catalog
    {
      name: 'Diamond Stud Earrings',
      slug: 'diamond-stud-earrings',
      sku: 'JWL-002',
      description: 'Elegant diamond stud earrings with brilliant sparkle. Perfect for formal events and daily sophistication.',
      shortDescription: 'Sparkling diamond stud earrings',
      price: 150000,
      compareAtPrice: 180000,
      categoryId: categories[1].id, // Jewelry
      brandId: brands[4].id, // Fenty Beauty
      stockQuantity: 35,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isOnSale: true,
    },
    {
      name: 'Evening Clutch Bag',
      slug: 'evening-clutch-bag',
      sku: 'BAG-002',
      description: 'Sophisticated evening clutch with elegant design and premium materials. Perfect for special occasions.',
      shortDescription: 'Elegant evening clutch handbag',
      price: 95000,
      categoryId: categories[2].id, // Bags
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 40,
      isActive: true,
      isFeatured: false,
      isNewArrival: true,
    },
    {
      name: 'Men\'s Cologne Set',
      slug: 'mens-cologne-set',
      sku: 'PERF-002',
      description: 'Premium men\'s cologne collection with fresh and masculine fragrances. Long-lasting scent projection.',
      shortDescription: 'Premium men\'s fragrance collection',
      price: 165000,
      categoryId: categories[3].id, // Perfumes
      brandId: brands[2].id, // L'Oreal
      stockQuantity: 28,
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
    },
    {
      name: 'Eyeshadow Palette',
      slug: 'eyeshadow-palette',
      sku: 'MKP-002',
      description: 'Professional eyeshadow palette with 12 blendable shades. Highly pigmented with long-wearing formula.',
      shortDescription: '12-shade professional eyeshadow palette',
      price: 75000,
      categoryId: categories[4].id, // Makeup
      brandId: brands[3].id, // MAC
      stockQuantity: 75,
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
    },
    {
      name: 'Moisturizing Cream',
      slug: 'moisturizing-cream',
      sku: 'SKIN-002',
      description: 'Rich moisturizing cream with hyaluronic acid and ceramides. Provides 24-hour hydration for all skin types.',
      shortDescription: '24-hour hydrating face cream',
      price: 65000,
      categoryId: categories[5].id, // Skincare
      brandId: brands[2].id, // L'Oreal
      stockQuantity: 110,
      isActive: true,
      isFeatured: false,
      isNewArrival: true,
    },
    {
      name: 'Silk Scarf Collection',
      slug: 'silk-scarf-collection',
      sku: 'ACC-001',
      description: 'Luxurious silk scarves with elegant prints. Versatile accessory for fashion-forward individuals.',
      shortDescription: 'Premium silk scarf collection',
      price: 45000,
      categoryId: categories[2].id, // Bags (Accessories)
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 55,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
    },
  ];

  // Create products with images
  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });
    
    // Add primary image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `/images/products/${productData.slug.replace(/-/g, '_')}.jpg`,
        alt: productData.name,
        sortOrder: 0,
        isPrimary: true,
      },
    });
  }

  console.log('Created products');

  // Create Service Categories
  const serviceCategories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { slug: 'hair-services' },
      update: {},
      create: {
        name: 'Hair Services',
        slug: 'hair-services',
        description: 'Professional hair styling, coloring, and treatments',
        icon: 'fa-cut',
        sortOrder: 1,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'makeup-services' },
      update: {},
      create: {
        name: 'Makeup Services',
        slug: 'makeup-services',
        description: 'Professional makeup for all occasions',
        icon: 'fa-paint-brush',
        sortOrder: 2,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'skin-treatments' },
      update: {},
      create: {
        name: 'Skin Treatments',
        slug: 'skin-treatments',
        description: 'Facials, treatments, and skincare services',
        icon: 'fa-spa',
        sortOrder: 3,
      },
    }),
  ]);

  console.log('Created service categories');

  // Create Salon Services
  const services = [
    { name: 'Hair Styling', slug: 'hair-styling-service', price: 50000, duration: 60, categoryId: serviceCategories[0].id },
    { name: 'Hair Coloring', slug: 'hair-coloring', price: 150000, duration: 180, categoryId: serviceCategories[0].id },
    { name: 'Wig Installation', slug: 'wig-installation', price: 80000, duration: 90, categoryId: serviceCategories[0].id },
    { name: 'Braiding & Plaiting', slug: 'braiding-plaiting', price: 100000, duration: 240, categoryId: serviceCategories[0].id },
    { name: 'Bridal Makeup', slug: 'bridal-makeup', price: 250000, duration: 120, categoryId: serviceCategories[1].id },
    { name: 'Event Makeup', slug: 'event-makeup', price: 100000, duration: 60, categoryId: serviceCategories[1].id },
    { name: 'Classic Facial', slug: 'classic-facial', price: 80000, duration: 60, categoryId: serviceCategories[2].id },
    { name: 'Anti-Aging Facial', slug: 'anti-aging-facial', price: 120000, duration: 90, categoryId: serviceCategories[2].id },
  ];

  for (const service of services) {
    await prisma.salonService.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        name: service.name,
        slug: service.slug,
        price: service.price,
        duration: service.duration,
        categoryId: service.categoryId,
        description: `Professional ${service.name.toLowerCase()} service`,
        isActive: true,
      },
    });
  }

  console.log('Created salon services');

  // Create Testimonials
  const testimonials = [
    {
      name: 'Sarah Nakamya',
      title: 'Loyal Customer',
      image: '/images/testimonials/customer1.jpg',
      content: "CHOCKY'S has completely transformed my beauty routine. The quality of products is amazing!",
      rating: 5,
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: 'Grace Achieng',
      title: 'Bridal Client',
      image: '/images/testimonials/customer2.jpg',
      content: 'My wedding makeup was absolutely perfect! The team made me feel like a queen.',
      rating: 5,
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: 'Diana Opio',
      title: 'Regular Client',
      image: '/images/testimonials/customer3.jpg',
      content: 'I love the variety of products available. Everything is authentic and reasonably priced.',
      rating: 5,
      isActive: true,
      isFeatured: true,
      sortOrder: 3,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    });
  }

  console.log('Created testimonials');

  // Create Hero Banners
  const banners = [
    {
      title: 'Summer Beauty Sale',
      subtitle: 'Up to 50% off selected items',
      image: '/images/banners/summer-sale.jpg',
      link: '/shop',
      buttonText: 'Shop Now',
      position: 'hero',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'New Arrivals',
      subtitle: 'Discover our latest beauty essentials',
      image: '/images/banners/new-arrivals.jpg',
      link: '/shop?new=true',
      buttonText: 'Explore',
      position: 'hero',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Salon Services',
      subtitle: 'Professional beauty treatments',
      image: '/images/banners/salon-services.jpg',
      link: '/salon',
      buttonText: 'Book Now',
      position: 'hero',
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({
      data: banner,
    });
  }

  console.log('Created banners');

  // Create Site Settings
  const settings = [
    { key: 'business_name', value: "CHOCKY'S Ultimate Glamour Unisex Salon", type: 'text', group: 'general' },
    { key: 'business_address', value: 'Annex Building (Wandegeya), Kampala, Uganda', type: 'text', group: 'general' },
    { key: 'business_phone', value: '+256703878485', type: 'text', group: 'general' },
    { key: 'business_email', value: 'josephchandin@gmail.com', type: 'text', group: 'general' },
    { key: 'social_instagram', value: 'https://www.instagram.com/chockys_ultimate_glamour/', type: 'text', group: 'social' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Created site settings');

  // Create Blog Categories
  await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'tutorials' },
      update: {},
      create: { name: 'Tutorials', slug: 'tutorials' },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'beauty-tips' },
      update: {},
      create: { name: 'Beauty Tips', slug: 'beauty-tips' },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'trends' },
      update: {},
      create: { name: 'Trends', slug: 'trends' },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'skincare-blog' },
      update: {},
      create: { name: 'Skincare', slug: 'skincare-blog' },
    }),
  ]);

  console.log('Created blog categories');

  // Create FAQs
  const faqs = [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Mobile Money (MTN and Airtel), PayPal, and major credit/debit cards.',
      category: 'Payment',
      sortOrder: 1,
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery within Kampala takes 1-2 business days. Other areas in Uganda take 3-5 business days.',
      category: 'Shipping',
      sortOrder: 2,
    },
    {
      question: 'Can I return or exchange products?',
      answer: 'Yes, we accept returns within 7 days of delivery for unused products in original packaging.',
      category: 'Returns',
      sortOrder: 3,
    },
    {
      question: 'How do I book a salon appointment?',
      answer: 'You can book online through our website, call us, or send a WhatsApp message.',
      category: 'Appointments',
      sortOrder: 4,
    },
    {
      question: 'Are your products authentic?',
      answer: 'Yes, all our products are 100% authentic and sourced directly from authorized distributors.',
      category: 'Products',
      sortOrder: 5,
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    await prisma.fAQ.create({
      data: {
        ...faqs[i],
        isActive: true,
      },
    });
  }

  console.log('Created FAQs');

  console.log('');
  // ========================================
  // Seed Shipping Zones - Uganda Town Centers
  // ========================================
  console.log('Seeding shipping zones...');
  
  const shippingZones = [
    // Central Region
    { name: 'Kampala Central', district: 'Kampala', region: 'Central', distanceKm: 3, baseFee: 3000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Wandegeya', district: 'Kampala', region: 'Central', distanceKm: 0, baseFee: 0, perKgFee: 0, estimatedDays: 1 },
    { name: 'Ntinda', district: 'Kampala', region: 'Central', distanceKm: 5, baseFee: 5000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Nakasero', district: 'Kampala', region: 'Central', distanceKm: 3, baseFee: 3000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Kololo', district: 'Kampala', region: 'Central', distanceKm: 4, baseFee: 4000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Bukoto', district: 'Kampala', region: 'Central', distanceKm: 4, baseFee: 4000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Kamwokya', district: 'Kampala', region: 'Central', distanceKm: 2, baseFee: 2000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Makerere', district: 'Kampala', region: 'Central', distanceKm: 1, baseFee: 2000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Kawempe', district: 'Kampala', region: 'Central', distanceKm: 5, baseFee: 5000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Rubaga', district: 'Kampala', region: 'Central', distanceKm: 6, baseFee: 5000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Makindye', district: 'Kampala', region: 'Central', distanceKm: 8, baseFee: 7000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Nansana', district: 'Wakiso', region: 'Central', distanceKm: 12, baseFee: 8000, perKgFee: 600, estimatedDays: 1 },
    { name: 'Kira', district: 'Wakiso', region: 'Central', distanceKm: 12, baseFee: 8000, perKgFee: 600, estimatedDays: 1 },
    { name: 'Entebbe', district: 'Wakiso', region: 'Central', distanceKm: 37, baseFee: 15000, perKgFee: 700, estimatedDays: 1 },
    { name: 'Mukono Town', district: 'Mukono', region: 'Central', distanceKm: 24, baseFee: 12000, perKgFee: 600, estimatedDays: 1 },
    { name: 'Gayaza', district: 'Wakiso', region: 'Central', distanceKm: 16, baseFee: 10000, perKgFee: 600, estimatedDays: 1 },
    { name: 'Bweyogerere', district: 'Wakiso', region: 'Central', distanceKm: 10, baseFee: 7000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Kasangati', district: 'Wakiso', region: 'Central', distanceKm: 14, baseFee: 9000, perKgFee: 600, estimatedDays: 1 },
    { name: 'Mpigi Town', district: 'Mpigi', region: 'Central', distanceKm: 37, baseFee: 15000, perKgFee: 700, estimatedDays: 2 },
    { name: 'Masaka City', district: 'Masaka', region: 'Central', distanceKm: 130, baseFee: 25000, perKgFee: 800, estimatedDays: 2 },
    { name: 'Mityana Town', district: 'Mityana', region: 'Central', distanceKm: 70, baseFee: 18000, perKgFee: 700, estimatedDays: 2 },
    { name: 'Luweero Town', district: 'Luweero', region: 'Central', distanceKm: 75, baseFee: 18000, perKgFee: 700, estimatedDays: 2 },
    { name: 'Bombo', district: 'Luweero', region: 'Central', distanceKm: 36, baseFee: 15000, perKgFee: 700, estimatedDays: 1 },
    // Eastern Region
    { name: 'Jinja City', district: 'Jinja', region: 'Eastern', distanceKm: 80, baseFee: 20000, perKgFee: 800, estimatedDays: 2 },
    { name: 'Iganga Town', district: 'Iganga', region: 'Eastern', distanceKm: 115, baseFee: 23000, perKgFee: 800, estimatedDays: 2 },
    { name: 'Mbale City', district: 'Mbale', region: 'Eastern', distanceKm: 230, baseFee: 30000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Tororo Town', district: 'Tororo', region: 'Eastern', distanceKm: 250, baseFee: 32000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Soroti City', district: 'Soroti', region: 'Eastern', distanceKm: 300, baseFee: 35000, perKgFee: 1000, estimatedDays: 3 },
    { name: 'Busia Town', district: 'Busia', region: 'Eastern', distanceKm: 200, baseFee: 28000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Kamuli Town', district: 'Kamuli', region: 'Eastern', distanceKm: 140, baseFee: 25000, perKgFee: 800, estimatedDays: 2 },
    { name: 'Bugiri Town', district: 'Bugiri', region: 'Eastern', distanceKm: 165, baseFee: 27000, perKgFee: 800, estimatedDays: 3 },
    { name: 'Pallisa Town', district: 'Pallisa', region: 'Eastern', distanceKm: 220, baseFee: 30000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Kumi Town', district: 'Kumi', region: 'Eastern', distanceKm: 280, baseFee: 33000, perKgFee: 1000, estimatedDays: 3 },
    { name: 'Kapchorwa Town', district: 'Kapchorwa', region: 'Eastern', distanceKm: 280, baseFee: 35000, perKgFee: 1000, estimatedDays: 4 },
    // Western Region
    { name: 'Mbarara City', district: 'Mbarara', region: 'Western', distanceKm: 270, baseFee: 32000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Fort Portal City', district: 'Kabarole', region: 'Western', distanceKm: 300, baseFee: 35000, perKgFee: 1000, estimatedDays: 3 },
    { name: 'Kasese Town', district: 'Kasese', region: 'Western', distanceKm: 380, baseFee: 38000, perKgFee: 1000, estimatedDays: 4 },
    { name: 'Kabale Town', district: 'Kabale', region: 'Western', distanceKm: 420, baseFee: 40000, perKgFee: 1100, estimatedDays: 4 },
    { name: 'Bushenyi-Ishaka', district: 'Bushenyi', region: 'Western', distanceKm: 310, baseFee: 35000, perKgFee: 1000, estimatedDays: 3 },
    { name: 'Hoima City', district: 'Hoima', region: 'Western', distanceKm: 200, baseFee: 28000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Masindi Town', district: 'Masindi', region: 'Western', distanceKm: 215, baseFee: 29000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Kibale Town', district: 'Kibale', region: 'Western', distanceKm: 230, baseFee: 30000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Ntungamo Town', district: 'Ntungamo', region: 'Western', distanceKm: 370, baseFee: 37000, perKgFee: 1000, estimatedDays: 4 },
    { name: 'Rukungiri Town', district: 'Rukungiri', region: 'Western', distanceKm: 380, baseFee: 38000, perKgFee: 1000, estimatedDays: 4 },
    { name: 'Kisoro Town', district: 'Kisoro', region: 'Western', distanceKm: 480, baseFee: 45000, perKgFee: 1200, estimatedDays: 5 },
    { name: 'Mubende Town', district: 'Mubende', region: 'Western', distanceKm: 150, baseFee: 25000, perKgFee: 800, estimatedDays: 2 },
    { name: 'Kyenjojo Town', district: 'Kyenjojo', region: 'Western', distanceKm: 260, baseFee: 32000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Ibanda Town', district: 'Ibanda', region: 'Western', distanceKm: 290, baseFee: 33000, perKgFee: 1000, estimatedDays: 3 },
    // Northern Region
    { name: 'Gulu City', district: 'Gulu', region: 'Northern', distanceKm: 340, baseFee: 35000, perKgFee: 1000, estimatedDays: 4 },
    { name: 'Lira City', district: 'Lira', region: 'Northern', distanceKm: 340, baseFee: 35000, perKgFee: 1000, estimatedDays: 4 },
    { name: 'Arua City', district: 'Arua', region: 'Northern', distanceKm: 480, baseFee: 45000, perKgFee: 1200, estimatedDays: 5 },
    { name: 'Kitgum Town', district: 'Kitgum', region: 'Northern', distanceKm: 420, baseFee: 42000, perKgFee: 1100, estimatedDays: 5 },
    { name: 'Pader Town', district: 'Pader', region: 'Northern', distanceKm: 380, baseFee: 38000, perKgFee: 1000, estimatedDays: 4 },
    { name: 'Moyo Town', district: 'Moyo', region: 'Northern', distanceKm: 490, baseFee: 45000, perKgFee: 1200, estimatedDays: 5 },
    { name: 'Nebbi Town', district: 'Nebbi', region: 'Northern', distanceKm: 450, baseFee: 43000, perKgFee: 1100, estimatedDays: 5 },
    { name: 'Apac Town', district: 'Apac', region: 'Northern', distanceKm: 280, baseFee: 33000, perKgFee: 1000, estimatedDays: 4 },
    { name: 'Adjumani Town', district: 'Adjumani', region: 'Northern', distanceKm: 460, baseFee: 44000, perKgFee: 1200, estimatedDays: 5 },
    { name: 'Moroto Town', district: 'Moroto', region: 'Northern', distanceKm: 480, baseFee: 48000, perKgFee: 1300, estimatedDays: 5 },
    { name: 'Kotido Town', district: 'Kotido', region: 'Northern', distanceKm: 500, baseFee: 50000, perKgFee: 1300, estimatedDays: 5 },
  ];

  for (const zone of shippingZones) {
    await prisma.shippingZone.upsert({
      where: { name_district: { name: zone.name, district: zone.district } },
      update: {},
      create: {
        ...zone,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${shippingZones.length} shipping zones`);

  console.log('========================================');
  console.log('Database seed completed successfully!');
  console.log('========================================');
  console.log('');
  console.log('Admin Login Credentials:');
  console.log('Email: admin@chockys.ug');
  console.log('Password: Admin@123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
