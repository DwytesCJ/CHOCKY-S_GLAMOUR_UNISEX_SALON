'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: number;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    // Simulated data - replace with actual API calls
    const fetchOrders = async () => {
      try {
        const mockOrders: Order[] = [
          {
            id: '1',
            orderNumber: 'CHK-2024-001',
            customer: {
              name: 'Sarah Nakamya',
              email: 'sarah@example.com',
              phone: '+256701234567',
            },
            items: 3,
            subtotal: 175000,
            shippingCost: 10000,
            totalAmount: 185000,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod: 'MTN_MOBILE_MONEY',
            shippingMethod: 'STANDARD',
            createdAt: '2024-01-15T10:30:00Z',
          },
          {
            id: '2',
            orderNumber: 'CHK-2024-002',
            customer: {
              name: 'Grace Auma',
              email: 'grace@example.com',
              phone: '+256702345678',
            },
            items: 5,
            subtotal: 310000,
            shippingCost: 10000,
            totalAmount: 320000,
            status: 'PROCESSING',
            paymentStatus: 'COMPLETED',
            paymentMethod: 'PAYPAL',
            shippingMethod: 'EXPRESS',
            createdAt: '2024-01-15T09:15:00Z',
          },
          {
            id: '3',
            orderNumber: 'CHK-2024-003',
            customer: {
              name: 'Faith Nambi',
              email: 'faith@example.com',
              phone: '+256703456789',
            },
            items: 2,
            subtotal: 85000,
            shippingCost: 10000,
            totalAmount: 95000,
            status: 'SHIPPED',
            paymentStatus: 'COMPLETED',
            paymentMethod: 'MTN_MOBILE_MONEY',
            shippingMethod: 'STANDARD',
            createdAt: '2024-01-14T16:45:00Z',
          },
          {
            id: '4',
            orderNumber: 'CHK-2024-004',
            customer: {
              name: 'Joy Atim',
              email: 'joy@example.com',
              phone: '+256704567890',
            },
            items: 8,
            subtotal: 440000,
            shippingCost: 10000,
            totalAmount: 450000,
            status: 'DELIVERED',
            paymentStatus: 'COMPLETED',
            paymentMethod: 'CREDIT_CARD',
            shippingMethod: 'EXPRESS',
            createdAt: '2024-01-14T14:20:00Z',
          },
          {
            id: '5',
            orderNumber: 'CHK-2024-005',
            customer: {
              name: 'Peace Nakato',
              email: 'peace@example.com',
              phone: '+256705678901',
            },
            items: 4,
            subtotal: 265000,
            shippingCost: 10000,
            totalAmount: 275000,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod: 'AIRTEL_MONEY',
            shippingMethod: 'STANDARD',
            createdAt: '2024-01-14T11:00:00Z',
          },
          {
            id: '6',
            orderNumber: 'CHK-2024-006',
            customer: {
              name: 'Hope Achieng',
              email: 'hope@example.com',
              phone: '+256706789012',
            },
            items: 1,
            subtotal: 850000,
            shippingCost: 0,
            totalAmount: 850000,
            status: 'CONFIRMED',
            paymentStatus: 'COMPLETED',
            paymentMethod: 'PAYPAL',
            shippingMethod: 'PICKUP',
            createdAt: '2024-01-13T15:30:00Z',
          },
          {
            id: '7',
            orderNumber: 'CHK-2024-007',
            customer: {
              name: 'Mercy Nalubega',
              email: 'mercy@example.com',
              phone: '+256707890123',
            },
            items: 6,
            subtotal: 520000,
            shippingCost: 15000,
            totalAmount: 535000,
            status: 'CANCELLED',
            paymentStatus: 'REFUNDED',
            paymentMethod: 'MTN_MOBILE_MONEY',
            shippingMethod: 'EXPRESS',
            createdAt: '2024-01-12T09:45:00Z',
          },
        ];
        setOrders(mockOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      MTN_MOBILE_MONEY: 'MTN MoMo',
      AIRTEL_MONEY: 'Airtel Money',
      PAYPAL: 'PayPal',
      CREDIT_CARD: 'Credit Card',
      CASH_ON_DELIVERY: 'COD',
      BANK_TRANSFER: 'Bank Transfer',
    };
    return labels[method] || method;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'today') {
        matchesDate = orderDate >= today;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = orderDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    processing: orders.filter((o) => o.status === 'PROCESSING').length,
    shipped: orders.filter((o) => o.status === 'SHIPPED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-100 p-4">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-100 p-4">
          <p className="text-sm text-purple-600">Processing</p>
          <p className="text-2xl font-bold text-purple-700">{stats.processing}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 p-4">
          <p className="text-sm text-indigo-600">Shipped</p>
          <p className="text-2xl font-bold text-indigo-700">{stats.shipped}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-100 p-4">
          <p className="text-sm text-green-600">Delivered</p>
          <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by order number, customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="w-full md:w-40">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Payments</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="w-full md:w-40">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-pink-800 font-medium">
            {selectedOrders.length} order(s) selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-pink-300 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors text-sm">
              Mark as Processing
            </button>
            <button className="px-3 py-1.5 bg-white border border-pink-300 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors text-sm">
              Mark as Shipped
            </button>
            <button className="px-3 py-1.5 bg-white border border-pink-300 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors text-sm">
              Print Invoices
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-pink-600 hover:text-pink-700"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer.name}</p>
                      <p className="text-sm text-gray-500">{order.customer.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {order.items} item{order.items > 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-xs text-gray-500">{getPaymentMethodLabel(order.paymentMethod)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Print Invoice"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ordersPerPage + 1} to{' '}
              {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of{' '}
              {filteredOrders.length} orders
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    currentPage === page
                      ? 'bg-pink-500 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Orders will appear here when customers make purchases'}
          </p>
        </div>
      )}
    </div>
  );
}
