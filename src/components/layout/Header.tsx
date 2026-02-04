"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const navigation = [
  { name: 'Home', href: '/' },
  { 
    name: 'Shop', 
    href: '/shop',
    megaMenu: [
      {
        title: 'Hair Styling',
        items: [
          { name: 'Wigs & Extensions', href: '/shop/hair/wigs' },
          { name: 'Hair Care Products', href: '/shop/hair/care' },
          { name: 'Styling Tools', href: '/shop/hair/tools' },
          { name: 'Hair Accessories', href: '/shop/hair/accessories' },
        ]
      },
      {
        title: 'Makeup',
        items: [
          { name: 'Face', href: '/shop/makeup/face' },
          { name: 'Eyes', href: '/shop/makeup/eyes' },
          { name: 'Lips', href: '/shop/makeup/lips' },
          { name: 'Tools & Brushes', href: '/shop/makeup/tools' },
        ]
      },
      {
        title: 'Skincare',
        items: [
          { name: 'Cleansers', href: '/shop/skincare/cleansers' },
          { name: 'Moisturizers', href: '/shop/skincare/moisturizers' },
          { name: 'Serums', href: '/shop/skincare/serums' },
          { name: 'Sun Care', href: '/shop/skincare/suncare' },
        ]
      },
      {
        title: 'More',
        items: [
          { name: 'Perfumes', href: '/shop/perfumes' },
          { name: 'Jewelry', href: '/shop/jewelry' },
          { name: 'Bags', href: '/shop/bags' },
          { name: 'Gift Sets', href: '/shop/gifts' },
        ]
      },
    ]
  },
  { name: 'Salon', href: '/salon' },
  { name: 'Blog', href: '/blog' },
  { name: 'Rewards', href: '/rewards' },
  { name: 'About', href: '/about' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: session, status } = useSession();
  const { totalItems: cartItems, toggleCart } = useCart();
  const { totalItems: wishlistItems } = useWishlist();

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine text colors based on scroll state
  const textColor = isScrolled ? 'text-gray-800' : 'lg:text-white text-gray-800';
  const hoverBg = isScrolled ? 'hover:bg-gray-100' : 'lg:hover:bg-white/20 hover:bg-gray-100';

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-primary via-rose-gold to-burgundy text-white py-2 text-center text-xs sm:text-sm">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <i className="fas fa-truck"></i>
          <span>Free Delivery on Orders Over UGX 100,000 | <Link href="/shop" className="underline hover:no-underline">Shop Now</Link></span>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white shadow-md' 
            : 'lg:bg-transparent bg-white'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Text Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-rose-gold flex items-center justify-center`}>
                <span className="text-white font-bold text-lg sm:text-xl">C</span>
              </div>
              <div className="flex flex-col">
                <span className={`font-heading font-bold text-lg sm:text-xl leading-tight ${isScrolled ? 'text-gray-900' : 'lg:text-white text-gray-900'}`}>
                  CHOCKY&apos;S
                </span>
                <span className={`text-[10px] sm:text-xs tracking-wider ${isScrolled ? 'text-primary' : 'lg:text-primary-200 text-primary'}`}>
                  ULTIMATE GLAMOUR
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.megaMenu && setActiveMenu(item.name)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={item.href}
                    className={`py-2 font-medium transition-colors ${textColor} hover:text-primary`}
                  >
                    {item.name}
                    {item.megaMenu && (
                      <i className="fas fa-chevron-down ml-1 text-xs"></i>
                    )}
                  </Link>

                  {/* Mega Menu */}
                  {item.megaMenu && activeMenu === item.name && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 animate-fade-in">
                      <div className="bg-white rounded-xl shadow-xl p-6 min-w-[600px] grid grid-cols-4 gap-6">
                        {item.megaMenu.map((section) => (
                          <div key={section.title}>
                            <h3 className="font-semibold text-primary mb-3 text-sm">
                              {section.title}
                            </h3>
                            <ul className="space-y-2">
                              {section.items.map((subItem) => (
                                <li key={subItem.name}>
                                  <Link
                                    href={subItem.href}
                                    className="text-gray-600 hover:text-primary transition-colors text-sm"
                                  >
                                    {subItem.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-full transition-colors ${textColor} ${hoverBg}`}
                aria-label="Search"
              >
                <i className="fas fa-search text-lg"></i>
              </button>

              {/* Account */}
              <div className="relative group">
                <Link
                  href={status === 'authenticated' ? "/account" : "/account/login"}
                  className={`p-2 rounded-full transition-colors flex items-center gap-1 ${textColor} ${hoverBg}`}
                  aria-label="Account"
                >
                  <i className="fas fa-user text-lg"></i>
                  {status === 'authenticated' && session.user.firstName && (
                    <span className="hidden xl:inline text-xs font-semibold max-w-[80px] truncate">
                      {session.user.firstName}
                    </span>
                  )}
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
                  <div className="bg-white rounded-xl shadow-xl py-2 min-w-[200px] border border-gray-100 overflow-hidden">
                    {status === 'authenticated' ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="text-sm font-semibold truncate text-gray-900">{session.user.email}</p>
                        </div>
                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors">
                            <i className="fas fa-shield-alt w-5"></i>
                            Admin Dashboard
                          </Link>
                        )}
                        <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors">
                          <i className="fas fa-user-circle w-5"></i>
                          My Profile
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors">
                          <i className="fas fa-shopping-bag w-5"></i>
                          My Orders
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button 
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <i className="fas fa-sign-out-alt w-5"></i>
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/account/login" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors">
                          <i className="fas fa-sign-in-alt w-5"></i>
                          Sign In
                        </Link>
                        <Link href="/account/register" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors">
                          <i className="fas fa-user-plus w-5"></i>
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className={`p-2 rounded-full transition-colors relative ${textColor} ${hoverBg}`}
                aria-label="Wishlist"
              >
                <i className="fas fa-heart text-lg"></i>
                {wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {wishlistItems > 9 ? '9+' : wishlistItems}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className={`p-2 rounded-full transition-colors relative ${textColor} ${hoverBg}`}
                aria-label="Cart"
              >
                <i className="fas fa-shopping-bag text-lg"></i>
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartItems > 9 ? '9+' : cartItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-full transition-colors ${textColor} ${hoverBg}`}
                aria-label="Menu"
              >
                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <hr className="my-2" />
              <Link
                href="/account"
                className="py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors font-medium flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-user"></i>
                My Account
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 animate-fade-in"
          onClick={() => setIsSearchOpen(false)}
        >
          <div className="container mx-auto px-4 pt-20 sm:pt-32" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl mx-auto shadow-xl">
              <div className="flex items-center gap-3">
                <i className="fas fa-search text-gray-400 text-lg"></i>
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="flex-1 text-base sm:text-lg outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 mb-3">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {['Lipstick', 'Foundation', 'Wigs', 'Perfume', 'Skincare'].map((term) => (
                    <Link
                      key={term}
                      href={`/shop?search=${term}`}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white rounded-full text-sm transition-colors"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
