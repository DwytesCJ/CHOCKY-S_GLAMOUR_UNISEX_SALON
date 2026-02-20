'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Address {
  id: string;
  type: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
}

const emptyAddress = {
  type: 'SHIPPING',
  firstName: '',
  lastName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  district: '',
  country: 'Uganda',
  postalCode: '',
  isDefault: false,
};

export default function AccountAddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/account/login?redirect=/account/addresses');
    else if (status === 'authenticated') fetchAddresses();
  }, [status]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/account/addresses');
      const data = await res.json();
      if (data.success) setAddresses(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditingId(null); setForm(emptyAddress); setShowModal(true); };
  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({ type: addr.type, firstName: addr.firstName, lastName: addr.lastName, phone: addr.phone, addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 || '', city: addr.city, district: addr.district, country: addr.country, postalCode: addr.postalCode || '', isDefault: addr.isDefault });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId ? `/api/account/addresses/${editingId}` : '/api/account/addresses';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { fetchAddresses(); setShowModal(false); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
      fetchAddresses();
    } catch (e) { console.error(e); }
  };

  const setDefault = async (id: string) => {
    try {
      await fetch(`/api/account/addresses/${id}/default`, { method: 'PUT' });
      fetchAddresses();
    } catch (e) { console.error(e); }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/account" className="text-gray-500 hover:text-gray-700">Account</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">Addresses</li>
          </ol>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
          <button onClick={openAdd} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm font-medium">
            Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-500 mb-4">Add an address for faster checkout</p>
            <button onClick={openAdd} className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600">Add Address</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className={`bg-white rounded-xl shadow-sm p-6 border-2 ${addr.isDefault ? 'border-pink-300' : 'border-transparent'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">{addr.type}</span>
                    {addr.isDefault && <span className="text-xs font-medium px-2 py-1 bg-pink-100 text-pink-700 rounded">Default</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(addr)} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="text-gray-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                <p className="text-sm text-gray-600">{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-sm text-gray-600">{addr.addressLine2}</p>}
                <p className="text-sm text-gray-600">{addr.city}, {addr.district}</p>
                <p className="text-sm text-gray-600">{addr.country}</p>
                <p className="text-sm text-gray-600 mt-2">{addr.phone}</p>
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} className="text-sm text-pink-600 hover:underline mt-3">Set as Default</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Address' : 'Add Address'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="SHIPPING">Shipping</option>
                    <option value="BILLING">Billing</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 1</label>
                  <input type="text" value={form.addressLine1} onChange={e => setForm({...form, addressLine1: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2 (optional)</label>
                  <input type="text" value={form.addressLine2} onChange={e => setForm({...form, addressLine2: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">District</label>
                    <input type="text" value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input type="text" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input type="text" value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} className="rounded" />
                  <span className="text-sm">Set as default address</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.firstName || !form.phone || !form.addressLine1 || !form.city || !form.district} className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
