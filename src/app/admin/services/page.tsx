'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ExportButton from '@/components/admin/ExportButton';
import { exportConfigs } from '@/lib/export';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { services: number };
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '', sortOrder: 0, isActive: true });
  const [catSaving, setCatSaving] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/services');
        const data = await response.json();
        
        if (data.success) {
          const transformedServices = data.data.map((service: any) => ({
            id: service.id,
            name: service.name,
            description: service.description || '',
            duration: service.duration || 0,
            price: Number(service.price),
            category: service.category?.name || 'Uncategorized',
            isActive: service.isActive ?? true,
            createdAt: service.createdAt
          }));
          setServices(transformedServices);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setServices(prev => prev.filter(s => s.id !== id));
      } else {
        alert(data.error || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('An error occurred while deleting the service');
    }
  };

  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res = await fetch('/api/admin/service-categories');
      const data = await res.json();
      if (data.success) setServiceCategories(data.data);
    } catch (error) {
      console.error('Error fetching service categories:', error);
    } finally {
      setCatLoading(false);
    }
  }, []);

  const handleOpenCategoryModal = () => {
    setShowCategoryModal(true);
    fetchCategories();
  };

  const handleEditCat = (cat: ServiceCategory) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', sortOrder: cat.sortOrder, isActive: cat.isActive });
  };

  const handleCancelEditCat = () => {
    setEditingCat(null);
    setCatForm({ name: '', description: '', icon: '', sortOrder: 0, isActive: true });
  };

  const handleSaveCat = async () => {
    if (!catForm.name.trim()) return alert('Name is required');
    setCatSaving(true);
    try {
      const url = editingCat
        ? `/api/admin/service-categories/${editingCat.id}`
        : '/api/admin/service-categories';
      const method = editingCat ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchCategories();
        handleCancelEditCat();
      } else {
        alert(data.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving service category:', error);
      alert('An error occurred');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCat = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/service-categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        fetchCategories();
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting service category:', error);
      alert('An error occurred');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(services.map(s => s.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage salon services</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenCategoryModal}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Manage Categories
          </button>
          <ExportButton
            data={services}
            columns={exportConfigs.services.columns}
            filename="chockys-services"
            title="Services Report"
            summary={[
              { label: 'Total Services', value: String(services.length) },
              { label: 'Active', value: String(services.filter(s => s.isActive).length) },
              { label: 'Categories', value: String(categories.length) },
            ]}
          />
          <Link
            href="/admin/services/new"
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Service
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Services</p>
          <p className="text-2xl font-bold text-gray-900">{services.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-100 p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700">{services.filter(s => s.isActive).length}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-100 p-4">
          <p className="text-sm text-purple-600">Categories</p>
          <p className="text-2xl font-bold text-purple-700">{categories.length}</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg shadow-sm p-4 text-white">
          <p className="text-pink-100 text-sm">Total Revenue Potential</p>
          <p className="text-2xl font-bold">
            {formatCurrency(services.reduce((sum, s) => sum + s.price, 0))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{service.category}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  service.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.description || 'No description provided'}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="font-medium text-gray-900">{formatCurrency(service.price)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                <Link
                  href={`/admin/services/${service.id}`}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit Service"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
                <button
                  onClick={() => handleDelete(service.id, service.name)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Service"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500">
            {searchQuery || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Services will appear here when you add them'}
          </p>
          <Link
            href="/admin/services/new"
            className="mt-4 inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Service
          </Link>
        </div>
      )}

      {/* Service Categories Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Service Categories</h2>
              <button onClick={() => { setShowCategoryModal(false); handleCancelEditCat(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Add/Edit Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">{editingCat ? 'Edit Category' : 'Add New Category'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Category name *"
                    value={catForm.name}
                    onChange={(e) => setCatForm(f => ({ ...f, name: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  <input
                    type="text"
                    placeholder="Icon (e.g. fas fa-cut)"
                    value={catForm.icon}
                    onChange={(e) => setCatForm(f => ({ ...f, icon: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={catForm.description}
                    onChange={(e) => setCatForm(f => ({ ...f, description: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 md:col-span-2"
                  />
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-600">
                      Sort Order:
                      <input
                        type="number"
                        value={catForm.sortOrder}
                        onChange={(e) => setCatForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                        className="ml-2 w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={catForm.isActive}
                        onChange={(e) => setCatForm(f => ({ ...f, isActive: e.target.checked }))}
                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      />
                      Active
                    </label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {editingCat && (
                      <button onClick={handleCancelEditCat} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleSaveCat}
                      disabled={catSaving}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors"
                    >
                      {catSaving ? 'Saving...' : editingCat ? 'Update' : 'Add Category'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories List */}
              {catLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                </div>
              ) : serviceCategories.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No service categories yet. Add one above.</p>
              ) : (
                <div className="space-y-2">
                  {serviceCategories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3">
                        {cat.icon && <i className={`${cat.icon} text-pink-500`}></i>}
                        <div>
                          <p className="font-medium text-gray-900">{cat.name}</p>
                          <p className="text-sm text-gray-500">
                            {cat._count.services} service{cat._count.services !== 1 ? 's' : ''}
                            {cat.description && ` · ${cat.description}`}
                          </p>
                        </div>
                        {!cat.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Inactive</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditCat(cat)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCat(cat.id, cat.name)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}