'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  mobileImage: string | null;
  link: string | null;
  buttonText: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const defaultForm = {
  title: '',
  subtitle: '',
  image: '',
  mobileImage: '',
  link: '',
  buttonText: '',
  position: 'hero',
  sortOrder: 0,
  isActive: true,
  startDate: '',
  endDate: '',
};

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (data.success) setBanners(data.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      mobileImage: banner.mobileImage || '',
      link: banner.link || '',
      buttonText: banner.buttonText || '',
      position: banner.position,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.image) {
      alert('Title and image are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        image: form.image,
        mobileImage: form.mobileImage || null,
        link: form.link || null,
        buttonText: form.buttonText || null,
        position: form.position,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/admin/banners/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setBanners(prev => prev.map(b => b.id === editingId ? data.data : b));
        } else {
          setBanners(prev => [...prev, data.data]);
        }
        setShowModal(false);
        setForm(defaultForm);
        setEditingId(null);
      } else {
        alert(data.error || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBanners(prev => prev.filter(b => b.id !== id));
      } else {
        alert(data.error || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('An error occurred while deleting');
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners(prev => prev.map(b => b.id === banner.id ? data.data : b));
      }
    } catch (error) {
      console.error('Error toggling banner:', error);
    }
  };

  const filteredBanners = banners.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'all' || b.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const stats = {
    total: banners.length,
    active: banners.filter(b => b.isActive).length,
    hero: banners.filter(b => b.position === 'hero').length,
    promo: banners.filter(b => b.position === 'promo').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-600">Manage homepage hero slides and promotional banners</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Add Banner
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Banners</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-100 p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-4">
          <p className="text-sm text-blue-600">Hero Slides</p>
          <p className="text-2xl font-bold text-blue-700">{stats.hero}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-100 p-4">
          <p className="text-sm text-purple-600">Promotional</p>
          <p className="text-2xl font-bold text-purple-700">{stats.promo}</p>
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
                placeholder="Search banners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Positions</option>
              <option value="hero">Hero</option>
              <option value="promo">Promotional</option>
              <option value="sidebar">Sidebar</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banners Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBanners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={banner.image}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{banner.title}</p>
                        {banner.subtitle && (
                          <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>
                        )}
                        {banner.link && (
                          <p className="text-xs text-blue-500 truncate">{banner.link}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      banner.position === 'hero' ? 'bg-blue-100 text-blue-800' :
                      banner.position === 'promo' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {banner.position.charAt(0).toUpperCase() + banner.position.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">{banner.sortOrder}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-xs text-gray-500">
                      {banner.startDate ? formatDate(banner.startDate) : 'No start'} —{' '}
                      {banner.endDate ? formatDate(banner.endDate) : 'No end'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
                        banner.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit Banner"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id, banner.title)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Banner"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBanners.length === 0 && (
          <div className="p-12 text-center">
            <i className="fas fa-image text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || positionFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first banner to get started'}
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Your First Banner
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Banner' : 'Create New Banner'}
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
                folder="banners"
                label="Banner Image *"
                aspectRatio="banner"
              />

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Banner title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Optional subtitle"
                  />
                </div>
              </div>

              {/* Link & Button Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="/shop or https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm(prev => ({ ...prev, buttonText: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Shop Now"
                  />
                </div>
              </div>

              {/* Position, Sort Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="hero">Hero Slide</option>
                    <option value="promo">Promotional</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="category">Category</option>
                  </select>
                </div>
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
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
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
                ) : editingId ? 'Update Banner' : 'Create Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
