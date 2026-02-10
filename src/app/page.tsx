"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';

// Hero Slides Data
const heroSlides = [
  {
    id: 1,
    image: '/images/hero/pexels-cottonbro-3993117.jpg',
    title: 'Discover Your',
    highlight: 'Ultimate Glamour',
    subtitle: 'Premium beauty products and professional salon services tailored for you',
    cta: 'Shop Now',
    ctaLink: '/shop',
  },
  {
    id: 2,
    image: '/images/hero/pexels-artbovich-7750099.jpg',
    title: 'Luxury Hair',
    highlight: 'Styling & Wigs',
    subtitle: 'Transform your look with our premium collection of wigs and hair products',
    cta: 'Explore Hair',
    ctaLink: '/shop/hair',
  },
  {
    id: 3,
    image: '/images/hero/pexels-artbovich-7195812.jpg',
    title: 'Book Your',
    highlight: 'Salon Experience',
    subtitle: 'Professional makeup, hair styling, and beauty treatments by expert stylists',
    cta: 'Book Appointment',
    ctaLink: '/salon/booking',
  },
];

// Categories Data - Fallback (should ideally be removed in favor of dynamic data)
const categories = [
  { id: 1, name: 'Hair Styling', image: '/images/categories/iwaria-inc-DzMmp0uewcg-unsplash.jpg', href: '/shop/hair', count: '0+' },
  { id: 2, name: 'Makeup', image: '/images/categories/pexels-shattha-pilabut-38930-135620.jpg', href: '/shop/makeup', count: '0+' },
  { id: 3, name: 'Skincare', image: '/images/categories/anna-keibalo-teFY4aA5dYA-unsplash.jpg', href: '/shop/skincare', count: '0+' },
  { id: 4, name: 'Perfumes', image: '/images/categories/element5-digital-ooPx1bxmTc4-unsplash.jpg', href: '/shop/perfumes', count: '0+' },
  { id: 5, name: 'Jewelry', image: '/images/categories/pexels-hert-33561789.jpg', href: '/shop/jewelry', count: '0+' },
  { id: 6, name: 'Bags', image: '/images/categories/jeff-kweba-OfCqjqsWmIc-unsplash.jpg', href: '/shop/bags', count: '0+' },
];

// Featured Products Data
const featuredProducts = [
  { id: '1', name: 'Luxury Matte Lipstick', price: 45000, originalPrice: 65000, image: '/images/products/makeup/pexels-828860-2536009.jpg', category: 'Makeup', badge: 'Sale' as const, rating: 4.8, reviews: 124 },
  { id: '2', name: 'HD Lace Front Wig', price: 450000, image: '/images/products/hair/pexels-venus-31818416.jpg', category: 'Hair', badge: 'Bestseller' as const, rating: 4.9, reviews: 89 },
  { id: '3', name: 'Vitamin C Serum', price: 120000, image: '/images/products/skincare/pexels-misolo-cosmetic-2588316-4841339.jpg', category: 'Skincare', badge: 'New' as const, rating: 4.7, reviews: 56 },
  { id: '4', name: 'Designer Handbag', price: 285000, originalPrice: 350000, image: '/images/products/bags/pexels-dhanno-22432991.jpg', category: 'Bags', badge: 'Sale' as const, rating: 4.6, reviews: 42 },
  { id: '5', name: 'Gold Hoop Earrings', price: 75000, image: '/images/products/jewelry/pexels-castorlystock-3641059.jpg', category: 'Jewelry', badge: 'Trending' as const, rating: 4.8, reviews: 78 },
  { id: '6', name: 'Luxury Perfume Set', price: 185000, image: '/images/products/perfumes/pexels-valeriya-724635.jpg', category: 'Perfumes', badge: 'New' as const, rating: 4.9, reviews: 34 },
  { id: '7', name: 'Foundation Kit', price: 95000, image: '/images/products/makeup/pexels-shiny-diamond-3373734.jpg', category: 'Makeup', rating: 4.5, reviews: 167 },
  { id: '8', name: 'Braiding Hair Extensions', price: 35000, image: '/images/products/hair/pexels-rdne-6923351.jpg', category: 'Hair', rating: 4.7, reviews: 203 },
];

// Testimonials Data
const testimonials = [
  { id: 1, name: 'Sarah Nakamya', role: 'Loyal Customer', image: '/images/testimonials/pexels-git-stephen-gitau-302905-1801235.jpg', text: "CHOCKY'S has completely transformed my beauty routine. The quality of products is amazing!", rating: 5 },
  { id: 2, name: 'Grace Achieng', role: 'Bridal Client', image: '/images/testimonials/pexels-artbovich-7195799.jpg', text: 'My wedding makeup was absolutely perfect! The team made me feel like a queen.', rating: 5 },
  { id: 3, name: 'Diana Opio', role: 'Regular Client', image: '/images/testimonials/pexels-enginakyurt-3065209.jpg', text: 'I love the variety of products available. Everything is authentic and reasonably priced.', rating: 5 },
];

