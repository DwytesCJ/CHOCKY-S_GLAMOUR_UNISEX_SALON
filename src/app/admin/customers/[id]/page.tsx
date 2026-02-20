'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  addresses: Address[];
  orders: Order[];
  appointments: Appointment[];
  rewardPoints: RewardPoint[];
  _count: {
    orders: number;
    appointments: number;
    reviews: number;
  };
}

interface Address {
  id: string;
  type: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  country: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
}

interface Appointment {
  id: string;
  appointmentNumber: string;
  status: string;
  date: string;
  startTime: string;
  service?: { name: string };
  stylist?: { name: string };
}

interface RewardPoint {
  id: string;
  points: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`);
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data);
        // Calculate totals
        const spent = data.data.orders?.reduce((sum: number, o: Order) => sum + Number(o.totalAmount), 0) || 0;
        setTotalSpent(spent);
        const pts = data.data.rewardPoints?.reduce((sum: number, p: RewardPoint) => sum + p.points, 0) || 0;
        setTotalPoints(pts);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `UGX ${Number(amount).toLocaleString()}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-UG');
  const formatDateTime = (date: string) => new Date(date).toLocaleString('en-UG');

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-indigo-100 text-indigo-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Customer not found</h2>
        <Link href="/admin/customers" className="text-pink-600 hover:underline mt-4 inline-block">
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/customers" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Customers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer.firstName || customer.lastName ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 'Customer'}
          </h1>
          <p className="text-gray-500">{customer.email}</p>
        </div>
        <div className="flex gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {customer.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {customer.role}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{customer._count?.orders || customer.orders?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-pink-600">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Appointments</p>
          <p className="text-2xl font-bold text-gray-900">{customer._count?.appointments || customer.appointments?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Reward Points</p>
          <p className="text-2xl font-bold text-purple-600">{totalPoints}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{customer._count?.reviews || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="border-b">
          <nav className="flex -mb-px">
            {['overview', 'orders', 'appointments', 'addresses', 'points'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{customer.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{formatDate(customer.createdAt)}</p>
                  </div>
                  {customer.lastLoginAt && (
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-medium">{formatDateTime(customer.lastLoginAt)}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Default Address</h3>
                {customer.addresses?.find(a => a.isDefault) ? (
                  <div className="text-sm">
                    {(() => {
                      const addr = customer.addresses.find(a => a.isDefault)!;
                      return (
                        <>
                          <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                          <p>{addr.addressLine1}</p>
                          {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                          <p>{addr.city}, {addr.district}</p>
                          <p>{addr.country}</p>
                          <p className="mt-2">{addr.phone}</p>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-gray-500">No default address set</p>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              {customer.orders?.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customer.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${order.id}`} className="text-pink-600 hover:underline font-medium">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/admin/orders/${order.id}`} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              {customer.appointments?.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stylist</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customer.appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{apt.appointmentNumber}</td>
                        <td className="px-4 py-3">{apt.service?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{apt.stylist?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          {formatDate(apt.date)} at {apt.startTime}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-8">No appointments yet</p>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.addresses?.length > 0 ? (
                customer.addresses.map((addr) => (
                  <div key={addr.id} className={`p-4 border rounded-lg ${addr.isDefault ? 'border-pink-300 bg-pink-50' : ''}`}>
                    {addr.isDefault && (
                      <span className="text-xs font-medium text-pink-600 mb-2 inline-block">Default</span>
                    )}
                    <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                    <p className="text-sm text-gray-600">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-sm text-gray-600">{addr.addressLine2}</p>}
                    <p className="text-sm text-gray-600">{addr.city}, {addr.district}</p>
                    <p className="text-sm text-gray-600">{addr.country}</p>
                    <p className="text-sm text-gray-600 mt-2">{addr.phone}</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">{addr.type}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8 col-span-2">No addresses saved</p>
              )}
            </div>
          )}

          {/* Points Tab */}
          {activeTab === 'points' && (
            <div>
              <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Total Points Balance</p>
                <p className="text-3xl font-bold text-purple-700">{totalPoints}</p>
              </div>
              {customer.rewardPoints?.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customer.rewardPoints.map((point) => (
                      <tr key={point.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(point.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            point.type === 'EARNED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {point.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{point.description}</td>
                        <td className={`px-4 py-3 text-right font-medium ${point.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {point.points > 0 ? '+' : ''}{point.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-8">No points history</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
