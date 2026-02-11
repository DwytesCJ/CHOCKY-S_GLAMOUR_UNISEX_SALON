"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';

// Icon mapping for known categories
const categoryIcons: Record<string, string> = {
  'Orders & Shipping': 'fa-truck',
  'Payments': 'fa-credit-card',
  'Returns & Refunds': 'fa-undo',
  'Products': 'fa-box',
  'Salon Services': 'fa-cut',
  'Rewards Program': 'fa-crown',
  'Account': 'fa-user',
  'Privacy Policy': 'fa-shield-alt',
  'Terms of Service': 'fa-file-contract',
  'General': 'fa-question-circle',
};

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

// Hardcoded fallback FAQs in case API returns empty
const fallbackFaqs: FAQ[] = [
  {
    id: 'f1', category: 'Orders & Shipping', sortOrder: 1, isActive: true,
    question: 'How long does delivery take?',
    answer: 'Standard delivery within Kampala takes 2-3 business days. For areas outside Kampala, delivery takes 3-5 business days. Express delivery (available in Kampala only) delivers within 24 hours for orders placed before 2 PM.',
  },
  {
    id: 'f2', category: 'Orders & Shipping', sortOrder: 2, isActive: true,
    question: 'What are the delivery charges?',
    answer: 'Standard delivery within Kampala is UGX 10,000. Express delivery is UGX 20,000. Orders above UGX 100,000 qualify for FREE standard delivery. Delivery to other districts varies based on location.',
  },
  {
    id: 'f3', category: 'Orders & Shipping', sortOrder: 3, isActive: true,
    question: 'Can I track my order?',
    answer: 'Yes! Once your order is shipped, you will receive an SMS and email with tracking information. You can also track your order by logging into your account and viewing your order history.',
  },
  {
    id: 'f4', category: 'Payments', sortOrder: 1, isActive: true,
    question: 'What payment methods do you accept?',
    answer: 'We accept Mobile Money (MTN MoMo and Airtel Money), Visa and Mastercard credit/debit cards, and Cash on Delivery (within Kampala only). All payments are secure and encrypted.',
  },
  {
    id: 'f5', category: 'Returns & Refunds', sortOrder: 1, isActive: true,
    question: 'What is your return policy?',
    answer: 'We accept returns within 14 days of delivery for unused, unopened products in their original packaging. Some items like earrings, intimate products, and sale items are final sale and cannot be returned.',
  },
  {
    id: 'f6', category: 'Products', sortOrder: 1, isActive: true,
    question: 'Are your products authentic?',
    answer: 'Yes, all our products are 100% authentic. We source directly from authorized distributors and brands. We guarantee the authenticity of every product we sell.',
  },
  {
    id: 'f7', category: 'Salon Services', sortOrder: 1, isActive: true,
    question: 'How do I book a salon appointment?',
    answer: 'You can book online through our website, call us, or send a WhatsApp message. Online booking is available 24/7 and you will receive instant confirmation.',
  },
  {
    id: 'f8', category: 'Rewards Program', sortOrder: 1, isActive: true,
    question: 'How do I join the rewards program?',
    answer: 'Simply create an account on our website or in-store. You are automatically enrolled in our Bronze tier and start earning points immediately. It is completely free to join!',
  },
  {
    id: 'f9', category: 'Account', sortOrder: 1, isActive: true,
    question: 'How do I create an account?',
    answer: 'Click "Sign Up" on our website, enter your email and create a password. You can also sign up using your Google or Facebook account for faster registration.',
  },
  {
    id: 'f10', category: 'Privacy Policy', sortOrder: 1, isActive: true,
    question: 'What personal information do you collect?',
    answer: 'We collect information you provide during registration (name, email, phone number), order details (shipping address, payment method), browsing behavior on our site, and salon appointment preferences. We only collect data necessary to provide our services.',
  },
  {
    id: 'f11', category: 'Terms of Service', sortOrder: 1, isActive: true,
    question: 'What are the general terms for using this website?',
    answer: 'By using CHOCKY\'S Ultimate Glamour website, you agree to be at least 18 years old (or have parental consent), provide accurate registration information, not misuse the platform, and comply with Ugandan laws.',
  },
];

