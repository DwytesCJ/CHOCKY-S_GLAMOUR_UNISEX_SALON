'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ShippingZone {
  id: string;
  name: string;
  district: string;
  region: string;
  distanceKm: number;
  baseFee: number;
  perKgFee: number;
  estimatedDays: number;
  isActive: boolean;
}

const emptyZone = { name: '', district: '', region: '', distanceKm: 0, baseFee: 0, perKgFee: 0, estimatedDays: 1, isActive: true };

export default function AdminShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyZone);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchZones(); }, []);

  const fetchZones = async () => {
    try {
      const res = await fetch('/api/admin/shipping');
      const data = await res.json();
      if (data.success) setZones(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditingId(null); setForm(emptyZone); setShowModal(true); };
  const openEdit = (z: ShippingZone) => {
    setEditingId(z.id);
    setForm({ name: z.name, district: z.district, region: z.region, distanceKm: z.distanceKm, baseFee: z.baseFee, perKgFee: z.perKgFee, estimatedDays: z.estimatedDays, isActive: z.isActive });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/shipping/${editingId}` : '/api/admin/shipping';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { fetchZones(); setShowModal(false); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this zone?')) return;
    try {
      await fetch(`/api/admin/shipping/${id}`, { method: 'DELETE' });
      fetchZones();
    } catch (e) { console.error(e); }
  };

  const toggleActive = async (z: ShippingZone) => {
    try {
      await fetch(`/api/admin/shipping/${z.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...z, isActive: !z.isActive }) });
      fetchZones();
    } catch (e) { console.error(e); }
  };

  const formatCurrency = (n: number) => `UGX ${Number(n).toLocaleString()}`;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Zones</h1>
          <p className="text-gray-500 text-sm">Manage delivery areas and fees</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm font-medium">
          Add Zone
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Fee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per Kg</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {zones.map((z) => (
              <tr key={z.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{z.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{z.district}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{z.region}</td>
                <td className="px-4 py-3 text-sm">{z.distanceKm} km</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(z.baseFee)}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(z.perKgFee)}</td>
                <td className="px-4 py-3 text-sm">{z.estimatedDays}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(z)} className={`px-2 py-1 text-xs font-medium rounded-full ${z.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {z.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(z)} className="text-gray-400 hover:text-gray-600 mr-2">Edit</button>
                  <button onClick={() => handleDelete(z.id)} className="text-red-400 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {zones.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500">No shipping zones configured</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Zone' : 'Add Zone'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Zone Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Kampala Central" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">District</label>
                  <input type="text" value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Region</label>
                  <input type="text" value={form.region} onChange={e => setForm({...form, region: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Distance (km)</label>
                  <input type="number" value={form.distanceKm} onChange={e => setForm({...form, distanceKm: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Est. Days</label>
                  <input type="number" value={form.estimatedDays} onChange={e => setForm({...form, estimatedDays: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Base Fee (UGX)</label>
                  <input type="number" value={form.baseFee} onChange={e => setForm({...form, baseFee: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Per Kg Fee (UGX)</label>
                  <input type="number" value={form.perKgFee} onChange={e => setForm({...form, perKgFee: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" />
                <span className="text-sm">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.district} className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
