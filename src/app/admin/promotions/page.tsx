"use client";

import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  images: { url: string }[];
}

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  type: string;
  discountPct: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds: string;
  products: Product[];
  createdAt: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'FLASH_DEAL',
    discountPct: 10,
    startDate: '',
    endDate: '',
    isActive: true,
    productIds: [] as string[],
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promotions');
      const data = await res.json();
      if (data.success) setPromotions(data.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products?limit=200');
      const data = await res.json();
      if (data.success) setAllProducts(data.data.products || data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      type: 'FLASH_DEAL',
      discountPct: 10,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      isActive: true,
      productIds: [],
    });
    setShowForm(true);
    fetchProducts();
  };

  const openEditForm = (promo: Promotion) => {
    setEditingId(promo.id);
    let pids: string[] = [];
    try { pids = JSON.parse(promo.productIds); } catch { /* */ }
    setForm({
      name: promo.name,
      description: promo.description || '',
      type: promo.type,
      discountPct: promo.discountPct,
      startDate: new Date(promo.startDate).toISOString().slice(0, 16),
      endDate: new Date(promo.endDate).toISOString().slice(0, 16),
      isActive: promo.isActive,
      productIds: pids,
    });
    setShowForm(true);
    fetchProducts();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...form } : form;
      const res = await fetch('/api/promotions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchPromotions();
      } else {
        alert(data.error || 'Failed to save promotion');
      }
    } catch {
      alert('Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (promo: Promotion) => {
    try {
      const res = await fetch('/api/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promo.id, isActive: !promo.isActive }),
      });
      const data = await res.json();
      if (data.success) fetchPromotions();
    } catch {
      alert('Failed to update promotion');
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Delete this promotion?')) return;
    try {
      const res = await fetch(`/api/promotions?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchPromotions();
    } catch {
      alert('Failed to delete promotion');
    }
  };

  const toggleProduct = (productId: string) => {
    setForm(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const getStatus = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    if (!promo.isActive) return { label: 'Disabled', color: 'bg-gray-100 text-gray-600' };
    if (now < start) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' };
    if (now > end) return { label: 'Expired', color: 'bg-red-100 text-red-700' };
    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  };

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Flash Deals</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotions, flash deals, and scheduled discounts</p>
        </div>
        <button onClick={openCreateForm} className="btn btn-primary whitespace-nowrap">
          <i className="fas fa-plus mr-2"></i>Create Promotion
        </button>
      </div>

      {/* Promotions List */}
      {promotions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <i className="fas fa-bullhorn text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Promotions Yet</h3>
          <p className="text-gray-400 mb-6">Create your first promotion to display flash deals on the homepage.</p>
          <button onClick={openCreateForm} className="btn btn-primary">
            <i className="fas fa-plus mr-2"></i>Create First Promotion
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map(promo => {
            const status = getStatus(promo);
            return (
              <div key={promo.id} className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{promo.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {promo.type.replace('_', ' ')}
                      </span>
                    </div>
                    {promo.description && (
                      <p className="text-sm text-gray-500 mb-2">{promo.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span><i className="fas fa-percent mr-1"></i>{promo.discountPct}% off</span>
                      <span>
                        <i className="fas fa-calendar mr-1"></i>
                        {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                      </span>
                      <span><i className="fas fa-box mr-1"></i>{promo.products?.length || 0} products</span>
                    </div>
                    {/* Product thumbnails */}
                    {promo.products && promo.products.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {promo.products.slice(0, 6).map(p => (
                          <div key={p.id} className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border">
                            <img
                              src={p.images?.[0]?.url || '/images/placeholder.jpg'}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {promo.products.length > 6 && (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 border">
                            +{promo.products.length - 6}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(promo)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        promo.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {promo.isActive ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => openEditForm(promo)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => deletePromo(promo.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Promotion' : 'Create Promotion'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Promotion Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="e.g., Weekend Flash Sale"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                  rows={2}
                  placeholder="Brief description of this promotion"
                />
              </div>

              {/* Type + Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="FLASH_DEAL">Flash Deal</option>
                    <option value="SEASONAL">Seasonal Sale</option>
                    <option value="CLEARANCE">Clearance</option>
                    <option value="BUNDLE">Bundle Deal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.discountPct}
                    onChange={e => setForm(prev => ({ ...prev, discountPct: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm font-medium">Active</span>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Products ({form.productIds.length} selected)
                </label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary mb-3"
                  placeholder="Search products..."
                />
                {productsLoading ? (
                  <div className="text-center py-4 text-gray-400">Loading products...</div>
                ) : (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <label
                        key={product.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b last:border-0 ${
                          form.productIds.includes(product.id) ? 'bg-primary/5' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.productIds.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="rounded text-primary"
                        />
                        <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          <img
                            src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm flex-1 truncate">{product.name}</span>
                        <span className="text-sm text-gray-500">
                          UGX {Number(product.price).toLocaleString()}
                        </span>
                      </label>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">No products found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary disabled:opacity-60"
                >
                  {saving ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>
                  ) : (
                    <>{editingId ? 'Update' : 'Create'} Promotion</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
