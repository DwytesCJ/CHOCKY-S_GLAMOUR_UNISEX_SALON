'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export default function AccountNotifications() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account/login');
    }
  }, [status, router]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?unread=${filter === 'unread'}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status, filter]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', notificationId: id }),
      });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_all' }),
      });
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, { icon: string; color: string }> = {
      ORDER_PLACED: { icon: 'fa-shopping-bag', color: 'text-blue-600 bg-blue-50' },
      ORDER_SHIPPED: { icon: 'fa-truck', color: 'text-indigo-600 bg-indigo-50' },
      ORDER_DELIVERED: { icon: 'fa-check-circle', color: 'text-green-600 bg-green-50' },
      APPOINTMENT_REMINDER: { icon: 'fa-bell', color: 'text-orange-600 bg-orange-50' },
      APPOINTMENT_CONFIRMED: { icon: 'fa-calendar-check', color: 'text-purple-600 bg-purple-50' },
      PROMOTION: { icon: 'fa-tag', color: 'text-pink-600 bg-pink-50' },
      REWARD_EARNED: { icon: 'fa-gift', color: 'text-yellow-600 bg-yellow-50' },
      REVIEW_APPROVED: { icon: 'fa-star', color: 'text-amber-600 bg-amber-50' },
      SYSTEM: { icon: 'fa-info-circle', color: 'text-gray-600 bg-gray-50' },
    };
    return icons[type] || icons.SYSTEM;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-UG', { month: 'short', day: 'numeric' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3 py-1.5 text-sm text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={clearAll}
            className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-bell text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500 text-sm">
              {filter === 'unread' ? 'No unread notifications' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const typeInfo = getTypeIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                  notification.isRead
                    ? 'bg-white border-gray-100'
                    : 'bg-pink-50/30 border-pink-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                  <i className={`fas ${typeInfo.icon} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm ${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {notification.link && (
                      <Link
                        href={notification.link}
                        onClick={() => !notification.isRead && markRead(notification.id)}
                        className="text-xs text-pink-600 hover:text-pink-700 font-medium"
                      >
                        View details
                      </Link>
                    )}
                    {!notification.isRead && (
                      <button
                        onClick={() => markRead(notification.id)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link href="/account" className="text-sm text-pink-600 hover:text-pink-700">
          &larr; Back to Account
        </Link>
      </div>
    </div>
  );
}
