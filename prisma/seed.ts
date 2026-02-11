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
    update: {
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
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

  // Create Categories (using real uploaded images)
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'hair-styling' },
      update: { image: '/uploads/categories/iwaria-inc-DzMmp0uewcg-unsplash.jpg' },
      create: {
        name: 'Hair Styling',
        slug: 'hair-styling',
        description: 'Wigs, extensions, hair care products, and styling tools',
        image: '/uploads/categories/iwaria-inc-DzMmp0uewcg-unsplash.jpg',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'jewelry-ornaments' },
      update: { image: '/uploads/categories/pexels-hert-33561789.jpg' },
      create: {
        name: 'Jewelry & Ornaments',
        slug: 'jewelry-ornaments',
        description: 'Earrings, necklaces, bracelets, rings, and jewelry sets',
        image: '/uploads/categories/pexels-hert-33561789.jpg',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'bags-accessories' },
      update: { image: '/uploads/categories/jeff-kweba-OfCqjqsWmIc-unsplash.jpg' },
      create: {
        name: 'Bags & Accessories',
        slug: 'bags-accessories',
        description: 'Handbags, clutches, tote bags, and wallets',
        image: '/uploads/categories/jeff-kweba-OfCqjqsWmIc-unsplash.jpg',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'perfumes-fragrances' },
      update: { image: '/uploads/categories/element5-digital-ooPx1bxmTc4-unsplash.jpg' },
      create: {
        name: 'Perfumes & Fragrances',
        slug: 'perfumes-fragrances',
        description: 'Women\'s perfumes, men\'s cologne, and gift sets',
        image: '/uploads/categories/element5-digital-ooPx1bxmTc4-unsplash.jpg',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'makeup' },
      update: { image: '/uploads/categories/pexels-shattha-pilabut-38930-135620.jpg' },
      create: {
        name: 'Makeup',
        slug: 'makeup',
        description: 'Face, eyes, lips, nails, and makeup tools',
        image: '/uploads/categories/pexels-shattha-pilabut-38930-135620.jpg',
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'skincare' },
      update: { image: '/uploads/categories/anna-keibalo-teFY4aA5dYA-unsplash.jpg' },
      create: {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Cleansers, moisturizers, serums, and treatments',
        image: '/uploads/categories/anna-keibalo-teFY4aA5dYA-unsplash.jpg',
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

  // Product image mapping - real uploaded filenames per product
  const productImageMap: Record<string, string> = {
    'luxury-matte-lipstick': '/uploads/products/makeup/pexels-828860-2536009.jpg',
    'hd-lace-front-wig': '/uploads/products/hair/pexels-venus-31818416.jpg',
    'vitamin-c-serum': '/uploads/products/skincare/pexels-misolo-cosmetic-2588316-4841339.jpg',
    'designer-handbag': '/uploads/products/bags/pexels-dhanno-22432991.jpg',
    'gold-hoop-earrings': '/uploads/products/jewelry/pexels-castorlystock-3641059.jpg',
    'luxury-perfume-set': '/uploads/products/perfumes/pexels-valeriya-724635.jpg',
    'foundation-kit': '/uploads/products/makeup/pexels-shiny-diamond-3373734.jpg',
    'braiding-hair-extensions': '/uploads/products/hair/pexels-rdne-6923351.jpg',
    'diamond-stud-earrings': '/uploads/products/jewelry/pexels-arif-13595436.jpg',
    'evening-clutch-bag': '/uploads/products/bags/pexels-dhanno-22432992.jpg',
    'mens-cologne-set': '/uploads/products/perfumes/pexels-didsss-2508558.jpg',
    'eyeshadow-palette': '/uploads/products/makeup/pexels-amazingsobia-5420689.jpg',
    'moisturizing-cream': '/uploads/products/skincare/pexels-828860-2587177.jpg',
    'silk-scarf-collection': '/uploads/products/bags/pexels-dhanno-22434757.jpg',
  };

  // Create ALL Current Website Products
  const products = [
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

  // Create products with images (using upsert to prevent duplicates)
  for (const productData of products) {
    // First, resolve any SKU conflicts: if another product has this SKU but a different slug, delete it
    const conflictingProduct = await prisma.product.findFirst({
      where: {
        sku: productData.sku,
        NOT: { slug: productData.slug },
      },
    });
    if (conflictingProduct) {
      // Delete images and the conflicting product
      await prisma.productImage.deleteMany({ where: { productId: conflictingProduct.id } });
      await prisma.product.delete({ where: { id: conflictingProduct.id } });
      console.log(`  Resolved SKU conflict for ${productData.sku}`);
    }

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        name: productData.name,
        price: productData.price,
        compareAtPrice: productData.compareAtPrice,
        stockQuantity: productData.stockQuantity,
        isActive: productData.isActive,
        isFeatured: productData.isFeatured,
        isNewArrival: productData.isNewArrival,
        isBestseller: productData.isBestseller,
        isOnSale: productData.isOnSale,
      },
      create: productData,
    });

    // Create product image using the mapped real filename
    const imageUrl = productImageMap[productData.slug];
    if (imageUrl) {
      // Check if image already exists
      const existingImage = await prisma.productImage.findFirst({
        where: {
          productId: product.id,
          url: imageUrl,
        },
      });

      if (!existingImage) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: imageUrl,
            alt: productData.name,
            sortOrder: 0,
          },
        });
      }
    }
  }

  console.log('Created products with images');

  // Create Banners (using real uploaded images)
  const banners = [
    {
      title: 'Summer Beauty Sale',
      subtitle: 'Up to 50% off on selected items',
      image: '/uploads/banners/pexels-cottonbro-3993134.jpg',
      link: '/shop?sale=true',
      buttonText: 'Shop Sale',
      position: 'hero',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'New Arrivals',
      subtitle: 'Discover the latest beauty trends',
      image: '/uploads/banners/pexels-artbovich-7750115.jpg',
      link: '/shop?new=true',
      buttonText: 'Explore Now',
      position: 'hero',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Salon Services',
      subtitle: 'Book your appointment today',
      image: '/uploads/banners/minh-dang-DsauO8w-Nag-unsplash.jpg',
      link: '/salon/booking',
      buttonText: 'Book Now',
      position: 'hero',
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.upsert({
      where: { title: banner.title },
      update: { image: banner.image },
      create: banner,
    });
  }

  console.log('Created banners');

  // Create Testimonials (using real uploaded images)
  const testimonials = [
    {
      name: 'Sarah Nakamya',
      title: 'Loyal Customer',
      content: "CHOCKY'S has completely transformed my beauty routine. The quality of products is amazing and the customer service is exceptional!",
      rating: 5,
      image: '/uploads/testimonials/pexels-git-stephen-gitau-302905-1801235.jpg',
      isActive: true,
    },
    {
      name: 'Grace Achieng',
      title: 'Bridal Client',
      content: 'My wedding makeup was absolutely perfect! The team made me feel like a queen on my special day.',
      rating: 5,
      image: '/uploads/testimonials/pexels-artbovich-7195799.jpg',
      isActive: true,
    },
    {
      name: 'Diana Opio',
      title: 'Regular Client',
      content: 'I love the variety of products available. Everything is authentic and reasonably priced. Highly recommend!',
      rating: 5,
      image: '/uploads/testimonials/pexels-enginakyurt-3065209.jpg',
      isActive: true,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { name: testimonial.name },
      update: { image: testimonial.image },
      create: testimonial,
    });
  }

  console.log('Created testimonials');

  // Create Stylists (using real uploaded images)
  const stylists = [
    {
      name: 'Grace Nakamya',
      slug: 'grace-nakamya',
      title: 'Senior Hair Stylist',
      bio: 'With over 10 years of experience, Grace specializes in braiding, weaving, and wig installation.',
      image: '/uploads/team/SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg',
      specialties: JSON.stringify(['Braiding', 'Weaving', 'Wig Installation', 'Hair Coloring']),
      isActive: true,
    },
    {
      name: 'Diana Achieng',
      slug: 'diana-achieng',
      title: 'Lead Makeup Artist',
      bio: 'Diana is our lead makeup artist with expertise in bridal, editorial, and everyday makeup looks.',
      image: '/uploads/team/SnapInsta.to_624543554_18078416900580404_729626818934809874_n.jpg',
      specialties: JSON.stringify(['Bridal Makeup', 'Editorial', 'Contouring', 'Special Effects']),
      isActive: true,
    },
    {
      name: 'Sarah Opio',
      slug: 'sarah-opio',
      title: 'Skincare Specialist',
      bio: 'Sarah is a certified skincare specialist offering facials, treatments, and personalized skincare advice.',
      image: '/uploads/team/SnapInsta.to_625048011_18078416870580404_5424531763907010008_n.jpg',
      specialties: JSON.stringify(['Facials', 'Chemical Peels', 'Microdermabrasion', 'Skincare Consultation']),
      isActive: true,
    },
    {
      name: 'Joseph Kato',
      slug: 'joseph-kato',
      title: 'Barber & Grooming Expert',
      bio: 'Joseph brings precision and style to men\'s grooming with expert haircuts and beard styling.',
      image: '/uploads/team/SnapInsta.to_625048531_18078416903580404_2925058900756321713_n.jpg',
      specialties: JSON.stringify(['Haircuts', 'Beard Styling', 'Hot Towel Shave', 'Hair Design']),
      isActive: true,
    },
  ];

  for (const stylist of stylists) {
    await prisma.stylist.upsert({
      where: { slug: stylist.slug },
      update: { image: stylist.image },
      create: stylist,
    });
  }

  console.log('Created stylists');

  // Create FAQs
  const faqs = [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Mobile Money (MTN, Airtel), Visa/Mastercard, and Cash on Delivery for orders within Kampala.',
      category: 'Payments',
      sortOrder: 1,
      isActive: true,
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery within Kampala takes 1-2 business days. Upcountry deliveries take 3-5 business days depending on location.',
      category: 'Shipping',
      sortOrder: 2,
      isActive: true,
    },
    {
      question: 'Do you offer returns and refunds?',
      answer: 'Yes, we offer a 14-day return policy for unused products in original packaging. Refunds are processed within 5-7 business days.',
      category: 'Returns',
      sortOrder: 3,
      isActive: true,
    },
    {
      question: 'Are your products authentic?',
      answer: 'Absolutely! We only source products directly from authorized distributors and brands. All products are 100% authentic.',
      category: 'Products',
      sortOrder: 4,
      isActive: true,
    },
    {
      question: 'How do I book a salon appointment?',
      answer: 'You can book online through our website, call us at +256 703 878 485, or visit our salon directly.',
      category: 'Salon',
      sortOrder: 5,
      isActive: true,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { question: faq.question },
      update: {},
      create: faq,
    });
  }

  console.log('Created FAQs');

  // Create Service Categories
  const serviceCategories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { slug: 'hair-services' },
      update: {},
      create: {
        name: 'Hair Services',
        slug: 'hair-services',
        description: 'Professional hair styling, treatments, and care',
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
        sortOrder: 2,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'skincare-services' },
      update: {},
      create: {
        name: 'Skincare Services',
        slug: 'skincare-services',
        description: 'Facials, treatments, and skincare consultations',
        sortOrder: 3,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'nail-services' },
      update: {},
      create: {
        name: 'Nail Services',
        slug: 'nail-services',
        description: 'Manicures, pedicures, and nail art',
        sortOrder: 4,
      },
    }),
  ]);

  console.log('Created service categories');

  // Create Salon Services
  const services = [
    { name: 'Braiding', slug: 'braiding', description: 'Professional braiding services', price: 50000, duration: 180, categoryId: serviceCategories[0].id, isActive: true },
    { name: 'Wig Installation', slug: 'wig-installation', description: 'Expert wig installation and styling', price: 80000, duration: 120, categoryId: serviceCategories[0].id, isActive: true },
    { name: 'Hair Coloring', slug: 'hair-coloring', description: 'Professional hair coloring services', price: 100000, duration: 150, categoryId: serviceCategories[0].id, isActive: true },
    { name: 'Hair Treatment', slug: 'hair-treatment', description: 'Deep conditioning and treatment', price: 60000, duration: 60, categoryId: serviceCategories[0].id, isActive: true },
    { name: 'Bridal Makeup', slug: 'bridal-makeup', description: 'Complete bridal makeup package', price: 250000, duration: 180, categoryId: serviceCategories[1].id, isActive: true },
    { name: 'Party Makeup', slug: 'party-makeup', description: 'Glamorous party makeup', price: 80000, duration: 60, categoryId: serviceCategories[1].id, isActive: true },
    { name: 'Facial Treatment', slug: 'facial-treatment', description: 'Deep cleansing facial', price: 100000, duration: 90, categoryId: serviceCategories[2].id, isActive: true },
    { name: 'Manicure & Pedicure', slug: 'mani-pedi', description: 'Complete nail care package', price: 50000, duration: 90, categoryId: serviceCategories[3].id, isActive: true },
  ];

  for (const service of services) {
    await prisma.salonService.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }

  console.log('Created salon services');

  // Create Site Settings
  const siteSettings = [
    { key: 'storeName', value: "CHOCKY'S Ultimate Glamour" },
    { key: 'storeEmail', value: 'info@chockys.ug' },
    { key: 'storePhone', value: '+256703878485' },
    { key: 'storeAddress', value: 'Plot 123, Kampala Road, Kampala, Uganda' },
    { key: 'currency', value: 'UGX' },
    { key: 'facebookUrl', value: 'https://facebook.com/chockysglamour' },
    { key: 'instagramUrl', value: 'https://instagram.com/chockysglamour' },
    { key: 'twitterUrl', value: 'https://twitter.com/chockysglamour' },
    { key: 'whatsappNumber', value: '+256703878485' },
    { key: 'openingHoursWeekday', value: 'Mon - Fri: 9:00 AM - 7:00 PM' },
    { key: 'openingHoursSaturday', value: 'Saturday: 9:00 AM - 6:00 PM' },
    { key: 'openingHoursSunday', value: 'Sunday: 10:00 AM - 4:00 PM' },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('Created site settings');

  // Create Content Blocks (using real uploaded images)
  const contentBlocks = [
    // Homepage features
    { key: 'home-feature-1', title: 'Free Delivery', content: 'On orders over UGX 100k', page: 'home', section: 'features', type: 'feature', metadata: JSON.stringify({ icon: 'fas fa-truck' }), sortOrder: 1, isActive: true },
    { key: 'home-feature-2', title: '100% Authentic', content: 'Genuine products only', page: 'home', section: 'features', type: 'feature', metadata: JSON.stringify({ icon: 'fas fa-shield-alt' }), sortOrder: 2, isActive: true },
    { key: 'home-feature-3', title: 'Easy Returns', content: '14-day return policy', page: 'home', section: 'features', type: 'feature', metadata: JSON.stringify({ icon: 'fas fa-undo' }), sortOrder: 3, isActive: true },
    { key: 'home-feature-4', title: '24/7 Support', content: 'WhatsApp & Phone', page: 'home', section: 'features', type: 'feature', metadata: JSON.stringify({ icon: 'fas fa-headset' }), sortOrder: 4, isActive: true },
    // Homepage promo
    { key: 'home-promo', title: 'Get 20% Off Your First Order', content: 'Join our Glamour Club and enjoy exclusive discounts, early access to new arrivals, and special member perks.', page: 'home', section: 'promo', type: 'banner', metadata: JSON.stringify({ badge: 'Limited Time Offer', primaryButtonText: 'Shop Now', primaryButtonLink: '/shop', secondaryButtonText: 'Join Rewards', secondaryButtonLink: '/rewards', backgroundImage: '/uploads/banners/pexels-cottonbro-3993134.jpg' }), sortOrder: 1, isActive: true },
    // About page values
    { key: 'about-value-1', title: 'Passion for Beauty', content: 'We are driven by our love for beauty and helping our customers look and feel their best.', page: 'about', section: 'values', type: 'value', metadata: JSON.stringify({ icon: 'fa-heart' }), sortOrder: 1, isActive: true },
    { key: 'about-value-2', title: 'Quality First', content: 'We only offer authentic, premium products from trusted brands you can rely on.', page: 'about', section: 'values', type: 'value', metadata: JSON.stringify({ icon: 'fa-gem' }), sortOrder: 2, isActive: true },
    { key: 'about-value-3', title: 'Customer Focus', content: 'Your satisfaction is our priority. We go above and beyond to serve you better.', page: 'about', section: 'values', type: 'value', metadata: JSON.stringify({ icon: 'fa-users' }), sortOrder: 3, isActive: true },
    { key: 'about-value-4', title: 'Sustainability', content: 'We are committed to eco-friendly practices and supporting sustainable beauty.', page: 'about', section: 'values', type: 'value', metadata: JSON.stringify({ icon: 'fa-leaf' }), sortOrder: 4, isActive: true },
    // About page stats
    { key: 'about-stat-1', title: '10K+', content: 'Happy Customers', page: 'about', section: 'stats', type: 'stat', metadata: JSON.stringify({ number: '10K+' }), sortOrder: 1, isActive: true },
    { key: 'about-stat-2', title: '500+', content: 'Products', page: 'about', section: 'stats', type: 'stat', metadata: JSON.stringify({ number: '500+' }), sortOrder: 2, isActive: true },
    { key: 'about-stat-3', title: '50+', content: 'Brands', page: 'about', section: 'stats', type: 'stat', metadata: JSON.stringify({ number: '50+' }), sortOrder: 3, isActive: true },
    { key: 'about-stat-4', title: '5+', content: 'Years Experience', page: 'about', section: 'stats', type: 'stat', metadata: JSON.stringify({ number: '5+' }), sortOrder: 4, isActive: true },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: { metadata: block.metadata },
      create: block,
    });
  }

  console.log('Created content blocks');

  // Create Shipping Zones for Uganda
  const shippingZones = [
    // Central Region
    { name: 'Kampala Central', district: 'Kampala', region: 'Central', distanceKm: 0, baseFee: 5000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Kampala Suburbs', district: 'Wakiso', region: 'Central', distanceKm: 15, baseFee: 8000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Entebbe', district: 'Wakiso', region: 'Central', distanceKm: 40, baseFee: 12000, perKgFee: 600, estimatedDays: 1 },
    { name: 'Mukono Town', district: 'Mukono', region: 'Central', distanceKm: 25, baseFee: 10000, perKgFee: 500, estimatedDays: 1 },
    { name: 'Jinja City', district: 'Jinja', region: 'Central', distanceKm: 80, baseFee: 15000, perKgFee: 700, estimatedDays: 2 },
    { name: 'Masaka City', district: 'Masaka', region: 'Central', distanceKm: 130, baseFee: 20000, perKgFee: 800, estimatedDays: 2 },
    { name: 'Mpigi Town', district: 'Mpigi', region: 'Central', distanceKm: 35, baseFee: 12000, perKgFee: 600, estimatedDays: 1 },
    { name: 'Luwero Town', district: 'Luwero', region: 'Central', distanceKm: 75, baseFee: 15000, perKgFee: 700, estimatedDays: 2 },
    { name: 'Mityana Town', district: 'Mityana', region: 'Central', distanceKm: 70, baseFee: 15000, perKgFee: 700, estimatedDays: 2 },
    { name: 'Mubende Town', district: 'Mubende', region: 'Central', distanceKm: 150, baseFee: 22000, perKgFee: 800, estimatedDays: 2 },
    { name: 'Kayunga Town', district: 'Kayunga', region: 'Central', distanceKm: 75, baseFee: 15000, perKgFee: 700, estimatedDays: 2 },
    { name: 'Nakasongola Town', district: 'Nakasongola', region: 'Central', distanceKm: 115, baseFee: 18000, perKgFee: 750, estimatedDays: 2 },
    // Eastern Region
    { name: 'Mbale City', district: 'Mbale', region: 'Eastern', distanceKm: 225, baseFee: 28000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Soroti City', district: 'Soroti', region: 'Eastern', distanceKm: 300, baseFee: 32000, perKgFee: 1000, estimatedDays: 3 },
    { name: 'Tororo Town', district: 'Tororo', region: 'Eastern', distanceKm: 200, baseFee: 25000, perKgFee: 850, estimatedDays: 3 },
    { name: 'Iganga Town', district: 'Iganga', region: 'Eastern', distanceKm: 120, baseFee: 18000, perKgFee: 750, estimatedDays: 2 },
    { name: 'Busia Town', district: 'Busia', region: 'Eastern', distanceKm: 200, baseFee: 25000, perKgFee: 850, estimatedDays: 3 },
    { name: 'Kumi Town', district: 'Kumi', region: 'Eastern', distanceKm: 270, baseFee: 30000, perKgFee: 950, estimatedDays: 3 },
    { name: 'Kapchorwa Town', district: 'Kapchorwa', region: 'Eastern', distanceKm: 280, baseFee: 32000, perKgFee: 1000, estimatedDays: 4 },
    { name: 'Pallisa Town', district: 'Pallisa', region: 'Eastern', distanceKm: 220, baseFee: 27000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Bugiri Town', district: 'Bugiri', region: 'Eastern', distanceKm: 150, baseFee: 22000, perKgFee: 800, estimatedDays: 2 },
    { name: 'Kamuli Town', district: 'Kamuli', region: 'Eastern', distanceKm: 140, baseFee: 20000, perKgFee: 800, estimatedDays: 2 },
    // Western Region
    { name: 'Mbarara City', district: 'Mbarara', region: 'Western', distanceKm: 270, baseFee: 30000, perKgFee: 950, estimatedDays: 3 },
    { name: 'Fort Portal City', district: 'Kabarole', region: 'Western', distanceKm: 300, baseFee: 32000, perKgFee: 1000, estimatedDays: 3 },
    { name: 'Kabale Town', district: 'Kabale', region: 'Western', distanceKm: 420, baseFee: 40000, perKgFee: 1100, estimatedDays: 4 },
    { name: 'Kasese Town', district: 'Kasese', region: 'Western', distanceKm: 370, baseFee: 38000, perKgFee: 1050, estimatedDays: 4 },
    { name: 'Hoima City', district: 'Hoima', region: 'Western', distanceKm: 230, baseFee: 28000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Masindi Town', district: 'Masindi', region: 'Western', distanceKm: 220, baseFee: 27000, perKgFee: 900, estimatedDays: 3 },
    { name: 'Bushenyi Town', district: 'Bushenyi', region: 'Western', distanceKm: 320, baseFee: 33000, perKgFee: 1000, estimatedDays: 3 },
    { name: 'Ntungamo Town', district: 'Ntungamo', region: 'Western', distanceKm: 380, baseFee: 38000, perKgFee: 1050, estimatedDays: 4 },
    { name: 'Rukungiri Town', district: 'Rukungiri', region: 'Western', distanceKm: 400, baseFee: 40000, perKgFee: 1100, estimatedDays: 4 },
    { name: 'Kisoro Town', district: 'Kisoro', region: 'Western', distanceKm: 480, baseFee: 45000, perKgFee: 1200, estimatedDays: 5 },
    { name: 'Bundibugyo Town', district: 'Bundibugyo', region: 'Western', distanceKm: 380, baseFee: 40000, perKgFee: 1100, estimatedDays: 4 },
    { name: 'Kyenjojo Town', district: 'Kyenjojo', region: 'Western', distanceKm: 260, baseFee: 30000, perKgFee: 950, estimatedDays: 3 },
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
