'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  address?: {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
  };
  items: {
    id: string;
    productName: string;
    variantName?: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }[];
  statusHistory?: { status: string; note?: string; createdAt: string }[];
}

export default function AccountOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status: authStatus } = useSession();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/account/login');
    } else if (authStatus === 'authenticated') {
      fetchOrder();
    }
  }, [authStatus, orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/account/orders/${orderId}`);
      const data = await res.json();
      if (data.success) setOrder(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `UGX ${Number(amount).toLocaleString()}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-UG', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800', CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-indigo-100 text-indigo-800', SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = order ? statusSteps.indexOf(order.status) : 0;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div></div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Order not found</h2>
          <Link href="/account/orders" className="text-pink-600 hover:underline">Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/account" className="text-gray-500 hover:text-gray-700">Account</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/account/orders" className="text-gray-500 hover:text-gray-700">Orders</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{order.orderNumber}</li>
          </ol>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        {/* Progress Tracker */}
        {order.status !== 'CANCELLED' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStepIndex ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index <= currentStepIndex ? '✓' : index + 1}
                    </div>
                    <span className="text-xs mt-1 text-gray-500">{step}</span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${index < currentStepIndex ? 'bg-pink-500' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b"><h2 className="font-semibold">Items ({order.items.length})</h2></div>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.productName}</h3>
                      {item.variantName && <p className="text-sm text-gray-500">{item.variantName}</p>}
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b"><h2 className="font-semibold">Order Timeline</h2></div>
                <div className="p-4 space-y-4">
                  {order.statusHistory.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${i === 0 ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="font-medium text-sm">{h.status}</p>
                        {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                        <p className="text-xs text-gray-400">{formatDate(h.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b"><h2 className="font-semibold">Order Summary</h2></div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span>{formatCurrency(order.shippingCost)}</span></div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600"><span>Discount{order.couponCode && ` (${order.couponCode})`}</span><span>-{formatCurrency(order.discountAmount)}</span></div>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t"><span>Total</span><span className="text-pink-600">{formatCurrency(order.totalAmount)}</span></div>
              </div>
            </div>

            {/* Shipping */}
            {order.address && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b"><h2 className="font-semibold">Shipping Address</h2></div>
                <div className="p-4 text-sm">
                  <p className="font-medium">{order.address.firstName} {order.address.lastName}</p>
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                  <p>{order.address.city}, {order.address.district}</p>
                  <p className="mt-2">{order.address.phone}</p>
                </div>
              </div>
            )}

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b"><h2 className="font-semibold">Tracking</h2></div>
                <div className="p-4">
                  <p className="font-mono text-sm">{order.trackingNumber}</p>
                  {order.estimatedDelivery && (
                    <p className="text-sm text-gray-500 mt-2">Est. Delivery: {formatDate(order.estimatedDelivery)}</p>
                  )}
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b"><h2 className="font-semibold">Payment</h2></div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Method</span><span>{order.paymentMethod.replace(/_/g, ' ')}</span></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
