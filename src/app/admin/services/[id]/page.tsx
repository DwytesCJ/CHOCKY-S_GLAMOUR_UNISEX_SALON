'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ServiceCategory {
  id: string;
  name: string;
}

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    duration: '',
    image: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, catsRes] = await Promise.all([
          fetch(`/api/admin/services/${serviceId}`),
          fetch('/api/admin/services'),
        ]);

        const serviceData = await serviceRes.json();
        const catsData = await catsRes.json();

        if (catsData.categories) setCategories(catsData.categories);

        if (serviceData && !serviceData.error) {
          setFormData({
            name: serviceData.name || '',
            description: serviceData.description || '',
            categoryId: serviceData.categoryId || '',
            price: serviceData.price?.toString() || '',
            duration: serviceData.duration?.toString() || '',
            image: serviceData.image || '',
            isActive: serviceData.isActive ?? true,
          });
        } else {
          setError('Service not found');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Failed to load service');
      } finally {
        setFetching(false);
      }
    };
    if (serviceId) fetchData();
  }, [serviceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        image: formData.image || null,
        isActive: formData.isActive,
      };

      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/services');
      } else {
        setError(data.error || 'Failed to update service');
      }
    } catch (err) {
      setError('An error occurred while updating the service');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const durationPresets = [15, 30, 45, 60, 90, 120, 180];

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/admin/services" className="hover:text-pink-500">Services</Link>
          <span>/</span>
          <span>Edit Service</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Category *</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Duration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (UGX) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} required min="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
              <div className="flex flex-wrap gap-2 mt-2">
                {durationPresets.map(d => (
                  <button key={d} type="button" onClick={() => setFormData(prev => ({ ...prev, duration: d.toString() }))}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${formData.duration === d.toString() ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-300 text-gray-600 hover:border-pink-300'}`}>
                    {d < 60 ? `${d}m` : `${d / 60}h`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Media & Status</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="url" name="image" value={formData.image} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="https://..." />
            </div>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 w-fit">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange}
                className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/admin/services" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</Link>
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
