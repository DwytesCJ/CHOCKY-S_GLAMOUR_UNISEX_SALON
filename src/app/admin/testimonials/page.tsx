'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface Testimonial {
  id: string;
  name: string;
  title: string | null;
  image: string | null;
  content: string;
  rating: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const defaultForm = {
  name: '',
  title: '',
  image: '',
  content: '',
  rating: 5,
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      if (data.success) setTestimonials(data.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setForm({
      name: testimonial.name,
      title: testimonial.title || '',
      image: testimonial.image || '',
      content: testimonial.content,
      rating: testimonial.rating,
      isActive: testimonial.isActive,
      isFeatured: testimonial.isFeatured,
      sortOrder: testimonial.sortOrder,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.content) {
      alert('Name and content are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        title: form.title || null,
        image: form.image || null,
        content: form.content,
        rating: form.rating,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        sortOrder: form.sortOrder,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/admin/testimonials/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setTestimonials(prev => prev.map(t => t.id === editingId ? data.data : t));
        } else {
          setTestimonials(prev => [...prev, data.data]);
        }
        setShowModal(false);
        setForm(defaultForm);
        setEditingId(null);
      } else {
        alert(data.error || 'Failed to save testimonial');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the testimonial from "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
      } else {
        alert(data.error || 'Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('An error occurred while deleting');
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !testimonial.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials(prev => prev.map(t => t.id === testimonial.id ? data.data : t));
      }
    } catch (error) {
      console.error('Error toggling testimonial:', error);
    }
  };

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !testimonial.isFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials(prev => prev.map(t => t.id === testimonial.id ? data.data : t));
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && t.isActive) ||
      (statusFilter === 'inactive' && !t.isActive) ||
      (statusFilter === 'featured' && t.isFeatured);
    return matchesSearch && matchesStatus;
  });

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0';

  const stats = {
    total: testimonials.length,
    active: testimonials.filter(t => t.isActive).length,
    featured: testimonials.filter(t => t.isFeatured).length,
    avgRating,
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      ></i>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600">Manage customer reviews and testimonials</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Add Testimonial
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-100 p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-100 p-4">
          <p className="text-sm text-yellow-600">Featured</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.featured}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-4">
          <p className="text-sm text-blue-600">Avg Rating</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-blue-700">{stats.avgRating}</p>
            <i className="fas fa-star text-yellow-400"></i>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search testimonials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {testimonial.image ? (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pink-100 text-pink-600 font-bold text-lg">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{testimonial.name}</h3>
                    {testimonial.title && (
                      <p className="text-xs text-gray-500">{testimonial.title}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {renderStars(testimonial.rating)}
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">{testimonial.content}</p>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                  testimonial.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {testimonial.isActive ? 'Active' : 'Inactive'}
                </span>
                {testimonial.isFeatured && (
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    <i className="fas fa-star mr-1"></i> Featured
                  </span>
                )}
                <span className="text-xs text-gray-400">Order: {testimonial.sortOrder}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(testimonial)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      testimonial.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={testimonial.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <i className={`fas fa-${testimonial.isActive ? 'eye' : 'eye-slash'}`}></i>
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(testimonial)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      testimonial.isFeatured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                  >
                    <i className={`fas fa-star`}></i>
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id, testimonial.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <i className="fas fa-quote-right text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first customer testimonial'}
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Your First Testimonial
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Testimonial' : 'Create New Testimonial'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); setForm(defaultForm); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Upload */}
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm(prev => ({ ...prev, image: url }))}
                folder="testimonials"
                label="Customer Photo"
                aspectRatio="square"
              />

              {/* Name & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="e.g., Sarah Nakamya"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title / Role</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="e.g., Loyal Customer"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial Content *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="What did the customer say?"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                      className="text-2xl transition-colors"
                    >
                      <i className={`fas fa-star ${star <= form.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">{form.rating}/5</span>
                </div>
              </div>

              {/* Sort Order, Active, Featured */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    min="0"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => { setShowModal(false); setEditingId(null); setForm(defaultForm); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </span>
                ) : editingId ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
