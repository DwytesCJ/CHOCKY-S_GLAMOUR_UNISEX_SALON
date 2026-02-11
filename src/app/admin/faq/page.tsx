'use client';

import { useState, useEffect } from 'react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultForm = {
  question: '',
  answer: '',
  category: 'General',
  sortOrder: 0,
  isActive: true,
};

const faqCategories = [
  'General',
  'Orders & Shipping',
  'Payments',
  'Returns & Refunds',
  'Products',
  'Salon Services',
  'Appointments',
  'Rewards Program',
  'Account',
];

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/faq');
      const data = await res.json();
      if (data.success) setFaqs(data.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.question || !form.answer) {
      alert('Question and answer are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        question: form.question,
        answer: form.answer,
        category: form.category,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/admin/faq/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/faq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setFaqs(prev => prev.map(f => f.id === editingId ? data.data : f));
        } else {
          setFaqs(prev => [...prev, data.data]);
        }
        setShowModal(false);
        setForm(defaultForm);
        setEditingId(null);
      } else {
        alert(data.error || 'Failed to save FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Are you sure you want to delete this FAQ?\n\n"${question.substring(0, 50)}..."`)) return;
    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFaqs(prev => prev.filter(f => f.id !== id));
      } else {
        alert(data.error || 'Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('An error occurred while deleting');
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const res = await fetch(`/api/admin/faq/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !faq.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(prev => prev.map(f => f.id === faq.id ? data.data : f));
      }
    } catch (error) {
      console.error('Error toggling FAQ:', error);
    }
  };

  const filteredFAQs = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category for stats
  const categoryStats = faqs.reduce((acc, faq) => {
    acc[faq.category] = (acc[faq.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = {
    total: faqs.length,
    active: faqs.filter(f => f.isActive).length,
    categories: Object.keys(categoryStats).length,
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
          <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
          <p className="text-gray-600">Manage frequently asked questions</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Add FAQ
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total FAQs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-100 p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-4">
          <p className="text-sm text-blue-600">Categories</p>
          <p className="text-2xl font-bold text-blue-700">{stats.categories}</p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-100 p-4">
          <p className="text-sm text-orange-600">Inactive</p>
          <p className="text-2xl font-bold text-orange-700">{stats.total - stats.active}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">FAQs by Category</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryStats).map(([category, count]) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === category
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category} ({count})
            </button>
          ))}
          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-200 text-gray-600 hover:bg-gray-300"
            >
              Clear Filter
            </button>
          )}
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
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
          <div className="w-full md:w-56">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Categories</option>
              {faqCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FAQs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="hover:bg-gray-50 transition-colors">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        faq.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {faq.category}
                      </span>
                      <span className="text-xs text-gray-400">Order: {faq.sortOrder}</span>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                      className="text-left w-full"
                    >
                      <h3 className="font-medium text-gray-900 hover:text-pink-600 transition-colors">
                        <i className={`fas fa-chevron-${expandedId === faq.id ? 'down' : 'right'} text-xs mr-2 text-gray-400`}></i>
                        {faq.question}
                      </h3>
                    </button>
                    {expandedId === faq.id && (
                      <div className="mt-3 pl-5 text-sm text-gray-600 whitespace-pre-wrap border-l-2 border-pink-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(faq)}
                      className={`p-2 rounded-lg transition-colors ${
                        faq.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={faq.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <i className={`fas fa-${faq.isActive ? 'eye' : 'eye-slash'}`}></i>
                    </button>
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit FAQ"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id, faq.question)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete FAQ"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="p-12 text-center">
            <i className="fas fa-question-circle text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first FAQ to get started'}
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Your First FAQ
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
                {editingId ? 'Edit FAQ' : 'Create New FAQ'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); setForm(defaultForm); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Enter the question"
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm(prev => ({ ...prev, answer: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Enter the answer"
                />
              </div>

              {/* Category, Sort Order, Active */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    {faqCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
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
                ) : editingId ? 'Update FAQ' : 'Create FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
