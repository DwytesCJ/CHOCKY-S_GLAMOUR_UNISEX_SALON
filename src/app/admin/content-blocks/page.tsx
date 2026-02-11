"use client";

import React, { useState, useEffect } from 'react';

interface ContentBlock {
  id: string;
  key: string;
  title: string | null;
  content: string;
  type: string;
  page: string;
  section: string | null;
  sortOrder: number;
  isActive: boolean;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
}

const pageOptions = ['home', 'about', 'salon', 'shop', 'contact', 'faq', 'rewards', 'blog', 'global'];
const typeOptions = ['text', 'html', 'json', 'markdown'];

export default function AdminContentBlocksPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [filterPage, setFilterPage] = useState('');
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    title: '',
    content: '',
    type: 'text',
    page: 'home',
    section: '',
    sortOrder: 0,
    isActive: true,
    metadata: '',
  });

  useEffect(() => {
    fetchBlocks();
  }, [filterPage]);

  async function fetchBlocks() {
    setLoading(true);
    try {
      const url = filterPage
        ? `/api/admin/content-blocks?page=${filterPage}`
        : '/api/admin/content-blocks';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBlocks(data.data);
      }
    } catch (error) {
      console.error('Error fetching content blocks:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingBlock(null);
    setFormData({
      key: '',
      title: '',
      content: '',
      type: 'text',
      page: 'home',
      section: '',
      sortOrder: 0,
      isActive: true,
      metadata: '',
    });
    setShowModal(true);
  }

  function openEditModal(block: ContentBlock) {
    setEditingBlock(block);
    setFormData({
      key: block.key,
      title: block.title || '',
      content: block.content,
      type: block.type,
      page: block.page,
      section: block.section || '',
      sortOrder: block.sortOrder,
      isActive: block.isActive,
      metadata: block.metadata || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        title: formData.title || null,
        section: formData.section || null,
        metadata: formData.metadata ? formData.metadata : null,
      };

      let res;
      if (editingBlock) {
        res = await fetch(`/api/admin/content-blocks/${editingBlock.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/content-blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchBlocks();
      } else {
        alert(data.error || 'Failed to save content block');
      }
    } catch (error) {
      console.error('Error saving content block:', error);
      alert('Failed to save content block');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this content block?')) return;

    try {
      const res = await fetch(`/api/admin/content-blocks/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchBlocks();
      } else {
        alert(data.error || 'Failed to delete content block');
      }
    } catch (error) {
      console.error('Error deleting content block:', error);
    }
  }

  async function toggleActive(block: ContentBlock) {
    try {
      const res = await fetch(`/api/admin/content-blocks/${block.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !block.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBlocks();
      }
    } catch (error) {
      console.error('Error toggling content block:', error);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Blocks</h1>
          <p className="text-gray-500 mt-1">Manage dynamic content across your website</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Add Content Block
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Page:</label>
          <select
            value={filterPage}
            onChange={(e) => setFilterPage(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Pages</option>
            {pageOptions.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Content Blocks Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-3">Loading content blocks...</p>
          </div>
        ) : blocks.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-cube text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">No content blocks found</p>
            <button
              onClick={openCreateModal}
              className="mt-3 text-primary hover:underline text-sm"
            >
              Create your first content block
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Key</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Page</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Section</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Active</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blocks.map((block) => (
                  <tr key={block.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-sm bg-gray-100 px-2 py-0.5 rounded text-primary font-mono">
                        {block.key}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {block.title || <span className="text-gray-400 italic">No title</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {block.page}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {block.section || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {block.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {block.sortOrder}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(block)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          block.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            block.isActive ? 'left-5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(block)}
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(block.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingBlock ? 'Edit Content Block' : 'Create Content Block'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '') })}
                  placeholder="e.g., home_hero_title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                  required
                  disabled={!!editingBlock}
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier (lowercase, underscores). Cannot be changed after creation.</p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Human-readable title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Page & Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                  <select
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {pageOptions.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g., hero, features, stats"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Type & Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Content text, HTML, or JSON..."
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                  required
                />
              </div>

              {/* Metadata */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metadata (JSON)</label>
                <textarea
                  value={formData.metadata}
                  onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                  placeholder='{"icon": "fa-heart", "color": "#ff0000"}'
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">Active</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>}
                  {editingBlock ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
