"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';

type BadgeType = 'Sale' | 'Bestseller' | 'New' | 'Trending' | undefined;

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: BadgeType;
}

// Extended products data for pagination demo
const allProducts: Product[] = [
  {
    id: '1',
    name: 'Luxury Matte Lipstick',
    price: 45000,
    originalPrice: 65000,
    image: '/images/products/makeup/pexels-828860-2536009.jpg',
    category: 'Makeup',
    rating: 4.5,
    reviews: 124,
    badge: 'Sale' as BadgeType,
  },
  {
    id: '2',
    name: 'HD Lace Front Wig',
    price: 450000,
    image: '/images/products/hair/pexels-venus-31818416.jpg',
    category: 'Hair',
    rating: 4.8,
    reviews: 89,
    badge: 'Bestseller' as BadgeType,
  },
  {
    id: '3',
    name: 'Vitamin C Serum',
    price: 120000,
    image: '/images/products/skincare/pexels-misolo-cosmetic-2588316-4841339.jpg',
    category: 'Skincare',
    rating: 4.6,
    reviews: 56,
    badge: 'New' as BadgeType,
  },
  {
    id: '4',
    name: 'Designer Handbag',
    price: 285000,
    originalPrice: 350000,
    image: '/images/products/bags/pexels-dhanno-22432991.jpg',
    category: 'Bags',
    rating: 4.7,
    reviews: 42,
    badge: 'Sale' as BadgeType,
  },
  {
    id: '5',
    name: 'Floral Eau de Parfum',
    price: 180000,
    image: '/images/products/perfumes/pexels-valeriya-724635.jpg',
    category: 'Perfumes',
    rating: 4.9,
    reviews: 78,
    badge: 'Bestseller' as BadgeType,
  },
  {
    id: '6',
    name: 'Gold Necklace Set',
    price: 320000,
    image: '/images/products/jewelry/pexels-castorlystock-3641059.jpg',
    category: 'Jewelry',
    rating: 4.8,
    reviews: 35,
    badge: 'New' as BadgeType,
  },
  {
    id: '7',
    name: 'Foundation SPF 30',
    price: 85000,
    image: '/images/products/makeup/pexels-shiny-diamond-3373734.jpg',
    category: 'Makeup',
    rating: 4.4,
    reviews: 98,
  },
  {
    id: '8',
    name: 'Brazilian Hair Bundle',
    price: 380000,
    image: '/images/products/hair/pexels-rdne-6923351.jpg',
    category: 'Hair',
    rating: 4.7,
    reviews: 67,
  },
  {
    id: '9',
    name: 'Hydrating Moisturizer',
    price: 95000,
    image: '/images/products/skincare/pexels-karola-g-4889036.jpg',
    category: 'Skincare',
    rating: 4.5,
    reviews: 112,
  },
  {
    id: '10',
    name: 'Leather Tote Bag',
    price: 220000,
    image: '/images/products/bags/pexels-dhanno-22432992.jpg',
    category: 'Bags',
    rating: 4.6,
    reviews: 54,
  },
  {
    id: '11',
    name: 'Oud Perfume',
    price: 250000,
    image: '/images/products/perfumes/pexels-castorlystock-3785784.jpg',
    category: 'Perfumes',
    rating: 4.8,
    reviews: 45,
  },
  {
    id: '12',
    name: 'Pearl Earrings',
    price: 150000,
    image: '/images/products/jewelry/pexels-the-glorious-studio-3584518-6716444.jpg',
    category: 'Jewelry',
    rating: 4.9,
    reviews: 28,
  },
  // Additional products for pagination
  {
    id: '13',
    name: 'Eyeshadow Palette',
    price: 75000,
    image: '/images/products/makeup/pexels-828860-2693644.jpg',
    category: 'Makeup',
    rating: 4.6,
    reviews: 89,
    badge: 'Trending' as BadgeType,
  },
  {
    id: '14',
    name: 'Curly Wig',
    price: 320000,
    image: '/images/products/hair/pexels-alinaskazka-14730865.jpg',
    category: 'Hair',
    rating: 4.5,
    reviews: 45,
  },
  {
    id: '15',
    name: 'Anti-Aging Cream',
    price: 180000,
    image: '/images/products/skincare/pexels-misolo-cosmetic-2588316-4841339.jpg',
    category: 'Skincare',
    rating: 4.7,
    reviews: 67,
    badge: 'New' as BadgeType,
  },
  {
    id: '16',
    name: 'Crossbody Bag',
    price: 165000,
    image: '/images/products/bags/pexels-dhanno-22432993.jpg',
    category: 'Bags',
    rating: 4.4,
    reviews: 32,
  },
  {
    id: '17',
    name: 'Rose Perfume',
    price: 145000,
    image: '/images/products/perfumes/pexels-valeriya-724635.jpg',
    category: 'Perfumes',
    rating: 4.6,
    reviews: 56,
  },
  {
    id: '18',
    name: 'Diamond Ring',
    price: 850000,
    image: '/images/products/jewelry/pexels-castorlystock-3641059.jpg',
    category: 'Jewelry',
    rating: 4.9,
    reviews: 23,
    badge: 'Bestseller' as BadgeType,
  },
  {
    id: '19',
    name: 'Lip Gloss Set',
    price: 55000,
    image: '/images/products/makeup/pexels-shiny-diamond-3373734.jpg',
    category: 'Makeup',
    rating: 4.3,
    reviews: 78,
  },
  {
    id: '20',
    name: 'Straight Wig',
    price: 280000,
    image: '/images/products/hair/pexels-venus-31818416.jpg',
    category: 'Hair',
    rating: 4.6,
    reviews: 54,
  },
];

