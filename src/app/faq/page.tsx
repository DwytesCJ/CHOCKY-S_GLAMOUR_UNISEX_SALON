"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const faqCategories = [
  { id: 'orders', name: 'Orders & Shipping', icon: 'fa-truck' },
  { id: 'payments', name: 'Payments', icon: 'fa-credit-card' },
  { id: 'returns', name: 'Returns & Refunds', icon: 'fa-undo' },
  { id: 'products', name: 'Products', icon: 'fa-box' },
  { id: 'salon', name: 'Salon Services', icon: 'fa-cut' },
  { id: 'rewards', name: 'Rewards Program', icon: 'fa-crown' },
  { id: 'account', name: 'Account', icon: 'fa-user' },
];

const faqs = [
  // Orders & Shipping
  {
    id: 1,
    category: 'orders',
    question: 'How long does delivery take?',
    answer: 'Standard delivery within Kampala takes 2-3 business days. For areas outside Kampala, delivery takes 3-5 business days. Express delivery (available in Kampala only) delivers within 24 hours for orders placed before 2 PM.',
  },
  {
    id: 2,
    category: 'orders',
    question: 'What are the delivery charges?',
    answer: 'Standard delivery within Kampala is UGX 10,000. Express delivery is UGX 20,000. Orders above UGX 100,000 qualify for FREE standard delivery. Delivery to other districts varies based on location.',
  },
  {
    id: 3,
    category: 'orders',
    question: 'Can I track my order?',
    answer: 'Yes! Once your order is shipped, you will receive an SMS and email with tracking information. You can also track your order by logging into your account and viewing your order history.',
  },
  {
    id: 4,
    category: 'orders',
    question: 'Do you offer in-store pickup?',
    answer: 'Yes, you can choose to pick up your order from our store in Kampala. Select "Store Pickup" at checkout. Your order will be ready within 24 hours, and you will receive a notification when it is ready.',
  },
  // Payments
  {
    id: 5,
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept Mobile Money (MTN MoMo and Airtel Money), Visa and Mastercard credit/debit cards, and Cash on Delivery (within Kampala only). All payments are secure and encrypted.',
  },
  {
    id: 6,
    category: 'payments',
    question: 'Is it safe to pay online?',
    answer: 'Absolutely! We use industry-standard SSL encryption to protect your payment information. We never store your full card details on our servers. All transactions are processed through secure payment gateways.',
  },
  {
    id: 7,
    category: 'payments',
    question: 'Can I pay in installments?',
    answer: 'Currently, we do not offer installment payment options. However, we are working on partnerships to bring this feature soon. Stay tuned for updates!',
  },
  // Returns & Refunds
  {
    id: 8,
    category: 'returns',
    question: 'What is your return policy?',
    answer: 'We accept returns within 14 days of delivery for unused, unopened products in their original packaging. Some items like earrings, intimate products, and sale items are final sale and cannot be returned.',
  },
  {
    id: 9,
    category: 'returns',
    question: 'How do I initiate a return?',
    answer: 'To initiate a return, log into your account, go to Order History, select the order, and click "Request Return." Alternatively, contact our customer service via WhatsApp or email with your order number.',
  },
  {
    id: 10,
    category: 'returns',
    question: 'How long do refunds take?',
    answer: 'Once we receive and inspect your return, refunds are processed within 5-7 business days. Mobile Money refunds are instant, while card refunds may take 5-10 business days to reflect in your account.',
  },
  {
    id: 11,
    category: 'returns',
    question: 'Can I exchange a product?',
    answer: 'Yes, you can exchange products for a different size, color, or variant within 14 days. If the new item costs more, you will pay the difference. If it costs less, we will refund the difference.',
  },
  // Products
  {
    id: 12,
    category: 'products',
    question: 'Are your products authentic?',
    answer: 'Yes, all our products are 100% authentic. We source directly from authorized distributors and brands. We guarantee the authenticity of every product we sell.',
  },
  {
    id: 13,
    category: 'products',
    question: 'How do I know which shade/size to choose?',
    answer: 'We provide detailed product descriptions, shade guides, and size charts on each product page. For makeup, you can visit our store for a free color match consultation, or use our virtual try-on feature (coming soon).',
  },
  {
    id: 14,
    category: 'products',
    question: 'Do you offer product samples?',
    answer: 'Yes! We include free samples with orders over UGX 50,000. You can also request specific samples at checkout (subject to availability). Visit our store for free testers of most products.',
  },
  // Salon Services
  {
    id: 15,
    category: 'salon',
    question: 'How do I book a salon appointment?',
    answer: 'You can book online through our website, call us at +256 700 123 456, or send a WhatsApp message. Online booking is available 24/7 and you will receive instant confirmation.',
  },
  {
    id: 16,
    category: 'salon',
    question: 'Can I cancel or reschedule my appointment?',
    answer: 'Yes, you can cancel or reschedule up to 24 hours before your appointment without any charge. Cancellations within 24 hours may incur a 50% cancellation fee.',
  },
  {
    id: 17,
    category: 'salon',
    question: 'Do I need to pay a deposit for appointments?',
    answer: 'For standard services, no deposit is required. For bridal packages and services over UGX 200,000, we require a 30% deposit to confirm your booking.',
  },
  {
    id: 18,
    category: 'salon',
    question: 'What if I am not satisfied with my service?',
    answer: 'Your satisfaction is our priority. If you are not happy with your service, please let us know immediately. We will do our best to fix it at no extra charge. For major concerns, contact our manager.',
  },
  // Rewards Program
  {
    id: 19,
    category: 'rewards',
    question: 'How do I join the rewards program?',
    answer: 'Simply create an account on our website or in-store. You are automatically enrolled in our Bronze tier and start earning points immediately. It is completely free to join!',
  },
  {
    id: 20,
    category: 'rewards',
    question: 'How do I earn points?',
    answer: 'Earn 1 point for every UGX 1,000 spent on products and services. Bonus points are available during special promotions, on your birthday, and for referring friends.',
  },
  {
    id: 21,
    category: 'rewards',
    question: 'Do points expire?',
    answer: 'Points expire 12 months after they are earned if there is no account activity. Make a purchase or redeem points to keep your account active and prevent expiration.',
  },
  {
    id: 22,
    category: 'rewards',
    question: 'How do I redeem my points?',
    answer: 'You can redeem points at checkout online or in-store. 100 points = UGX 5,000 off. Minimum redemption is 100 points. Points cannot be redeemed for cash.',
  },
  // Account
  {
    id: 23,
    category: 'account',
    question: 'How do I create an account?',
    answer: 'Click "Sign Up" on our website, enter your email and create a password. You can also sign up using your Google or Facebook account for faster registration.',
  },
  {
    id: 24,
    category: 'account',
    question: 'I forgot my password. What do I do?',
    answer: 'Click "Forgot Password" on the login page and enter your email. We will send you a link to reset your password. The link expires in 24 hours.',
  },
  {
    id: 25,
    category: 'account',
    question: 'How do I update my account information?',
    answer: 'Log into your account, go to "Settings" and you can update your personal information, email, phone number, and password. Changes are saved automatically.',
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: number) => {
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
                <nav className="space-y-1">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <i className={`fas ${category.icon} w-5`}></i>
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* FAQ List */}
            <div className="flex-1">
              {searchQuery && (
                <p className="text-gray-600 mb-4">
                  Showing results for &quot;{searchQuery}&quot; ({filteredFaqs.length} found)
                </p>
              )}
              
              {filteredFaqs.length > 0 ? (
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
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
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
                href="https://wa.me/256700123456"
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
                href="mailto:support@chockys.ug"
                className="p-6 bg-cream rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-envelope text-primary text-xl"></i>
                </div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-sm text-gray-500">support@chockys.ug</p>
              </a>
              <a
                href="tel:+256700123456"
                className="p-6 bg-cream rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-phone-alt text-primary text-xl"></i>
                </div>
                <h3 className="font-semibold mb-1">Call Us</h3>
                <p className="text-sm text-gray-500">+256 700 123 456</p>
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
