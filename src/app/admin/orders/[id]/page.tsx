'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const STATUS_OPTIONS = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED',
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setOrder(data.data);
          setNewStatus(data.data.status);
          setTrackingNumber(data.data.trackingNumber || '');
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
      } finally {
        setFetching(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    setUpdateSuccess('');
    setError('');

    try {
      const payload: any = { status: newStatus };
      if (trackingNumber) payload.trackingNumber = trackingNumber;
      if (notes) payload.notes = notes;

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setUpdateSuccess('Order updated successfully');
        // Refresh order data
        const refreshRes = await fetch(`/api/admin/orders/${orderId}`);
        const refreshData = await refreshRes.json();
        if (refreshData.success) setOrder(refreshData.data);
        setNotes('');
      } else {
        setError(data.error || 'Failed to update order');
      }
    } catch (err) {
      setError('An error occurred while updating the order');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
        <Link href="/admin/orders" className="text-pink-500 hover:underline">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/orders" className="hover:text-pink-500">Orders</Link>
            <span>/</span>
            <span>{order.orderNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Placed {formatDate(order.createdAt)}</p>
        </div>
        <Link href="/admin/orders" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Back to Orders
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
      {updateSuccess && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{updateSuccess}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Order Items ({order.items?.length || 0})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{item.product?.name || item.productName || 'Unknown'}</p>
                        {item.selectedVariant && <p className="text-xs text-gray-500">{item.selectedVariant}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(Number(item.price) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(order.subtotalAmount || order.totalAmount)}</span></div>
              {order.shippingAmount && Number(order.shippingAmount) > 0 && (
                <div className="flex justify-between text-sm"><span className="text-gray-600">Shipping</span><span>{formatCurrency(order.shippingAmount)}</span></div>
              )}
              {order.discountAmount && Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{formatCurrency(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                <span>Total</span><span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
              <div className="space-y-4">
                {order.statusHistory.map((entry: any, i: number) => (
                  <div key={entry.id || i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                      {i < order.statusHistory.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1"></div>}
                    </div>
                    <div className="pb-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[entry.status] || 'bg-gray-100 text-gray-800'}`}>
                        {entry.status}
                      </span>
                      {entry.note && <p className="text-sm text-gray-600 mt-1">{entry.note}</p>}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(entry.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {(newStatus === 'SHIPPED' || newStatus === 'OUT_FOR_DELIVERY') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                  <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Enter tracking number" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Optional notes..." />
              </div>
              <button onClick={handleUpdateStatus} disabled={updating || newStatus === order.status}
                className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 flex items-center justify-center gap-2">
                {updating ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> Updating...</>
                ) : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            {order.user ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</p>
                <p className="text-gray-600">{order.user.email}</p>
                {order.user.phone && <p className="text-gray-600">{order.user.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Guest order</p>
            )}
          </div>

          {/* Shipping Address */}
          {order.address && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.address.firstName} {order.address.lastName}</p>
                {order.address.addressLine1 && <p>{order.address.addressLine1}</p>}
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>{[order.address.city, order.address.state, order.address.postalCode].filter(Boolean).join(', ')}</p>
                {order.address.phone && <p>{order.address.phone}</p>}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus || 'PENDING'}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking</span>
                  <span className="font-medium font-mono text-xs">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
