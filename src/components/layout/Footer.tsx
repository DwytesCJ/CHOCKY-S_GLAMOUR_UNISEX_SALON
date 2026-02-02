import React from 'react';
import Link from 'next/link';

const footerLinks = {
  shop: [
    { name: 'Hair Styling', href: '/shop?category=hair' },
    { name: 'Makeup', href: '/shop?category=makeup' },
    { name: 'Skincare', href: '/shop?category=skincare' },
    { name: 'Perfumes', href: '/shop?category=perfumes' },
    { name: 'Jewelry', href: '/shop?category=jewelry' },
    { name: 'Bags', href: '/shop?category=bags' },
  ],
  salon: [
    { name: 'Hair Services', href: '/salon#hair' },
    { name: 'Makeup Services', href: '/salon#makeup' },
    { name: 'Skin Treatments', href: '/salon#skin' },
    { name: 'Bridal Packages', href: '/salon#bridal' },
    { name: 'Book Appointment', href: '/salon/booking' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Shipping Info', href: '/faq#shipping' },
    { name: 'Returns & Exchanges', href: '/faq#returns' },
    { name: 'Track Order', href: '/account' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/about#story' },
    { name: 'Rewards Program', href: '/rewards' },
    { name: 'Blog', href: '/blog' },
  ],
};

const socialLinks = [
  { name: 'Facebook', icon: 'fab fa-facebook-f', href: 'https://facebook.com' },
  { name: 'Instagram', icon: 'fab fa-instagram', href: 'https://instagram.com' },
  { name: 'Twitter', icon: 'fab fa-twitter', href: 'https://twitter.com' },
  { name: 'TikTok', icon: 'fab fa-tiktok', href: 'https://tiktok.com' },
  { name: 'YouTube', icon: 'fab fa-youtube', href: 'https://youtube.com' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-primary via-pink-500 to-pink-700 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-heading text-2xl md:text-3xl font-bold mb-2">
                Join Our Glamour Club
              </h3>
              <p className="text-white/80">
                Subscribe for exclusive offers, beauty tips, and 10% off your first order!
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:bg-white/30 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-primary font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <div>
                  <span className="font-heading text-xl font-bold text-white">CHOCKY&apos;S</span>
                  <span className="block text-xs text-primary tracking-wider">ULTIMATE GLAMOUR</span>
                </div>
              </Link>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Your premier destination for luxury beauty products and professional salon services in Uganda. 
                Discover your ultimate glamour with us.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                    aria-label={social.name}
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Shop</h4>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Salon Links */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Salon</h4>
              <ul className="space-y-3">
                {footerLinks.salon.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <i className="fas fa-map-marker-alt text-primary mt-1"></i>
                  <span className="text-gray-400">
                    Kampala Road, Kampala<br />Uganda
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-phone text-primary"></i>
                  <a href="tel:+256700123456" className="text-gray-400 hover:text-primary transition-colors">
                    +256 700 123 456
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-envelope text-primary"></i>
                  <a href="mailto:info@chockys.ug" className="text-gray-400 hover:text-primary transition-colors">
                    info@chockys.ug
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fab fa-whatsapp text-primary"></i>
                  <a href="https://wa.me/256700123456" className="text-gray-400 hover:text-primary transition-colors">
                    WhatsApp Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} CHOCKY&apos;S Ultimate Glamour. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/faq#privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/faq#terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm mr-2">We Accept:</span>
              <div className="flex gap-2">
                <div className="px-2 py-1 bg-yellow-500 text-black rounded text-xs font-bold">
                  MTN
                </div>
                <div className="px-2 py-1 bg-red-500 text-white rounded text-xs font-bold">
                  Airtel
                </div>
                <div className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold">
                  Visa
                </div>
                <div className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-bold">
                  MC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/256700123456"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50"
        aria-label="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp text-2xl"></i>
      </a>
    </footer>
  );
}
