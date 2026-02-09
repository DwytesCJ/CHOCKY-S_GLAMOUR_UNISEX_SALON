"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string;
  sku: string;
  quantity: number;
  price: number;
  totalPrice: number;
  product?: { slug?: string; images?: { url: string }[] };
}

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location?: string;
  createdAt: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingMethod: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  statusHistory: { status: string; note?: string; createdAt: string }[];
  trackingEvents: TrackingEvent[];
  address?: { street?: string; city?: string; state?: string };
}

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Placed', icon: 'fa-receipt' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: 'fa-check-circle' },
  { key: 'PROCESSING', label: 'Processing', icon: 'fa-cog' },
  { key: 'SHIPPED', label: 'Shipped', icon: 'fa-truck' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: 'fa-motorcycle' },
  { key: 'DELIVERED', label: 'Delivered', icon: 'fa-box-open' },
];

const STATUS_INDEX: Record<string, number> = {};
STATUS_STEPS.forEach((s, i) => { STATUS_INDEX[s.key] = i; });

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrder(data.data);
        else setError(data.error || 'Order not found');
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const formatPrice = (price: number) => `UGX ${Number(price).toLocaleString()}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-UG', { 
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-3xl text-red-400"></i>
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/account/orders" className="btn btn-primary">View All Orders</Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_INDEX[order.status] ?? -1;
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/account" className="hover:text-primary">Account</Link>
          <i className="fas fa-chevron-right text-xs"></i>
          <Link href="/account/orders" className="hover:text-primary">Orders</Link>
          <i className="fas fa-chevron-right text-xs"></i>
          <span className="text-gray-900 font-medium">{order.orderNumber}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading">Order {order.orderNumber}</h1>
            <p className="text-gray-500 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex gap-3">
            <a
              href={`/api/orders/${order.orderNumber}/receipt`}
              className="btn btn-outline text-sm"
            >
              <i className="fas fa-download mr-2"></i>
              Download Receipt
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Tracker */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="font-heading text-lg font-semibold mb-6">Order Status</h2>
              
              {isCancelled ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-times text-2xl text-red-500"></i>
                  </div>
                  <p className="text-lg font-semibold text-red-600">Order Cancelled</p>
                  <p className="text-sm text-gray-500 mt-1">{order.notes || 'This order has been cancelled.'}</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden md:block absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(100, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100))}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:justify-between relative z-10">
                    {STATUS_STEPS.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      return (
                        <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 mb-4 md:mb-0 md:flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-green-100 scale-110' : ''}`}>
                            <i className={`fas ${step.icon}`}></i>
                          </div>
                          <div className="md:text-center">
                            <p className={`text-sm font-medium ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</p>
                            {isCurrent && (
                              <p className="text-xs text-green-500 mt-0.5">Current</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {order.trackingNumber && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
                  <i className="fas fa-shipping-fast text-blue-500"></i>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Tracking Number</p>
                    <p className="text-lg font-mono font-bold text-blue-600">{order.trackingNumber}</p>
                  </div>
                </div>
              )}

              {order.estimatedDelivery && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl flex items-center gap-3">
                  <i className="fas fa-calendar-alt text-amber-500"></i>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Estimated Delivery</p>
                    <p className="text-sm text-amber-600">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status History / Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="font-heading text-lg font-semibold mb-4">Order Timeline</h2>
                <div className="space-y-0">
                  {[...order.statusHistory].reverse().map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                        {index < order.statusHistory.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-medium text-sm">{entry.status.replace(/_/g, ' ')}</p>
                        {entry.note && <p className="text-sm text-gray-500">{entry.note}</p>}
                        <p className="text-xs text-gray-400 mt-1">{formatDate(entry.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="font-heading text-lg font-semibold mb-4">Items ({order.items.length})</h2>
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0]?.url ? (
                        <Image src={item.product.images[0].url} alt={item.productName} width={64} height={64} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-image text-gray-300"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.productName}</p>
                      {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                      <p className="text-xs text-gray-400">SKU: {item.sku} &middot; Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm">{formatPrice(item.totalPrice)}</p>
                      <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="font-heading text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>{Number(order.shippingCost) === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="font-heading text-lg font-semibold mb-4">Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span>{order.paymentMethod?.replace(/_/g, ' ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                    order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="font-heading text-lg font-semibold mb-4">Delivery</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span>{order.shippingMethod?.replace(/_/g, ' ') || 'Standard'}</span>
                </div>
                {order.address && (
                  <div>
                    <span className="text-gray-500 block mb-1">Address</span>
                    <p className="text-gray-700">
                      {order.address.street}<br />
                      {order.address.city}, {order.address.state}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-primary/5 rounded-xl p-6 text-center">
              <i className="fas fa-headset text-2xl text-primary mb-2"></i>
              <h3 className="font-semibold mb-1">Need Help?</h3>
              <p className="text-sm text-gray-500 mb-3">Contact our support team</p>
              <Link href="/contact" className="text-primary text-sm font-medium hover:underline">
                Get in Touch <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
