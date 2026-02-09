"use client";

import React, { useState } from 'react';
import Link from 'next/link';

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

interface TrackingData {
  orderNumber: string;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  statusHistory: { status: string; note?: string; createdAt: string }[];
}

export default function PublicTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    
    setLoading(true);
    setError('');
    setTracking(null);

    try {
      const res = await fetch(`/api/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();
      if (data.success) {
        setTracking(data.data);
      } else {
        setError(data.error || 'Order not found. Please check the order number and try again.');
      }
    } catch {
      setError('Unable to track order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-UG', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const currentStepIndex = tracking ? (STATUS_INDEX[tracking.status] ?? -1) : -1;
  const isCancelled = tracking?.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-rose-gold py-12">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xl">C</span>
            </div>
            <span className="font-heading font-bold text-white text-xl">CHOCKY&apos;S</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading mb-2">Track Your Order</h1>
          <p className="text-white/80">Enter your order number to see the current status</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Search Form */}
        <form onSubmit={handleTrack} className="bg-white rounded-xl shadow-soft p-6 -mt-8 relative z-10 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="Enter order number (e.g., CHK-XXXXX-XXXX)"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-6 whitespace-nowrap"
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i>Tracking...</>
              ) : (
                <><i className="fas fa-search mr-2"></i>Track</>
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-center">
            <i className="fas fa-exclamation-circle text-red-400 mr-2"></i>
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        {/* Results */}
        {tracking && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="text-lg font-bold font-mono">{tracking.orderNumber}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tracking.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                  isCancelled ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {tracking.status.replace(/_/g, ' ')}
                </div>
              </div>
              <p className="text-sm text-gray-500">Ordered on {formatDate(tracking.createdAt)}</p>
              {tracking.estimatedDelivery && (
                <p className="text-sm text-gray-500 mt-1">
                  <i className="fas fa-calendar-alt mr-1"></i>
                  Estimated delivery: {formatDate(tracking.estimatedDelivery)}
                </p>
              )}
              {tracking.trackingNumber && (
                <p className="text-sm text-gray-500 mt-1">
                  <i className="fas fa-barcode mr-1"></i>
                  Tracking: <span className="font-mono font-medium">{tracking.trackingNumber}</span>
                </p>
              )}
            </div>

            {/* Status Steps */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="font-heading text-lg font-semibold mb-6">Delivery Progress</h2>
              
              {isCancelled ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-times text-xl text-red-500"></i>
                  </div>
                  <p className="font-semibold text-red-600">Order Cancelled</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                            <i className={`fas ${step.icon} text-sm`}></i>
                          </div>
                          {index < STATUS_STEPS.length - 1 && (
                            <div className={`w-0.5 h-10 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                          )}
                        </div>
                        <div className="pb-6 pt-2">
                          <p className={`font-medium text-sm ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</p>
                          {isCurrent && <p className="text-xs text-green-500">Current status</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Timeline */}
            {tracking.statusHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="font-heading text-lg font-semibold mb-4">Activity Log</h2>
                <div className="space-y-3">
                  {[...tracking.statusHistory].reverse().map((entry, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="text-sm font-medium">{entry.status.replace(/_/g, ' ')}</p>
                        {entry.note && <p className="text-xs text-gray-500">{entry.note}</p>}
                        <p className="text-xs text-gray-400">{formatDate(entry.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help */}
        {!tracking && !error && (
          <div className="text-center text-gray-400 py-8">
            <i className="fas fa-box-open text-5xl mb-4 block"></i>
            <p>Enter your order number above to get started</p>
            <p className="text-sm mt-2">Your order number was sent to your email after checkout</p>
          </div>
        )}
      </div>
    </div>
  );
}
