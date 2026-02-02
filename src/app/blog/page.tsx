"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { id: 'all', name: 'All Posts' },
  { id: 'tutorials', name: 'Tutorials' },
  { id: 'tips', name: 'Beauty Tips' },
  { id: 'trends', name: 'Trends' },
  { id: 'skincare', name: 'Skincare' },
  { id: 'hair', name: 'Hair Care' },
  { id: 'bridal', name: 'Bridal' },
];

const blogPosts = [
  {
    id: 1,
    title: '10 Essential Skincare Tips for Glowing Skin in Uganda\'s Climate',
    excerpt: 'Discover the best skincare routine tailored for tropical weather. From hydration to sun protection, we cover everything you need.',
    image: '/images/products/skincare/pexels-misolo-cosmetic-2588316-4841339.jpg',
    category: 'skincare',
    author: 'Grace Nakamya',
    authorImage: '/images/team/SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg',
    date: 'January 28, 2024',
    readTime: '5 min read',
    featured: true,
  },
  {
    id: 2,
    title: 'Bridal Makeup Trends 2024: What Every Ugandan Bride Should Know',
    excerpt: 'From traditional elegance to modern glamour, explore the hottest bridal makeup trends that will make your special day unforgettable.',
    image: '/images/products/makeup/pexels-828860-2536009.jpg',
    category: 'bridal',
    author: 'Amina Hassan',
    authorImage: '/images/team/SnapInsta.to_624543554_18078416900580404_729626818934809874_n.jpg',
    date: 'January 25, 2024',
    readTime: '7 min read',
    featured: true,
  },
  {
    id: 3,
    title: 'How to Choose the Perfect Wig for Your Face Shape',
    excerpt: 'Finding the right wig can transform your look. Learn how to select styles that complement your unique features.',
    image: '/images/products/hair/pexels-venus-31818416.jpg',
    category: 'hair',
    author: 'Sarah Ochieng',
    authorImage: '/images/team/SnapInsta.to_625048011_18078416870580404_5424531763907010008_n.jpg',
    date: 'January 22, 2024',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 4,
    title: 'Step-by-Step: Creating the Perfect Smoky Eye',
    excerpt: 'Master the art of the smoky eye with our detailed tutorial. Perfect for evening events and special occasions.',
    image: '/images/products/makeup/pexels-shiny-diamond-3373734.jpg',
    category: 'tutorials',
    author: 'Grace Nakamya',
    authorImage: '/images/team/SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg',
    date: 'January 20, 2024',
    readTime: '8 min read',
    featured: false,
  },
  {
    id: 5,
    title: 'Natural Hair Care: Embracing Your Beautiful Texture',
    excerpt: 'Celebrate your natural hair with these expert tips on moisturizing, styling, and maintaining healthy curls and coils.',
    image: '/images/products/hair/pexels-rdne-6923351.jpg',
    category: 'hair',
    author: 'Amina Hassan',
    authorImage: '/images/team/SnapInsta.to_624543554_18078416900580404_729626818934809874_n.jpg',
    date: 'January 18, 2024',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 6,
    title: 'Top 5 Perfumes Every Woman Should Own',
    excerpt: 'Build your fragrance wardrobe with these versatile scents perfect for any occasion, from work to date night.',
    image: '/images/products/perfumes/pexels-valeriya-724635.jpg',
    category: 'tips',
    author: 'Sarah Ochieng',
    authorImage: '/images/team/SnapInsta.to_625048011_18078416870580404_5424531763907010008_n.jpg',
    date: 'January 15, 2024',
    readTime: '4 min read',
    featured: false,
  },
  {
    id: 7,
    title: 'Spring/Summer 2024 Beauty Trends to Watch',
    excerpt: 'Get ahead of the curve with these upcoming beauty trends. From bold lips to dewy skin, here\'s what\'s in.',
    image: '/images/products/makeup/pexels-828860-2693644.jpg',
    category: 'trends',
    author: 'Grace Nakamya',
    authorImage: '/images/team/SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg',
    date: 'January 12, 2024',
    readTime: '5 min read',
    featured: false,
  },
  {
    id: 8,
    title: 'DIY Face Masks Using Kitchen Ingredients',
    excerpt: 'Pamper your skin with these easy homemade face masks. Natural, affordable, and effective!',
    image: '/images/products/skincare/pexels-karola-g-4889036.jpg',
    category: 'skincare',
    author: 'Amina Hassan',
    authorImage: '/images/team/SnapInsta.to_624543554_18078416900580404_729626818934809874_n.jpg',
    date: 'January 10, 2024',
    readTime: '5 min read',
    featured: false,
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">Beauty Blog</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Tips, tutorials, and trends to help you look and feel your best
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-primary"
            />
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/50"></i>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {activeCategory === 'all' && searchQuery === '' && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="group">
                  <article className="bg-cream rounded-2xl overflow-hidden shadow-soft hover:shadow-lg transition-shadow">
                    <div className="relative h-64">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full capitalize">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                            <Image
                              src={post.authorImage}
                              alt={post.author}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-sm font-medium">{post.author}</span>
                        </div>
                        <span className="text-sm text-gray-500">{post.readTime}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories & Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="group">
                  <article className="bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="relative h-48">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded capitalize">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                          <Image
                            src={post.authorImage}
                            alt={post.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-600">{post.author}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No articles found matching your criteria.</p>
            </div>
          )}

          {/* Load More */}
          {filteredPosts.length > 0 && (
            <div className="text-center mt-12">
              <button className="btn btn-outline">
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-primary via-rose-gold to-burgundy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Get the latest beauty tips, tutorials, and exclusive offers delivered to your inbox.
          </p>
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none"
            />
            <button type="submit" className="btn bg-white text-primary hover:bg-gray-100 px-6">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
