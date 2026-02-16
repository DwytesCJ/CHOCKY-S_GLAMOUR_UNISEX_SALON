"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  beforeImage: string;
  afterImage: string;
  category: string;
  stylistName: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    beforeImage: '',
    afterImage: '',
    category: 'Hair',
    stylistName: '',
    isActive: true,
    sortOrder: 0,
  });

  const categories = ['Hair', 'Makeup', 'Skin', 'Nails', 'Bridal', 'Other'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/gallery');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.beforeImage || !form.afterImage) {
      setMessage({ type: 'error', text: 'Title, before image, and after image are required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/admin/gallery/${editing.id}` : '/api/admin/gallery';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: editing ? 'Updated successfully!' : 'Created successfully!' });
        fetchItems();
        closeModal();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Deleted successfully!' });
        fetchItems();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', description: '', beforeImage: '', afterImage: '', category: 'Hair', stylistName: '', isActive: true, sortOrder: 0 });
    setShowModal(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || '',
      beforeImage: item.beforeImage,
      afterImage: item.afterImage,
      category: item.category,
      stylistName: item.stylistName || '',
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'beforeImage' | 'afterImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'gallery');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, [field]: data.url }));
      }
    } catch {
      console.error('Upload failed');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Before & After Gallery</h1>
          <p className="text-gray-500 text-sm">Manage transformation photos</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">
          <i className="fas fa-plus mr-1"></i> Add Item
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl h-64"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <i className="fas fa-images text-5xl mb-4 opacity-30"></i>
          <p className="text-lg">No gallery items yet</p>
          <p className="text-sm">Add before & after transformation photos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
              <div className="grid grid-cols-2 h-48">
                <div className="relative">
                  <Image src={item.beforeImage || '/images/placeholder.jpg'} alt="Before" fill className="object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Before</span>
                </div>
                <div className="relative">
                  <Image src={item.afterImage || '/images/placeholder.jpg'} alt="After" fill className="object-cover" />
                  <span className="absolute bottom-2 right-2 bg-primary/80 text-white text-xs px-2 py-1 rounded">After</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{item.category}{item.stylistName ? ` • ${item.stylistName}` : ''}</p>
                {item.description && <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(item)} className="text-xs text-primary hover:underline">
                    <i className="fas fa-edit mr-1"></i>Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:underline">
                    <i className="fas fa-trash mr-1"></i>Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">{editing ? 'Edit Gallery Item' : 'New Gallery Item'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., Hair Transformation" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Before Image *</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'beforeImage')} className="w-full text-sm" />
                  {form.beforeImage && (
                    <div className="mt-2 relative h-32 rounded overflow-hidden">
                      <Image src={form.beforeImage} alt="Before" fill className="object-cover" />
                    </div>
                  )}
                  <input type="text" value={form.beforeImage} onChange={(e) => setForm({ ...form, beforeImage: e.target.value })} className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-xs" placeholder="Or paste URL" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">After Image *</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'afterImage')} className="w-full text-sm" />
                  {form.afterImage && (
                    <div className="mt-2 relative h-32 rounded overflow-hidden">
                      <Image src={form.afterImage} alt="After" fill className="object-cover" />
                    </div>
                  )}
                  <input type="text" value={form.afterImage} onChange={(e) => setForm({ ...form, afterImage: e.target.value })} className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-xs" placeholder="Or paste URL" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stylist Name</label>
                  <input type="text" value={form.stylistName} onChange={(e) => setForm({ ...form, stylistName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-gray-700">Active (visible on site)</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