const categories = [
  { name: 'All', count: 120 },
  { name: 'Makeup', count: 45 },
  { name: 'Hair', count: 30 },
  { name: 'Skincare', count: 25 },
  { name: 'Perfumes', count: 20 },
  { name: 'Jewelry', count: 35 },
  { name: 'Bags', count: 18 },
];

const priceRanges = [
  { label: 'Under UGX 50,000', min: 0, max: 50000 },
  { label: 'UGX 50,000 - 100,000', min: 50000, max: 100000 },
  { label: 'UGX 100,000 - 200,000', min: 100000, max: 200000 },
  { label: 'UGX 200,000 - 500,000', min: 200000, max: 500000 },
  { label: 'Over UGX 500,000', min: 500000, max: Infinity },
];

const PRODUCTS_PER_PAGE = 8;

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter products
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      if (selectedPriceRange !== null) {
        const range = priceRanges[selectedPriceRange];
        if (product.price < range.min || product.price > range.max) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedPriceRange]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return parseInt(b.id) - parseInt(a.id);
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (index: number | null) => {
    setSelectedPriceRange(index);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedPriceRange(null);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/banners/pexels-cottonbro-3993134.jpg"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Shop All Products</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover our curated collection of premium beauty products, accessories, and more
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
            <span className="text-gray-900 font-medium">Shop</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-heading font-semibold text-lg mb-4">Categories</h3>
              <ul className="space-y-2 mb-6">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <button
                      onClick={() => handleCategoryChange(cat.name)}
                      className={`w-full flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                        selectedCategory === cat.name
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-sm ${selectedCategory === cat.name ? 'text-white/80' : 'text-gray-400'}`}>
                        ({cat.count})
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <h3 className="font-heading font-semibold text-lg mb-4">Price Range</h3>
              <ul className="space-y-2 mb-6">
                {priceRanges.map((range, index) => (
                  <li key={range.label}>
                    <label className="flex items-center gap-3 cursor-pointer py-1">
                      <input
                        type="radio"
                        name="price"
                        checked={selectedPriceRange === index}
                        onChange={() => handlePriceRangeChange(selectedPriceRange === index ? null : index)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleClearFilters}
                className="w-full py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
                >
                  <i className="fas fa-filter"></i>
                  Filters
                </button>
                <p className="text-gray-600">
                  Showing <strong>{paginatedProducts.length}</strong> of <strong>{sortedProducts.length}</strong> products
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-xl p-4 shadow-sm mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Category</h4>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Price</h4>
                    <select
                      value={selectedPriceRange ?? ''}
                      onChange={(e) => handlePriceRangeChange(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="">All Prices</option>
                      {priceRanges.map((range, index) => (
                        <option key={range.label} value={index}>{range.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Empty State */}
            {sortedProducts.length === 0 && (
              <div className="text-center py-16">
                <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button 
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-gray-400">...</span>
                  )
                ))}
                
                <button 
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <p className="text-center text-gray-500 text-sm mt-4">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
