'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [storeName, setStoreName] = useState("CHOCKY'S Ultimate Glamour Unisex Salon");
  const [storeEmail, setStoreEmail] = useState('josephchandin@gmail.com');
  const [storePhone, setStorePhone] = useState('+256703878485');
  const [storeAddress, setStoreAddress] = useState('Annex Building, Wandegeya, Kampala, Uganda');
  const [currency, setCurrency] = useState('UGX');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(200000);

  // Shipping zones from DB
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
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editZoneData, setEditZoneData] = useState<Partial<ShippingZone>>({});
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZone, setNewZone] = useState({ name: '', district: '', region: 'Central', distanceKm: 0, baseFee: 0, perKgFee: 0, estimatedDays: 1 });
  const [zoneSearch, setZoneSearch] = useState('');
  const [zoneRegionFilter, setZoneRegionFilter] = useState('all');

  const [mtnEnabled, setMtnEnabled] = useState(true);
  const [airtelEnabled, setAirtelEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);

  const [orderConfirmEmail, setOrderConfirmEmail] = useState(true);
  const [orderShippedEmail, setOrderShippedEmail] = useState(true);
  const [appointmentReminder, setAppointmentReminder] = useState(true);

  // Fetch shipping zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch('/api/admin/shipping-zones');
        const data = await res.json();
        if (data.success) setShippingZones(data.data);
      } catch (e) { console.error(e); }
      finally { setZonesLoading(false); }
    };
    fetchZones();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(amount);

  const handleAddZone = async () => {
    try {
      const res = await fetch('/api/admin/shipping-zones', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newZone),
      });
      const data = await res.json();
      if (data.success) {
        setShippingZones(prev => [...prev, data.data]);
        setNewZone({ name: '', district: '', region: 'Central', distanceKm: 0, baseFee: 0, perKgFee: 0, estimatedDays: 1 });
        setShowAddZone(false);
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateZone = async (id: string) => {
    try {
      const res = await fetch('/api/admin/shipping-zones', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editZoneData }),
      });
      const data = await res.json();
      if (data.success) {
        setShippingZones(prev => prev.map(z => z.id === id ? data.data : z));
        setEditingZone(null);
        setEditZoneData({});
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Delete this shipping zone?')) return;
    try {
      const res = await fetch(`/api/admin/shipping-zones?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setShippingZones(prev => prev.filter(z => z.id !== id));
    } catch (e) { console.error(e); }
  };

  const filteredZones = shippingZones.filter(z => {
    const matchesSearch = z.name.toLowerCase().includes(zoneSearch.toLowerCase()) || z.district.toLowerCase().includes(zoneSearch.toLowerCase());
    const matchesRegion = zoneRegionFilter === 'all' || z.region === zoneRegionFilter;
    return matchesSearch && matchesRegion;
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'payments', label: 'Payments' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your store configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pink-50 text-pink-600 border-l-4 border-pink-500'
                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
                    <input
                      type="email"
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Phone</label>
                    <input
                      type="tel"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="UGX">UGX - Ugandan Shilling</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                  <textarea
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">MTN Mobile Money</h3>
                    <p className="text-sm text-gray-500">Accept payments via MTN MoMo</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={mtnEnabled}
                    onChange={(e) => setMtnEnabled(e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Airtel Money</h3>
                    <p className="text-sm text-gray-500">Accept payments via Airtel Money</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={airtelEnabled}
                    onChange={(e) => setAirtelEnabled(e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">PayPal</h3>
                    <p className="text-sm text-gray-500">Accept international payments</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paypalEnabled}
                    onChange={(e) => setPaypalEnabled(e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Cash on Delivery</h3>
                    <p className="text-sm text-gray-500">Accept cash payments on delivery</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Shipping Zones</h2>
                <button onClick={() => setShowAddZone(!showAddZone)} className="px-3 py-1.5 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors">
                  {showAddZone ? 'Cancel' : '+ Add Zone'}
                </button>
              </div>

              {/* Add Zone Form */}
              {showAddZone && (
                <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-100">
                  <h3 className="font-medium text-gray-900 mb-3">Add New Shipping Zone</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input type="text" placeholder="Town name" value={newZone.name} onChange={e => setNewZone({...newZone, name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="text" placeholder="District" value={newZone.district} onChange={e => setNewZone({...newZone, district: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                    <select value={newZone.region} onChange={e => setNewZone({...newZone, region: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
                      <option value="Central">Central</option>
                      <option value="Eastern">Eastern</option>
                      <option value="Western">Western</option>
                      <option value="Northern">Northern</option>
                    </select>
                    <input type="number" placeholder="Distance (km)" value={newZone.distanceKm || ''} onChange={e => setNewZone({...newZone, distanceKm: Number(e.target.value)})} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="number" placeholder="Base fee (UGX)" value={newZone.baseFee || ''} onChange={e => setNewZone({...newZone, baseFee: Number(e.target.value)})} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="number" placeholder="Per kg fee" value={newZone.perKgFee || ''} onChange={e => setNewZone({...newZone, perKgFee: Number(e.target.value)})} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="number" placeholder="Est. days" value={newZone.estimatedDays || ''} onChange={e => setNewZone({...newZone, estimatedDays: Number(e.target.value)})} className="px-3 py-2 border rounded-lg text-sm" />
                    <button onClick={handleAddZone} className="px-3 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600">Save</button>
                  </div>
                </div>
              )}

              {/* Free shipping threshold */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (UGX)</label>
                <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(parseInt(e.target.value))} className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                <p className="text-sm text-gray-500 mt-1">Orders above this amount qualify for free shipping</p>
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-4">
                <input type="text" placeholder="Search zones..." value={zoneSearch} onChange={e => setZoneSearch(e.target.value)} className="px-3 py-2 border rounded-lg text-sm flex-1 max-w-xs" />
                <select value={zoneRegionFilter} onChange={e => setZoneRegionFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                  <option value="all">All Regions</option>
                  <option value="Central">Central</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Western">Western</option>
                  <option value="Northern">Northern</option>
                </select>
              </div>

              {/* Zones Table */}
              {zonesLoading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div></div>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Town</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Distance</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Base Fee</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Per Kg</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Days</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredZones.map(zone => (
                        <tr key={zone.id} className="hover:bg-gray-50">
                          {editingZone === zone.id ? (
                            <>
                              <td className="px-3 py-2"><input type="text" defaultValue={zone.name} onChange={e => setEditZoneData(d => ({...d, name: e.target.value}))} className="w-full px-2 py-1 border rounded text-sm" /></td>
                              <td className="px-3 py-2"><input type="text" defaultValue={zone.district} onChange={e => setEditZoneData(d => ({...d, district: e.target.value}))} className="w-full px-2 py-1 border rounded text-sm" /></td>
                              <td className="px-3 py-2">
                                <select defaultValue={zone.region} onChange={e => setEditZoneData(d => ({...d, region: e.target.value}))} className="px-2 py-1 border rounded text-sm">
                                  <option>Central</option><option>Eastern</option><option>Western</option><option>Northern</option>
                                </select>
                              </td>
                              <td className="px-3 py-2"><input type="number" defaultValue={zone.distanceKm} onChange={e => setEditZoneData(d => ({...d, distanceKm: Number(e.target.value)}))} className="w-20 px-2 py-1 border rounded text-sm text-right" /></td>
                              <td className="px-3 py-2"><input type="number" defaultValue={zone.baseFee} onChange={e => setEditZoneData(d => ({...d, baseFee: Number(e.target.value)}))} className="w-24 px-2 py-1 border rounded text-sm text-right" /></td>
                              <td className="px-3 py-2"><input type="number" defaultValue={zone.perKgFee} onChange={e => setEditZoneData(d => ({...d, perKgFee: Number(e.target.value)}))} className="w-20 px-2 py-1 border rounded text-sm text-right" /></td>
                              <td className="px-3 py-2"><input type="number" defaultValue={zone.estimatedDays} onChange={e => setEditZoneData(d => ({...d, estimatedDays: Number(e.target.value)}))} className="w-16 px-2 py-1 border rounded text-sm text-right" /></td>
                              <td className="px-3 py-2 text-center">
                                <input type="checkbox" defaultChecked={zone.isActive} onChange={e => setEditZoneData(d => ({...d, isActive: e.target.checked}))} className="w-4 h-4 text-pink-500 rounded" />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button onClick={() => handleUpdateZone(zone.id)} className="text-green-600 hover:text-green-700 text-xs font-medium mr-2">Save</button>
                                <button onClick={() => { setEditingZone(null); setEditZoneData({}); }} className="text-gray-400 hover:text-gray-600 text-xs">Cancel</button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2 font-medium text-gray-900">{zone.name}</td>
                              <td className="px-3 py-2 text-gray-600">{zone.district}</td>
                              <td className="px-3 py-2"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{zone.region}</span></td>
                              <td className="px-3 py-2 text-right text-gray-600">{zone.distanceKm} km</td>
                              <td className="px-3 py-2 text-right font-medium">{formatCurrency(zone.baseFee)}</td>
                              <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(zone.perKgFee)}</td>
                              <td className="px-3 py-2 text-right text-gray-600">{zone.estimatedDays}d</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${zone.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {zone.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button onClick={() => setEditingZone(zone.id)} className="text-blue-600 hover:text-blue-700 text-xs mr-2">Edit</button>
                                <button onClick={() => handleDeleteZone(zone.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">{filteredZones.length} of {shippingZones.length} zones shown</p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Order Confirmation Email</h3>
                    <p className="text-sm text-gray-500">Send email when order is placed</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={orderConfirmEmail}
                    onChange={(e) => setOrderConfirmEmail(e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Order Shipped Email</h3>
                    <p className="text-sm text-gray-500">Send email when order is shipped</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={orderShippedEmail}
                    onChange={(e) => setOrderShippedEmail(e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Appointment Reminders</h3>
                    <p className="text-sm text-gray-500">Send reminders 24 hours before appointment</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={appointmentReminder}
                    onChange={(e) => setAppointmentReminder(e.target.checked)}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
