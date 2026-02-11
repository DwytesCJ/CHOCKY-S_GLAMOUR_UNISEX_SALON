"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import NotificationPanel from '@/components/admin/NotificationPanel';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: 'fa-tachometer-alt' },
  { name: 'Orders', href: '/admin/orders', icon: 'fa-shopping-bag' },
  { name: 'Products', href: '/admin/products', icon: 'fa-box' },
  { name: 'Categories', href: '/admin/categories', icon: 'fa-tags' },
  { name: 'Customers', href: '/admin/customers', icon: 'fa-users' },
  { name: 'Appointments', href: '/admin/appointments', icon: 'fa-calendar-check' },
  { name: 'Services', href: '/admin/services', icon: 'fa-spa' },
  { name: 'Stylists', href: '/admin/stylists', icon: 'fa-user-tie' },
  { name: 'Banners', href: '/admin/banners', icon: 'fa-image' },
  { name: 'Testimonials', href: '/admin/testimonials', icon: 'fa-quote-right' },
  { name: 'FAQs', href: '/admin/faq', icon: 'fa-question-circle' },
  { name: 'Blog', href: '/admin/blog', icon: 'fa-newspaper' },
  { name: 'Reviews', href: '/admin/reviews', icon: 'fa-star' },
  { name: 'Coupons', href: '/admin/coupons', icon: 'fa-ticket-alt' },
  { name: 'Promotions', href: '/admin/promotions', icon: 'fa-bullhorn' },
  { name: 'Content Blocks', href: '/admin/content-blocks', icon: 'fa-cube' },
  { name: 'Reports', href: '/admin/reports', icon: 'fa-chart-bar' },
  { name: 'Settings', href: '/admin/settings', icon: 'fa-cog' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  // Define allowed admin roles
  const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'];
  const userRole = session?.user?.role;
  const isAllowedRole = userRole && allowedRoles.includes(userRole);

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Encode the current path for proper redirect after login
      const currentPath = pathname || '/admin';
      router.push(`/account/login?callbackUrl=${encodeURIComponent(currentPath)}`);
    } else if (status === 'authenticated' && !isAllowedRole) {
      router.push('/account');
    }
  }, [status, isAllowedRole, router, pathname]);

  // Fetch real notification count from database
  useEffect(() => {
    if (status === 'authenticated' && isAllowedRole) {
      const fetchNotifications = async () => {
        try {
          setNotificationsLoading(true);
          setNotificationError(null);
          
          const res = await fetch('/api/admin/notifications');
          const data = await res.json();
          
          if (data.success) {
            setNotificationCount(data.data.total);
          } else {
            console.warn('Notification API returned error:', data.error);
            setNotificationCount(0);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setNotificationError('Failed to load notifications');
          setNotificationCount(0);
        } finally {
          setNotificationsLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [status, session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !isAllowedRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full bg-gray-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen ? (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-heading font-bold text-lg">CHOCKY&apos;S</span>
            </Link>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">C</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block text-gray-400 hover:text-white"
          >
            <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <i className={`fas ${item.icon} w-5 text-center`}></i>
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="border-t border-gray-800 my-4"></div>

          {/* View Store Link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <i className="fas fa-external-link-alt w-5 text-center"></i>
            {sidebarOpen && <span>View Store</span>}
          </Link>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <i className="fas fa-sign-out-alt w-5 text-center"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                className="relative text-gray-600 hover:text-gray-900"
              >
                <i className="fas fa-bell text-xl"></i>
                {!notificationsLoading && notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
              <NotificationPanel
                isOpen={notificationPanelOpen}
                onClose={() => setNotificationPanelOpen(false)}
              />
            </div>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {session?.user?.firstName?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{session?.user?.role?.toLowerCase()?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
