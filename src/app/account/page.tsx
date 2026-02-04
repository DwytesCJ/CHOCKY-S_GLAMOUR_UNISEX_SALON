"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AccountDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    appointments: 0,
    reviews: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchUserData() {
      if (status !== 'authenticated') return;
      
      try {
        const [ordersRes, appointmentsRes, wishlistRes] = await Promise.all([
          fetch('/api/orders?limit=3'),
          fetch('/api/appointments'),
          fetch('/api/wishlist')
        ]);

        const ordersData = await ordersRes.json();
        const appointmentsData = await appointmentsRes.json();
        const wishlistData = await wishlistRes.json();

        if (ordersData.success) {
          setOrders(ordersData.data);
          setStats(prev => ({ ...prev, orders: ordersData.pagination?.total || ordersData.data.length }));
        }
        if (appointmentsData.success) {
          setAppointments(appointmentsData.data);
          setStats(prev => ({ ...prev, appointments: appointmentsData.data.length }));
        }
        if (wishlistData.success) {
          setWishlistItems(wishlistData.data.slice(0, 3));
          setStats(prev => ({ ...prev, wishlist: wishlistData.data.length }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [status]);

  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;

  const userData = {
    name: `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || session.user.name || 'User',
    email: session.user.email,
    phone: (session.user as any).phone || 'No phone added',
    avatar: session.user.image || '/images/placeholders/avatar.jpg',
    tier: (session.user as any).tier || 'Bronze',
    points: (session.user as any).points || 0,
    memberSince: new Date((session.user as any).createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };

  const menuItems = [
    { icon: 'fa-home', label: 'Dashboard', href: '/account', active: true },
    { icon: 'fa-shopping-bag', label: 'Orders', href: '/account/orders', active: false },
    { icon: 'fa-heart', label: 'Wishlist', href: '/account/wishlist', active: false },
    { icon: 'fa-calendar-alt', label: 'Appointments', href: '/account/appointments', active: false },
    { icon: 'fa-crown', label: 'Rewards', href: '/account/rewards', active: false },
    { icon: 'fa-map-marker-alt', label: 'Addresses', href: '/account/addresses', active: false },
    { icon: 'fa-credit-card', label: 'Payment Methods', href: '/account/payments', active: false },
    { icon: 'fa-cog', label: 'Settings', href: '/account/settings', active: false },
  ];

  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-2xl md:text-3xl font-bold">My Account</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* User Card */}
            <div className="bg-white rounded-xl p-6 shadow-soft mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={userData.avatar}
                    alt={userData.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{userData.name}</h3>
                  <p className="text-sm text-gray-500">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg text-white">
                <div>
                  <p className="text-xs opacity-80">Rewards Tier</p>
                  <p className="font-semibold">{userData.tier} Member</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">Points</p>
                  <p className="font-semibold">{userData.points.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-xl shadow-soft overflow-hidden">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 transition-colors ${
                    item.active ? 'bg-primary/5 text-primary' : 'hover:bg-gray-50'
                  }`}
                >
                  <i className={`fas ${item.icon} w-5`}></i>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
              >
                <i className="fas fa-sign-out-alt w-5"></i>
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary via-rose-gold to-burgundy rounded-xl p-6 text-white">
              <h2 className="font-heading text-xl font-bold mb-2">Welcome back, {userData.name.split(' ')[0]}!</h2>
              <p className="text-white/80 mb-4">
                You have {userData.points.toLocaleString()} points. Earn {500 - (userData.points % 500)} more to unlock your next reward!
              </p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div 
                  className="bg-white rounded-full h-2" 
                  style={{ width: `${(userData.points % 500) / 5}%` }}
                ></div>
              </div>
              <Link href="/account/rewards" className="text-sm underline">View Rewards</Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'fa-shopping-bag', label: 'Total Orders', value: stats.orders },
                { icon: 'fa-heart', label: 'Wishlist Items', value: stats.wishlist },
                { icon: 'fa-calendar-check', label: 'Appointments', value: stats.appointments },
                { icon: 'fa-star', label: 'Reviews', value: stats.reviews },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-soft text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                    <i className={`fas ${stat.icon} text-primary`}></i>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-semibold">Recent Orders</h3>
                <Link href="/account/orders" className="text-primary text-sm hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-gray-100">
                {orders.length > 0 ? orders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(Number(order.totalAmount))}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-500">
                    No orders found.
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-semibold">Upcoming Appointments</h3>
                <Link href="/salon/booking" className="text-primary text-sm hover:underline">Book New</Link>
              </div>
              {appointments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <i className="fas fa-calendar-alt text-primary"></i>
                        </div>
                        <div>
                          <p className="font-medium">{apt.service?.name}</p>
                          <p className="text-sm text-gray-500">with {apt.stylist?.name || 'Any Stylist'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{new Date(apt.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{apt.startTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <i className="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No upcoming appointments</p>
                  <Link href="/salon/booking" className="btn btn-primary mt-4">Book Now</Link>
                </div>
              )}
            </div>

            {/* Wishlist Preview */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-semibold">My Wishlist</h3>
                <Link href="/account/wishlist" className="text-primary text-sm hover:underline">View All</Link>
              </div>
              <div className="p-4">
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {wishlistItems.map((item) => (
                      <Link key={item.id} href={`/shop/${item.productId}`} className="group">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                          <Image
                            src={item.productImage || '/images/placeholders/product.jpg'}
                            alt={item.productName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-sm text-primary">{formatPrice(Number(item.price))}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Your wishlist is empty.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
