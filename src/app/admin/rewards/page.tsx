"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface RewardTier {
  id: string;
  name: string;
  slug: string;
  minPoints: number;
  maxPoints: number | null;
  pointsMultiplier: number;
  benefits: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
}

interface RewardSettings {
  pointsPerUGX: number;
  signupBonus: number;
  reviewBonus: number;
  referralBonus: number;
  birthdayBonus: number;
  salonMultiplier: number;
  pointsExpireMonths: number;
}

const defaultSettings: RewardSettings = {
  pointsPerUGX: 1000, // 1 point per 1000 UGX
  signupBonus: 500,
  reviewBonus: 50,
  referralBonus: 1000,
  birthdayBonus: 500,
  salonMultiplier: 2,
  pointsExpireMonths: 12,
};

export default function AdminRewardsPage() {
  const [tiers, setTiers] = useState<RewardTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<RewardSettings>(defaultSettings);
  const [editingTier, setEditingTier] = useState<RewardTier | null>(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTiers();
    fetchSettings();
  }, []);

  const fetchTiers = async () => {
    try {
      const res = await fetch('/api/rewards/tiers');
      const data = await res.json();
      if (data.success) {
        setTiers(data.data);
      }
    } catch (error) {
      console.error('Error fetching tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/rewards/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/rewards/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSaveTier = async () => {
    if (!editingTier) return;
    setSaving(true);
    try {
      const method = editingTier.id ? 'PUT' : 'POST';
      const url = editingTier.id ? `/api/admin/rewards/tiers/${editingTier.id}` : '/api/admin/rewards/tiers';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTier),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Tier saved successfully!' });
        fetchTiers();
        setShowTierModal(false);
        setEditingTier(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save tier' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteTier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;
    try {
      const res = await fetch(`/api/admin/rewards/tiers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Tier deleted successfully!' });
        fetchTiers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete tier' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const openNewTierModal = () => {
    setEditingTier({
      id: '',
      name: '',
      slug: '',
      minPoints: 0,
      maxPoints: null,
      pointsMultiplier: 1,
      benefits: '',
      icon: 'fa-crown',
      color: '#D4AF37',
      isActive: true,
    });
    setShowTierModal(true);
  };

  const openEditTierModal = (tier: RewardTier) => {
    setEditingTier({ ...tier });
    setShowTierModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards Management</h1>
          <p className="text-gray-500 text-sm">Configure reward tiers and earning rates</p>
        </div>
        <Link href="/admin" className="text-primary hover:underline text-sm">
          <i className="fas fa-arrow-left mr-1"></i> Back to Dashboard
        </Link>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Earning Settings */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          <i className="fas fa-cog mr-2 text-primary"></i>Earning Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points per UGX spent</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">1 point per</span>
              <input
                type="number"
                value={settings.pointsPerUGX}
                onChange={(e) => setSettings({ ...settings, pointsPerUGX: Number(e.target.value) })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-gray-500">UGX</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sign Up Bonus</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.signupBonus}
                onChange={(e) => setSettings({ ...settings, signupBonus: Number(e.target.value) })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-gray-500">points</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Bonus</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.reviewBonus}
                onChange={(e) => setSettings({ ...settings, reviewBonus: Number(e.target.value) })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-gray-500">points</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Bonus</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.referralBonus}
                onChange={(e) => setSettings({ ...settings, referralBonus: Number(e.target.value) })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-gray-500">points</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Birthday Bonus</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.birthdayBonus}
                onChange={(e) => setSettings({ ...settings, birthdayBonus: Number(e.target.value) })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-gray-500">points</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salon Visit Multiplier</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={settings.salonMultiplier}
                onChange={(e) => setSettings({ ...settings, salonMultiplier: Number(e.target.value) })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-gray-500">x points</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points Expiry</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.pointsExpireMonths}
                onChange={(e) => setSettings({ ...settings, pointsExpireMonths: Number(e.target.value) })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-gray-500">months</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Reward Tiers */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            <i className="fas fa-layer-group mr-2 text-primary"></i>Reward Tiers
          </h2>
          <button
            onClick={openNewTierModal}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
          >
            <i className="fas fa-plus mr-1"></i> Add Tier
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-20"></div>
            ))}
          </div>
        ) : tiers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-crown text-4xl mb-4 opacity-30"></i>
            <p>No reward tiers configured yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tiers.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: tier.color || '#D4AF37' }}
                  >
                    <i className={`fas ${tier.icon || 'fa-crown'}`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold">{tier.name}</h3>
                    <p className="text-sm text-gray-500">
                      {tier.minPoints.toLocaleString()} - {tier.maxPoints ? tier.maxPoints.toLocaleString() : '∞'} points | {Number(tier.pointsMultiplier)}x multiplier
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${tier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {tier.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => openEditTierModal(tier)}
                    className="p-2 text-gray-500 hover:text-primary"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    className="p-2 text-gray-500 hover:text-red-500"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tier Modal */}
      {showTierModal && editingTier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">{editingTier.id ? 'Edit Tier' : 'New Tier'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingTier.name}
                  onChange={(e) => setEditingTier({ ...editingTier, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g., Gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Points</label>
                  <input
                    type="number"
                    value={editingTier.minPoints}
                    onChange={(e) => setEditingTier({ ...editingTier, minPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Points (optional)</label>
                  <input
                    type="number"
                    value={editingTier.maxPoints || ''}
                    onChange={(e) => setEditingTier({ ...editingTier, maxPoints: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points Multiplier</label>
                <input
                  type="number"
                  step="0.25"
                  value={editingTier.pointsMultiplier}
                  onChange={(e) => setEditingTier({ ...editingTier, pointsMultiplier: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (FontAwesome)</label>
                  <input
                    type="text"
                    value={editingTier.icon || ''}
                    onChange={(e) => setEditingTier({ ...editingTier, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="fa-crown"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    value={editingTier.color || '#D4AF37'}
                    onChange={(e) => setEditingTier({ ...editingTier, color: e.target.value })}
                    className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (one per line)</label>
                <textarea
                  value={editingTier.benefits || ''}
                  onChange={(e) => setEditingTier({ ...editingTier, benefits: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Free shipping on all orders&#10;Priority customer support&#10;Birthday bonus points"
                ></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tierActive"
                  checked={editingTier.isActive}
                  onChange={(e) => setEditingTier({ ...editingTier, isActive: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="tierActive" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => { setShowTierModal(false); setEditingTier(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTier}
                disabled={saving || !editingTier.name}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Tier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
