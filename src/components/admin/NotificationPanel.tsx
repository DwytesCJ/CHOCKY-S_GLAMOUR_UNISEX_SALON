'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface NotificationBreakdown {
  pendingOrders: number;
  pendingAppointments: number;
  lowStockProducts: number;
  pendingReviews: number;
  outOfStockProducts: number;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [breakdown, setBreakdown] = useState<NotificationBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/notifications');
        const data = await res.json();
        if (data.success) {
          setBreakdown(data.data.breakdown);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Auto-refresh every 60 seconds while open
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const notifications = breakdown ? [
    {
      category: 'New Orders',
      count: breakdown.pendingOrders,
      icon: 'fa-shopping-bag',
      color: 'text-blue-600 bg-blue-50',
      href: '/admin/orders',
      description: 'Pending orders awaiting processing',
    },
    {
      category: 'Pending Appointments',
      count: breakdown.pendingAppointments,
      icon: 'fa-calendar-check',
      color: 'text-purple-600 bg-purple-50',
      href: '/admin/appointments',
      description: 'Appointments needing confirmation',
    },
    {
      category: 'Low Stock Alerts',
      count: breakdown.lowStockProducts,
      icon: 'fa-exclamation-triangle',
      color: 'text-orange-600 bg-orange-50',
      href: '/admin/products',
      description: 'Products with stock ≤ 5 units',
    },
    {
      category: 'Out of Stock',
      count: breakdown.outOfStockProducts,
      icon: 'fa-times-circle',
      color: 'text-red-600 bg-red-50',
      href: '/admin/products',
      description: 'Products with zero stock',
    },
    {
      category: 'Pending Reviews',
      count: breakdown.pendingReviews,
      icon: 'fa-star',
      color: 'text-yellow-600 bg-yellow-50',
      href: '/admin/reviews',
      description: 'Reviews awaiting approval',
    },
  ] : [];

  const totalCount = notifications.reduce((sum, n) => sum + n.count, 0);
  const activeNotifications = notifications.filter(n => n.count > 0);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Notifications</h3>
            <p className="text-pink-100 text-xs mt-0.5">
              {totalCount} item{totalCount !== 1 ? 's' : ''} requiring attention
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : activeNotifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-green-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">All caught up!</p>
            <p className="text-gray-400 text-xs mt-1">No pending items to review</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeNotifications.map((notification) => (
              <Link
                key={notification.category}
                href={notification.href}
                onClick={onClose}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.color}`}>
                  <i className={`fas ${notification.icon} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{notification.category}</p>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                      {notification.count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{notification.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <Link
          href="/admin/orders"
          onClick={onClose}
          className="block w-full text-center text-sm text-pink-600 hover:text-pink-700 font-medium"
        >
          View All Activity
        </Link>
      </div>
    </div>
  );
}
