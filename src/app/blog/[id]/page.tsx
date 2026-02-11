"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Sample blog post data
const blogPosts = [
  {
    id: '1',
    title: '10 Essential Skincare Tips for Glowing Skin in Uganda\'s Climate',
    excerpt: 'Discover the best skincare routine tailored for tropical weather.',
    content: `
      <p>Living in Uganda's tropical climate presents unique challenges for skincare. The combination of heat, humidity, and sun exposure requires a thoughtful approach to maintaining healthy, glowing skin. Here are our top 10 tips to help you achieve that radiant complexion.</p>
      
      <h2>1. Hydration is Key</h2>
      <p>In our warm climate, your skin loses moisture quickly. Drink at least 8 glasses of water daily and use a lightweight, hydrating moisturizer. Look for ingredients like hyaluronic acid that attract and retain moisture without feeling heavy.</p>
      
      <h2>2. Never Skip Sunscreen</h2>
      <p>UV rays are intense year-round in Uganda. Apply a broad-spectrum SPF 30+ sunscreen every morning, even on cloudy days. Reapply every 2 hours if you're outdoors. This is the single most important step in preventing premature aging and skin damage.</p>
      
      <h2>3. Double Cleanse at Night</h2>
      <p>After a day of sweat, sunscreen, and environmental pollutants, a single cleanse isn't enough. Start with an oil-based cleanser to remove makeup and sunscreen, then follow with a gentle water-based cleanser to remove any remaining impurities.</p>
      
      <h2>4. Exfoliate Regularly</h2>
      <p>Dead skin cells can build up faster in humid climates, leading to dull skin and clogged pores. Exfoliate 2-3 times per week with a gentle chemical exfoliant containing AHAs or BHAs. Avoid harsh physical scrubs that can damage your skin barrier.</p>
      
      <h2>5. Use Lightweight Products</h2>
      <p>Heavy creams can feel suffocating in our climate. Opt for gel-based moisturizers, serums, and lightweight lotions that absorb quickly without leaving a greasy residue.</p>
      
      <h2>6. Don't Forget Your Neck</h2>
      <p>Your neck and décolletage are often exposed to the sun but frequently neglected in skincare routines. Extend all your products—cleanser, serum, moisturizer, and sunscreen—to these areas.</p>
      
      <h2>7. Incorporate Vitamin C</h2>
      <p>A vitamin C serum in the morning can help brighten your skin, fade dark spots, and provide antioxidant protection against environmental damage. Apply it before your moisturizer and sunscreen.</p>
      
      <h2>8. Keep Blotting Papers Handy</h2>
      <p>For those with oily skin, blotting papers are a lifesaver. They remove excess oil without disturbing your makeup or sunscreen. Keep a pack in your bag for midday touch-ups.</p>
      
      <h2>9. Treat Hyperpigmentation</h2>
      <p>Dark spots and uneven skin tone are common concerns. Look for products with niacinamide, kojic acid, or alpha arbutin to help fade hyperpigmentation over time. Be patient—results take 6-8 weeks to show.</p>
      
      <h2>10. Get Professional Treatments</h2>
      <p>Regular facials can help maintain your skin's health. At CHOCKY'S, our skilled estheticians offer customized treatments tailored to your skin's specific needs. Book a consultation to create your personalized skincare plan.</p>
      
      <h2>Conclusion</h2>
      <p>Beautiful skin is achievable with the right routine and products. Remember, consistency is key—stick to your routine for at least 4-6 weeks before expecting significant results. Visit our salon for a professional skin analysis and personalized product recommendations.</p>
    `,
    image: '/uploads/products/skincare/pexels-misolo-cosmetic-2588316-4841339.jpg',
    category: 'skincare',
    author: 'Grace Nakamya',
    authorImage: '/uploads/team/SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg',
    authorBio: 'Grace is a certified esthetician with over 8 years of experience in skincare. She specializes in treating hyperpigmentation and acne-prone skin.',
    date: 'January 28, 2024',
    readTime: '5 min read',
  },
];

const relatedPosts = [
  {
    id: 2,
    title: 'DIY Face Masks Using Kitchen Ingredients',
    image: '/uploads/products/skincare/pexels-828860-2587177.jpg',
    category: 'skincare',
    date: 'January 10, 2024',
  },
  {
    id: 3,
    title: 'Understanding Your Skin Type',
    image: '/uploads/products/skincare/pexels-misolo-cosmetic-2588316-4841339.jpg',
    category: 'skincare',
    date: 'January 5, 2024',
  },
  {
    id: 4,
    title: 'The Best Serums for Every Skin Concern',
    image: '/uploads/products/skincare/pexels-828860-2587177.jpg',
    category: 'skincare',
    date: 'December 28, 2023',
  },
];

export default function BlogArticlePage() {
  const params = useParams();
  const postId = params.id as string;
  
  // Find the post (in real app, this would be an API call)
  const post = blogPosts.find(p => p.id === postId) || blogPosts[0];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] bg-gray-900">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        
        {/* Breadcrumbs */}
        <div className="absolute top-0 left-0 right-0 pt-24">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-white/70">
              <Link href="/" className="hover:text-white">Home</Link>
              <i className="fas fa-chevron-right text-xs"></i>
              <Link href="/blog" className="hover:text-white">Blog</Link>
              <i className="fas fa-chevron-right text-xs"></i>
              <span className="text-white capitalize">{post.category}</span>
            </nav>
          </div>
        </div>
        
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 pb-8">
          <div className="container mx-auto px-4">
            <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-medium rounded-full mb-4 capitalize">
              {post.category}
            </span>
            <h1 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={post.authorImage}
                    alt={post.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{post.author}</p>
                  <p className="text-sm text-gray-500">{post.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-auto text-sm text-gray-500">
                <span><i className="far fa-clock mr-1"></i> {post.readTime}</span>
                <span><i className="far fa-eye mr-1"></i> 1.2k views</span>
              </div>
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none
                prose-headings:font-heading prose-headings:font-semibold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-p:text-gray-600 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Tags:</span>
                {['skincare', 'tips', 'routine', 'tropical'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium">Share:</span>
              <div className="flex gap-2">
                {[
                  { icon: 'fa-facebook-f', color: 'hover:bg-blue-600' },
                  { icon: 'fa-twitter', color: 'hover:bg-sky-500' },
                  { icon: 'fa-pinterest-p', color: 'hover:bg-red-600' },
                  { icon: 'fa-whatsapp', color: 'hover:bg-green-500' },
                ].map((social, index) => (
                  <button
                    key={index}
                    className={`w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 ${social.color} hover:text-white transition-colors`}
                  >
                    <i className={`fab ${social.icon}`}></i>
                  </button>
                ))}
              </div>
            </div>

            {/* Author Box */}
            <div className="mt-12 p-6 bg-white rounded-xl shadow-soft">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={post.authorImage}
                    alt={post.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">About {post.author}</h3>
                  <p className="text-gray-600 text-sm mb-3">{post.authorBio}</p>
                  <div className="flex gap-2">
                    <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-instagram"></i></a>
                    <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-twitter"></i></a>
                    <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-linkedin-in"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold mb-8 text-center">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`} className="group">
                <article className="bg-cream rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-shadow">
                  <div className="relative h-40">
                    <Image
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-primary font-medium capitalize">{relatedPost.category}</span>
                    <h3 className="font-heading font-semibold mt-1 group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">{relatedPost.date}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary via-rose-gold to-burgundy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Transform Your Skin?
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Book a consultation with our skincare experts and get personalized recommendations.
          </p>
          <Link href="/salon/booking" className="btn bg-white text-primary hover:bg-gray-100">
            Book a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