// Flash deal countdown timer hook
function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = targetDate || (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; })();
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return timeLeft;
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dynamicProducts, setFeaturedProducts] = useState<any[]>([]);
  const [dynamicCategories, setCategories] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [flashDeals, setFlashDeals] = useState<any[]>([]);
  const [flashDealEnd, setFlashDealEnd] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const countdown = useCountdown(flashDealEnd);

  // Fetch featured products, categories, and active promotions
  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes, promosRes] = await Promise.all([
          fetch('/api/products?featured=true&limit=8'),
          fetch('/api/categories?parentOnly=true'),
          fetch('/api/promotions/active'),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const promosData = await promosRes.json();

        if (productsData.success) {
          setFeaturedProducts(productsData.data);
        }
        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
        if (promosData.success && promosData.data?.length > 0) {
          const activePromo = promosData.data[0];
          setFlashDeals(activePromo.products || []);
          setFlashDealEnd(new Date(activePromo.endDate));
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Load recently viewed products from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) setRecentlyViewed(JSON.parse(stored).slice(0, 4));
    } catch {}
  }, []);

  // Auto-rotate hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Map dynamic products to ProductCard format
  const displayProducts = dynamicProducts.length > 0 ? dynamicProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    originalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
    image: p.images?.[0]?.url || '/images/placeholder.jpg',
    category: p.category?.name || 'Beauty',
    rating: p.averageRating || 5,
    reviews: p.reviewCount || 0,
    badge: p.isOnSale ? 'Sale' : (p.isBestseller ? 'Bestseller' : (p.isNewArrival ? 'New' : undefined))
  })) : featuredProducts;

  // Map dynamic categories
  const displayCategories = dynamicCategories.length > 0 ? dynamicCategories.map(c => ({
    id: c.id,
    name: c.name,
    image: c.image || '/images/placeholder.jpg',
    href: `/shop?category=${c.slug}`,
    count: `${c._count?.products || 0}+`
  })) : categories;

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[80vh] sm:h-[85vh] min-h-[500px] max-h-[800px]">
        {/* Background Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
              quality={75}
            />
            {/* Lighter gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-rose-gold/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative h-full container mx-auto px-4 flex items-center">
          <div className="max-w-xl lg:max-w-2xl text-white">
            <span className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium mb-4">
              Welcome to CHOCKY&apos;S
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
              {heroSlides[currentSlide].title}{' '}
              <span className="text-cream">{heroSlides[currentSlide].highlight}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
              {heroSlides[currentSlide].subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={heroSlides[currentSlide].ctaLink}
                className="bg-primary text-white hover:bg-primary/90 px-5 sm:px-8 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2 shadow-lg"
              >
                {heroSlides[currentSlide].cta}
                <i className="fas fa-arrow-right text-sm"></i>
              </Link>
              <Link
                href="/salon"
                className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary px-5 sm:px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Book Salon
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2.5 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white py-4 sm:py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: 'fas fa-truck', title: 'Free Delivery', desc: 'On orders over UGX 100k' },
              { icon: 'fas fa-shield-alt', title: '100% Authentic', desc: 'Genuine products only' },
              { icon: 'fas fa-undo', title: 'Easy Returns', desc: '14-day return policy' },
              { icon: 'fas fa-headset', title: '24/7 Support', desc: 'WhatsApp & Phone' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-rose-gold rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <i className={`${feature.icon} text-sm sm:text-base`}></i>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">Explore</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mt-2">Shop by Category</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Discover our curated collection of beauty essentials</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="group relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                  <h3 className="font-semibold text-sm sm:text-base lg:text-lg">{category.name}</h3>
                  <p className="text-xs sm:text-sm text-white/80">{category.count} Products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals Section */}
      {(flashDeals.length > 0 || displayProducts.filter(p => p.originalPrice).length > 0) && (
      <section className="py-10 sm:py-14 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <i className="fas fa-bolt text-white"></i>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-gray-900">Flash Deals</h2>
                <p className="text-sm text-gray-500">{flashDealEnd ? 'Limited time offer!' : 'Hurry up! Deals end today'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <span className="text-sm text-gray-600 font-medium">Ends in:</span>
              {[{ val: countdown.hours, label: 'Hrs' }, { val: countdown.minutes, label: 'Min' }, { val: countdown.seconds, label: 'Sec' }].map((t, i) => (
                <React.Fragment key={i}>
                  <div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-center min-w-[48px]">
                    <span className="text-lg font-bold">{String(t.val).padStart(2, '0')}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-gray-300">{t.label}</span>
                  </div>
                  {i < 2 && <span className="text-gray-900 font-bold text-lg">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {flashDeals.length > 0 ? (
              flashDeals.slice(0, 4).map((product: any) => (
                <ProductCard key={`flash-${product.id}`} product={product as any} />
              ))
            ) : (
              displayProducts.filter(p => p.originalPrice).slice(0, 4).map((product) => (
                <ProductCard key={`flash-${product.id}`} product={product as any} />
              ))
            )}
          </div>
        </div>
      </section>
      )}

      {/* Featured Products Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12">
            <div>
              <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">Trending Now</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mt-2">Featured Products</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Handpicked favorites our customers love</p>
            </div>
            <Link
              href="/shop"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all text-sm sm:text-base"
            >
              View All Products <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <Image
          src="/images/banners/pexels-cottonbro-3993134.jpg"
          alt="Special Offer"
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-rose-gold/80 to-burgundy/90" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-xl text-white">
            <span className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium mb-4">
              Limited Time Offer
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-4">
              Get 20% Off Your First Order
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-6">
              Join our Glamour Club and enjoy exclusive discounts, early access to new arrivals, and special member perks.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition-colors">
                Shop Now
              </Link>
              <Link href="/rewards" className="border-2 border-white text-white hover:bg-white hover:text-primary px-6 py-3 rounded-xl font-semibold transition-colors">
                Join Rewards
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Salon Services Preview */}
      <section className="py-12 sm:py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">Our Services</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mt-2">Professional Salon Services</h2>
              <p className="text-gray-600 mt-4 mb-6 text-sm sm:text-base leading-relaxed">
                Experience luxury beauty treatments by our expert stylists. From stunning hair transformations 
                to flawless makeup artistry, we bring out your natural beauty.
              </p>
              
              <div className="space-y-3 mb-6">
                {[
                  { icon: 'fas fa-cut', name: 'Hair Styling & Treatments', price: 'From UGX 50,000' },
                  { icon: 'fas fa-magic', name: 'Makeup Services', price: 'From UGX 80,000' },
                  { icon: 'fas fa-spa', name: 'Skin Treatments', price: 'From UGX 100,000' },
                  { icon: 'fas fa-gem', name: 'Bridal Packages', price: 'From UGX 500,000' },
                ].map((service, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-rose-gold rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <i className={`${service.icon} text-sm sm:text-base`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900">{service.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500">{service.price}</p>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
                  </div>
                ))}
              </div>

              <Link href="/salon/booking" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Book Appointment <i className="fas fa-calendar-alt"></i>
              </Link>
            </div>

            <div className="relative overflow-hidden">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/banners/pexels-artbovich-7750115.jpg"
                  alt="Salon Services"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-4 left-0 sm:-bottom-6 sm:-left-6 bg-white p-4 sm:p-6 rounded-xl shadow-xl max-w-[200px] sm:max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                        <Image
                          src="/images/testimonials/pexels-git-stephen-gitau-302905-1801235.jpg"
                          alt="Client"
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">+500 Happy Clients</span>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-sm"></i>
                  ))}
                  <span className="ml-2 text-gray-900 font-semibold text-sm">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mt-2">What Our Clients Say</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Real stories from our satisfied customers</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-5 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 text-primary mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="fas fa-star text-sm"></i>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="py-10 sm:py-14">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">Your History</span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold mt-1">Recently Viewed</h2>
              </div>
              <Link href="/shop" className="text-primary text-sm font-semibold hover:underline">
                View All <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {recentlyViewed.map((product: any) => (
                <ProductCard key={`recent-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram Feed */}
      <section className="py-12 sm:py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">Follow Us</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mt-2">@chockys_glamour</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Join our community and share your glamour moments</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {[
              '/images/products/makeup/pexels-828860-2536009.jpg',
              '/images/products/jewelry/pexels-castorlystock-3641059.jpg',
              '/images/products/hair/pexels-venus-31818416.jpg',
              '/images/products/perfumes/pexels-valeriya-724635.jpg',
              '/images/products/bags/pexels-dhanno-22432992.jpg',
              '/images/products/skincare/pexels-misolo-cosmetic-2588316-4841339.jpg',
            ].map((image, index) => (
              <a
                key={index}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden group"
              >
                <Image
                  src={image}
                  alt={`Instagram ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/50 transition-colors flex items-center justify-center">
                  <i className="fab fa-instagram text-xl sm:text-2xl text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
