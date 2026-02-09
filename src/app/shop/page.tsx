"use client";

import React, { useState, useMemo, useEffect } from 'react';
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

const priceRanges = [
  { label: 'Under UGX 50,000', min: 0, max: 50000 },
  { label: 'UGX 50,000 - 100,000', min: 50000, max: 100000 },
  { label: 'UGX 100,000 - 200,000', min: 100000, max: 200000 },
  { label: 'UGX 200,000 - 500,000', min: 200000, max: 500000 },
  { label: 'Over UGX 500,000', min: 500000, max: Infinity },
];

const PRODUCTS_PER_PAGE = 12;

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string; count: number }[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          const formattedCategories = data.data.map((cat: any) => ({
            name: cat.name,
            slug: cat.slug,
            count: cat._count.products,
          }));
          setCategories([{ name: 'All', slug: 'all', count: formattedCategories.reduce((acc: number, cat: any) => acc + cat.count, 0) }, ...formattedCategories]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        let url = `/api/products?page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`;
        
        if (selectedCategory !== 'All') {
          const category = categories.find(c => c.name === selectedCategory);
          if (category) url += `&category=${category.slug}`;
        }
        
        if (selectedPriceRange !== null) {
          const range = priceRanges[selectedPriceRange];
          url += `&minPrice=${range.min}`;
          if (range.max !== Infinity) url += `&maxPrice=${range.max}`;
        }
        
        if (sortBy === 'price-low') {
          url += '&sortBy=price&sortOrder=asc';
        } else if (sortBy === 'price-high') {
          url += '&sortBy=price&sortOrder=desc';
        } else if (sortBy === 'rating') {
          url += '&sortBy=rating&sortOrder=desc';
        } else if (sortBy === 'newest') {
          url += '&sortBy=createdAt&sortOrder=desc';
        }

        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          const formattedProducts = data.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            originalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
            image: p.images[0]?.url || '/images/placeholders/product.jpg',
            category: p.category?.name || 'Uncategorized',
            rating: p.averageRating || 0,
            reviews: p.reviewCount || 0,
            badge: p.isOnSale ? 'Sale' : p.isNewArrival ? 'New' : p.isBestseller ? 'Bestseller' : undefined,
          }));
          setProducts(formattedProducts);
          setTotalProducts(data.pagination.total);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (categories.length > 0 || selectedCategory === 'All') {
      fetchProducts();
    }
  }, [currentPage, selectedCategory, selectedPriceRange, sortBy, categories]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

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
                  Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products
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
                  <option value="popular">Most Popular</option>
                </select>
                {/* View Toggle */}
                <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-gray-400'}`}
                    title="Grid view"
                  >
                    <i className="fas fa-th text-sm"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-gray-400'}`}
                    title="List view"
                  >
                    <i className="fas fa-list text-sm"></i>
                  </button>
                </div>
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

            {/* Active Filters */}
            {(selectedCategory !== 'All' || selectedPriceRange !== null) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                    {selectedCategory}
                    <button onClick={() => handleCategoryChange('All')} className="ml-1 hover:text-primary/70"><i className="fas fa-times text-xs"></i></button>
                  </span>
                )}
                {selectedPriceRange !== null && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                    {priceRanges[selectedPriceRange].label}
                    <button onClick={() => handlePriceRangeChange(null)} className="ml-1 hover:text-primary/70"><i className="fas fa-times text-xs"></i></button>
                  </span>
                )}
                <button onClick={handleClearFilters} className="text-sm text-gray-500 hover:text-primary underline">Clear all</button>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className={`grid ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'} gap-4 md:gap-6`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className={`grid ${viewMode === 'list' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'} gap-4 md:gap-6`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && products.length === 0 && (
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
