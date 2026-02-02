import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const tiers = [
  {
    name: 'Bronze',
    spend: 'Free to Join',
    points: '1 point per UGX 1,000',
    color: 'from-amber-600 to-amber-800',
    benefits: [
      'Earn points on every purchase',
      'Birthday reward (500 points)',
      'Member-only promotions',
      'Early access to sales',
    ],
  },
  {
    name: 'Silver',
    spend: 'UGX 500,000+ annually',
    points: '1.25 points per UGX 1,000',
    color: 'from-gray-400 to-gray-600',
    benefits: [
      'All Bronze benefits',
      'Free shipping on orders over UGX 100,000',
      'Exclusive Silver member events',
      'Priority customer support',
      'Birthday reward (1,000 points)',
    ],
  },
  {
    name: 'Gold',
    spend: 'UGX 1,500,000+ annually',
    points: '1.5 points per UGX 1,000',
    color: 'from-yellow-500 to-yellow-700',
    benefits: [
      'All Silver benefits',
      'Free shipping on all orders',
      'VIP access to new products',
      'Complimentary gift wrapping',
      'Birthday reward (2,000 points)',
      'Exclusive Gold member gifts',
      'Personal beauty consultant',
    ],
  },
];

const earnMethods = [
  { icon: 'fa-shopping-bag', title: 'Shop', description: 'Earn points on every purchase', points: '1-1.5 pts/UGX 1,000' },
  { icon: 'fa-user-plus', title: 'Sign Up', description: 'Join the rewards program', points: '500 points' },
  { icon: 'fa-birthday-cake', title: 'Birthday', description: 'Celebrate with bonus points', points: '500-2,000 points' },
  { icon: 'fa-share-alt', title: 'Refer Friends', description: 'Share the love', points: '1,000 points' },
  { icon: 'fa-star', title: 'Write Reviews', description: 'Share your experience', points: '50 points' },
  { icon: 'fa-calendar-check', title: 'Salon Visits', description: 'Book appointments', points: '2x points' },
];

const redeemOptions = [
  { points: 100, value: 'UGX 5,000 off' },
  { points: 250, value: 'UGX 15,000 off' },
  { points: 500, value: 'UGX 35,000 off' },
  { points: 1000, value: 'UGX 80,000 off' },
  { points: 2000, value: 'UGX 180,000 off' },
  { points: 5000, value: 'UGX 500,000 off' },
];

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-rose-gold to-burgundy"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm mb-4">
            <i className="fas fa-crown mr-2"></i>
            Loyalty Program
          </span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            CHOCKY&apos;S Glamour Rewards
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join our exclusive rewards program and earn points on every purchase. 
            Unlock amazing benefits and save on your favorite beauty products.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/account/register" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4">
              Join Now - It&apos;s Free
            </Link>
            <Link href="/account/login" className="btn border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">HOW IT WORKS</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">
              Start Earning in 3 Easy Steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, icon: 'fa-user-plus', title: 'Join', desc: 'Sign up for free and become a member' },
              { step: 2, icon: 'fa-shopping-bag', title: 'Shop', desc: 'Earn points on every purchase you make' },
              { step: 3, icon: 'fa-gift', title: 'Redeem', desc: 'Use your points for discounts and rewards' },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center relative">
                  <i className={`fas ${item.icon} text-2xl text-primary`}></i>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">MEMBERSHIP TIERS</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
              Unlock More Benefits as You Shop
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The more you shop, the more you earn. Climb the tiers and enjoy exclusive perks.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <div key={tier.name} className={`bg-white rounded-2xl overflow-hidden shadow-lg ${index === 2 ? 'ring-2 ring-primary' : ''}`}>
                <div className={`bg-gradient-to-r ${tier.color} p-6 text-white text-center`}>
                  <h3 className="font-heading text-2xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-white/80 text-sm">{tier.spend}</p>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6 pb-6 border-b border-gray-100">
                    <span className="text-3xl font-bold text-primary">{tier.points}</span>
                  </div>
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-green-500 mt-1"></i>
                        <span className="text-gray-600 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ways to Earn */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">EARN POINTS</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
              Multiple Ways to Earn
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {earnMethods.map((method, index) => (
              <div key={index} className="bg-cream rounded-xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className={`fas ${method.icon} text-primary`}></i>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{method.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                  <span className="text-primary font-medium text-sm">{method.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redeem Points */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">REDEEM REWARDS</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
              Turn Points into Savings
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Redeem your points for discounts on your purchases. The more points you have, the bigger the savings!
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {redeemOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-xl p-4 text-center shadow-soft hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-primary mb-1">{option.points}</div>
                <div className="text-xs text-gray-500 mb-2">points</div>
                <div className="text-sm font-medium">{option.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">FAQ</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">
              Common Questions
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'How do I join the rewards program?', a: 'Simply create an account on our website or in-store. Membership is free and you\'ll start earning points immediately.' },
              { q: 'Do my points expire?', a: 'Points are valid for 12 months from the date they were earned. Make at least one purchase within 12 months to keep your points active.' },
              { q: 'Can I use points and a promo code together?', a: 'Yes! You can combine points redemption with most promotional codes for maximum savings.' },
              { q: 'How do I check my points balance?', a: 'Log into your account and visit the Rewards section to see your current balance, tier status, and transaction history.' },
            ].map((faq, index) => (
              <div key={index} className="bg-cream rounded-xl p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary via-rose-gold to-burgundy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Start Earning Today
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join CHOCKY&apos;S Glamour Rewards and start earning points on every purchase. 
            It&apos;s free to join and the benefits are endless!
          </p>
          <Link href="/account/register" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4">
            <i className="fas fa-crown mr-2"></i>
            Join Now - It&apos;s Free
          </Link>
        </div>
      </section>
    </div>
  );
}
