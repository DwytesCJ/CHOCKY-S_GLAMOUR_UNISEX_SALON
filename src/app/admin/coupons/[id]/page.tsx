'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: '1',
    startDate: '',
    endDate: '',
    isActive: true,
    applicableCategories: '',
    applicableProducts: '',
  });

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await fetch(`/api/admin/coupons/${couponId}`);
        const data = await res.json();

        if (data && !data.error) {
          const formatDate = (d: string | null) => {
            if (!d) return '';
            return new Date(d).toISOString().slice(0, 16);
          };
          setFormData({
            code: data.code || '',
            description: data.description || '',
            discountType: data.discountType || 'PERCENTAGE',
            discountValue: data.discountValue?.toString() || '',
            minOrderAmount: data.minOrderAmount?.toString() || '',
            maxDiscountAmount: data.maxDiscountAmount?.toString() || '',
            usageLimit: data.usageLimit?.toString() || '',
            perUserLimit: data.perUserLimit?.toString() || '1',
            startDate: formatDate(data.startDate),
            endDate: formatDate(data.endDate),
            isActive: data.isActive ?? true,
            applicableCategories: data.applicableCategories || '',
            applicableProducts: data.applicableProducts || '',
          });
        } else {
          setError('Coupon not found');
        }
      } catch (err) {
        console.error('Error fetching coupon:', err);
        setError('Failed to load coupon');
      } finally {
        setFetching(false);
      }
    };
    if (couponId) fetchCoupon();
  }, [couponId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : 1,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        isActive: formData.isActive,
        applicableCategories: formData.applicableCategories || null,
        applicableProducts: formData.applicableProducts || null,
      };

      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/coupons');
      } else {
        setError(data.error || 'Failed to update coupon');
      }
    } catch (err) {
      setError('An error occurred while updating the coupon');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/admin/coupons" className="hover:text-pink-500">Coupons</Link>
          <span>/</span>
          <span>Edit Coupon</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Coupon</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Code & Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Coupon Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 uppercase" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                <select name="discountType" value={formData.discountType} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (UGX)</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : formData.discountType === 'FIXED_AMOUNT' ? '(UGX)' : ''}
                </label>
                <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required
                  min="0" step={formData.discountType === 'PERCENTAGE' ? '1' : '500'}
                  max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  disabled={formData.discountType === 'FREE_SHIPPING'} />
              </div>
            </div>
          </div>
        </div>

        {/* Limits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Restrictions & Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (UGX)</label>
              <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} min="0" step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="No minimum" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Amount (UGX)</label>
              <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} min="0" step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="No cap" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
              <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Unlimited" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
              <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleChange} min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Validity Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 w-fit">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange}
                className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {formData.code && formData.discountValue && (
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Coupon Preview</p>
                <p className="text-2xl font-bold mt-1">{formData.code.toUpperCase()}</p>
                <p className="text-pink-100 mt-1">
                  {formData.discountType === 'PERCENTAGE' ? `${formData.discountValue}% OFF` :
                   formData.discountType === 'FREE_SHIPPING' ? 'Free Shipping' :
                   `${formatCurrency(parseInt(formData.discountValue))} OFF`}
                  {formData.minOrderAmount ? ` on orders above ${formatCurrency(parseInt(formData.minOrderAmount))}` : ''}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href="/admin/coupons" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 flex items-center gap-2">
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> Saving...</>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