export default function FAQPage() {
  const { settings } = useSiteSettings();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Format contact info from settings
  const whatsappNumber = settings.storeWhatsapp.replace(/[^0-9]/g, '');
  const phoneDisplay = settings.storePhone.replace(/(\+256)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch('/api/faq');
        const data = await res.json();
        if (data.success && data.data.faqs.length > 0) {
          setFaqs(data.data.faqs);
          // Build categories from grouped keys
          const grouped = data.data.grouped as Record<string, FAQ[]>;
          const cats = Object.keys(grouped).map((name) => ({
            id: name,
            name,
            icon: categoryIcons[name] || 'fa-question-circle',
          }));
          setCategories(cats);
          if (cats.length > 0) {
            setActiveCategory(cats[0].name);
          }
        } else {
          // Use fallback data
          setFaqs(fallbackFaqs);
          const uniqueCats = [...new Set(fallbackFaqs.map(f => f.category))];
          setCategories(uniqueCats.map(name => ({
            id: name,
            name,
            icon: categoryIcons[name] || 'fa-question-circle',
          })));
          setActiveCategory(uniqueCats[0] || 'all');
        }
      } catch {
        // Use fallback data on error
        setFaqs(fallbackFaqs);
        const uniqueCats = [...new Set(fallbackFaqs.map(f => f.category))];
        setCategories(uniqueCats.map(name => ({
          id: name,
          name,
          icon: categoryIcons[name] || 'fa-question-circle',
        })));
        setActiveCategory(uniqueCats[0] || 'all');
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  // Handle hash-based navigation (e.g., /faq#privacy)
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash) {
        // Try to match hash to a category
        const matchedCat = categories.find(c => 
          c.name.toLowerCase().replace(/\s+/g, '-').includes(hash) ||
          c.name.toLowerCase().includes(hash)
        );
        if (matchedCat) {
          setActiveCategory(matchedCat.name);
        }
      }
    }
  }, [loading, categories]);

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Find answers to common questions about orders, payments, returns, and more.
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-primary"
            />
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/50"></i>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-soft p-4 sticky top-24">
                <h3 className="font-semibold mb-4 px-2">Categories</h3>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <nav className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveCategory(category.name);
                          setSearchQuery('');
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeCategory === category.name
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <i className={`fas ${category.icon} w-5`}></i>
                        <span className="text-sm font-medium">{category.name}</span>
                      </button>
                    ))}
                  </nav>
                )}
              </div>
            </aside>

            {/* FAQ List */}
            <div className="flex-1">
              {searchQuery && (
                <p className="text-gray-600 mb-4">
                  Showing results for &quot;{searchQuery}&quot; ({filteredFaqs.length} found)
                </p>
              )}
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-soft p-5">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredFaqs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white rounded-xl shadow-soft overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <span className="font-medium pr-4">{faq.question}</span>
                        <i className={`fas fa-chevron-down text-gray-400 transition-transform ${
                          openFaq === faq.id ? 'rotate-180' : ''
                        }`}></i>
                      </button>
                      {openFaq === faq.id && (
                        <div className="px-5 pb-5">
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-soft">
                  <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500 mb-4">No results found for &quot;{searchQuery}&quot;</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-primary hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-8">
              Can&apos;t find what you&apos;re looking for? Our customer support team is here to help.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 bg-cream rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fab fa-whatsapp text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold mb-1">WhatsApp</h3>
                <p className="text-sm text-gray-500">Quick responses</p>
              </a>
              <a
                href={`mailto:${settings.storeEmail}`}
                className="p-6 bg-cream rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-envelope text-primary text-xl"></i>
                </div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-sm text-gray-500">{settings.storeEmail}</p>
              </a>
              <a
                href={`tel:${settings.storePhone}`}
                className="p-6 bg-cream rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-phone-alt text-primary text-xl"></i>
                </div>
                <h3 className="font-semibold mb-1">Call Us</h3>
                <p className="text-sm text-gray-500">{phoneDisplay}</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary via-rose-gold to-burgundy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Shop?
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Explore our collection of beauty products and salon services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn bg-white text-primary hover:bg-gray-100">
              Shop Now
            </Link>
            <Link href="/salon/booking" className="btn btn-outline border-white text-white hover:bg-white/10">
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
