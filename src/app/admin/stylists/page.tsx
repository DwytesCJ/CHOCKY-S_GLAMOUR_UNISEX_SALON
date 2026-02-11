'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface Stylist {
  id: string;
  name: string;
  slug: string;
  title: string;
  bio: string | null;
  image: string | null;
  phone: string | null;
  email: string | null;
  specialties: string | null;
  experience: number | null;
  rating: number | null;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  workingHours: string | null;
  createdAt: string;
  updatedAt: string;
}

const defaultForm = {
  name: '',
  title: '',
  bio: '',
  image: '',
  phone: '',
  email: '',
  specialties: '',
  experience: 0,
  rating: 5.0,
  isActive: true,
  isFeatured: false,
  workingHours: 'Mon-Sat: 9:00 AM - 7:00 PM',
};

export default function AdminStylists() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stylists');
      const data = await res.json();
      if (data.success) setStylists(data.data);
    } catch (error) {
      console.error('Error fetching stylists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleEdit = (stylist: Stylist) => {
    setEditingId(stylist.id);
    setForm({
      name: stylist.name,
      title: stylist.title,
      bio: stylist.bio || '',
      image: stylist.image || '',
      phone: stylist.phone || '',
      email: stylist.email || '',
      specialties: stylist.specialties || '',
      experience: stylist.experience || 0,
      rating: stylist.rating ? Number(stylist.rating) : 5.0,
      isActive: stylist.isActive,
      isFeatured: stylist.isFeatured,
      workingHours: stylist.workingHours || '',
    });
    setShowModal(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSave = async () => {
    if (!form.name || !form.title) {
      alert('Name and title are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: generateSlug(form.name),
        title: form.title,
        bio: form.bio || null,
        image: form.image || null,
        phone: form.phone || null,
        email: form.email || null,
        specialties: form.specialties || null,
        experience: form.experience || null,
        rating: form.rating,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        workingHours: form.workingHours || null,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/admin/stylists/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/stylists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setStylists(prev => prev.map(s => s.id === editingId ? data.data : s));
        } else {
          setStylists(prev => [...prev, data.data]);
        }
        setShowModal(false);
        setForm(defaultForm);
        setEditingId(null);
      } else {
        alert(data.error || 'Failed to save stylist');
      }
    } catch (error) {
      console.error('Error saving stylist:', error);
      alert('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/stylists/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStylists(prev => prev.filter(s => s.id !== id));
      } else {
        alert(data.error || 'Failed to delete stylist');
      }
    } catch (error) {
      console.error('Error deleting stylist:', error);
      alert('An error occurred while deleting');
    }
  };

  const handleToggleActive = async (stylist: Stylist) => {
    try {
      const res = await fetch(`/api/admin/stylists/${stylist.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !stylist.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setStylists(prev => prev.map(s => s.id === stylist.id ? data.data : s));
      }
    } catch (error) {
      console.error('Error toggling stylist:', error);
    }
  };

  const handleToggleFeatured = async (stylist: Stylist) => {
    try {
      const res = await fetch(`/api/admin/stylists/${stylist.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !stylist.isFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setStylists(prev => prev.map(s => s.id === stylist.id ? data.data : s));
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const filteredStylists = stylists.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.specialties || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && s.isActive) ||
      (statusFilter === 'inactive' && !s.isActive) ||
      (statusFilter === 'featured' && s.isFeatured);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: stylists.length,
    active: stylists.filter(s => s.isActive).length,
    featured: stylists.filter(s => s.isFeatured).length,
    avgExperience: stylists.length > 0
      ? Math.round(stylists.reduce((sum, s) => sum + (s.experience || 0), 0) / stylists.length)
      : 0,
  };

  const renderStars = (rating: number | null) => {
    const r = rating ? Number(rating) : 0;
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star text-xs ${i < Math.round(r) ? 'text-yellow-400' : 'text-gray-300'}`}
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
          <h1 className="text-2xl font-bold text-gray-900">Stylists</h1>
          <p className="text-gray-600">Manage salon team members and stylists</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Add Stylist
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Stylists</p>
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
          <p className="text-sm text-blue-600">Avg Experience</p>
          <p className="text-2xl font-bold text-blue-700">{stats.avgExperience} yrs</p>
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
                placeholder="Search stylists..."
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

      {/* Stylists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStylists.map((stylist) => (
          <div key={stylist.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
              {stylist.image ? (
                <Image
                  src={stylist.image}
                  alt={stylist.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                  <i className="fas fa-user text-5xl text-pink-300"></i>
                </div>
              )}
              {/* Badges overlay */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                  stylist.isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                }`}>
                  {stylist.isActive ? 'Active' : 'Inactive'}
                </span>
                {stylist.isFeatured && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/90 text-white backdrop-blur-sm">
                    <i className="fas fa-star mr-1"></i> Featured
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{stylist.name}</h3>
                  <p className="text-sm text-pink-600">{stylist.title}</p>
                </div>
                <div className="flex gap-0.5">
                  {renderStars(stylist.rating)}
                </div>
              </div>

              {stylist.specialties && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {stylist.specialties.split(',').map((spec, i) => (
                    <span key={i} className="px-2 py-0.5 bg-pink-50 text-pink-700 text-xs rounded-full">
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                {stylist.experience && (
                  <span><i className="fas fa-briefcase mr-1"></i> {stylist.experience} yrs exp</span>
                )}
                {stylist.reviewCount > 0 && (
                  <span><i className="fas fa-comment mr-1"></i> {stylist.reviewCount} reviews</span>
                )}
              </div>

              {stylist.bio && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{stylist.bio}</p>
              )}

              {/* Contact Info */}
              <div className="text-xs text-gray-500 space-y-1 mb-4">
                {stylist.phone && (
                  <p><i className="fas fa-phone mr-2 w-4 text-center"></i>{stylist.phone}</p>
                )}
                {stylist.email && (
                  <p><i className="fas fa-envelope mr-2 w-4 text-center"></i>{stylist.email}</p>
                )}
                {stylist.workingHours && (
                  <p><i className="fas fa-clock mr-2 w-4 text-center"></i>{stylist.workingHours}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(stylist)}
                    className={`p-1.5 rounded-lg text-sm transition-colors ${
                      stylist.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={stylist.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <i className={`fas fa-${stylist.isActive ? 'eye' : 'eye-slash'}`}></i>
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(stylist)}
                    className={`p-1.5 rounded-lg text-sm transition-colors ${
                      stylist.isFeatured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={stylist.isFeatured ? 'Unfeature' : 'Feature'}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(stylist)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(stylist.id, stylist.name)}
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

      {filteredStylists.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <i className="fas fa-user-tie text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stylists found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first stylist to get started'}
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Your First Stylist
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Stylist' : 'Add New Stylist'}
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
                folder="stylists"
                label="Stylist Photo"
                aspectRatio="portrait"
              />

              {/* Name & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="e.g., Grace Namukasa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="e.g., Senior Hair Stylist"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Brief description of the stylist's background and expertise"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="+256 7XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="stylist@chockys.ug"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                <input
                  type="text"
                  value={form.specialties}
                  onChange={(e) => setForm(prev => ({ ...prev, specialties: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Braiding, Coloring, Styling (comma-separated)"
                />
                <p className="text-xs text-gray-400 mt-1">Separate multiple specialties with commas</p>
              </div>

              {/* Experience, Rating, Working Hours */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input
                    type="number"
                    value={form.experience}
                    onChange={(e) => setForm(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    min="0"
                    max="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input
                    type="number"
                    value={form.rating}
                    onChange={(e) => setForm(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={form.workingHours}
                    onChange={(e) => setForm(prev => ({ ...prev, workingHours: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Mon-Sat: 9AM-7PM"
                  />
                </div>
              </div>

              {/* Active & Featured */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
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
                ) : editingId ? 'Update Stylist' : 'Add Stylist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
