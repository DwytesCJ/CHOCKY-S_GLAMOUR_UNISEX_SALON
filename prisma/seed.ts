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

  // Create Sample Products
  const products = [
    {
      name: 'Velvet Matte Lipstick',
      slug: 'velvet-matte-lipstick',
      sku: 'LIP-001',
      description: 'Long-lasting velvet matte finish lipstick with rich pigmentation. Comfortable wear all day.',
      shortDescription: 'Luxurious matte lipstick with 12-hour wear',
      price: 45000,
      compareAtPrice: 55000,
      categoryId: categories[4].id, // Makeup
      brandId: brands[3].id, // MAC
      stockQuantity: 50,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,
    },
    {
      name: 'Brazilian Body Wave Wig',
      slug: 'brazilian-body-wave-wig',
      sku: 'WIG-001',
      description: 'Premium quality Brazilian human hair wig with natural body wave pattern. Pre-plucked hairline.',
      shortDescription: '100% human hair wig with natural look',
      price: 350000,
      compareAtPrice: 450000,
      categoryId: categories[0].id, // Hair
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 20,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
    },
    {
      name: 'Hydrating Face Serum',
      slug: 'hydrating-face-serum',
      sku: 'SKIN-001',
      description: 'Intensive hydrating serum with hyaluronic acid and vitamin E. Perfect for all skin types.',
      shortDescription: 'Deep hydration for glowing skin',
      price: 85000,
      compareAtPrice: 100000,
      categoryId: categories[5].id, // Skincare
      brandId: brands[2].id, // L'Oreal
      stockQuantity: 35,
      isActive: true,
      isFeatured: true,
      isOnSale: true,
    },
    {
      name: 'Designer Leather Handbag',
      slug: 'designer-leather-handbag',
      sku: 'BAG-001',
      description: 'Elegant genuine leather handbag with gold hardware. Spacious interior with multiple compartments.',
      shortDescription: 'Premium leather handbag for everyday elegance',
      price: 180000,
      compareAtPrice: 220000,
      categoryId: categories[2].id, // Bags
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 15,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Floral Eau de Parfum',
      slug: 'floral-eau-de-parfum',
      sku: 'PERF-001',
      description: 'Enchanting floral fragrance with notes of rose, jasmine, and sandalwood. Long-lasting scent.',
      shortDescription: 'Captivating floral fragrance for women',
      price: 120000,
      compareAtPrice: 150000,
      categoryId: categories[3].id, // Perfumes
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 25,
      isActive: true,
      isFeatured: true,
      isBestseller: true,
    },
    {
      name: 'Crystal Drop Earrings',
      slug: 'crystal-drop-earrings',
      sku: 'JEW-001',
      description: 'Stunning crystal drop earrings with gold-plated finish. Perfect for special occasions.',
      shortDescription: 'Elegant crystal earrings for any occasion',
      price: 65000,
      compareAtPrice: 80000,
      categoryId: categories[1].id, // Jewelry
      brandId: brands[0].id, // CHOCKY'S
      stockQuantity: 40,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
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
