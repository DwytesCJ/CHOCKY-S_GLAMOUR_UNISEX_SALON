'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // General settings
  const [storeName, setStoreName] = useState("CHOCKY'S Ultimate Glamour Unisex Salon");
  const [storeEmail, setStoreEmail] = useState('josephchandin@gmail.com');
  const [storePhone, setStorePhone] = useState('+256703878485');
  const [storeAddress, setStoreAddress] = useState('Annex Building, Wandegeya, Kampala, Uganda');
  const [currency, setCurrency] = useState('UGX');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(200000);
  const [whatsappNumber, setWhatsappNumber] = useState('+256703878485');

  // Opening hours
  const [openingHours, setOpeningHours] = useState({
    monday: '9:00 AM - 7:00 PM',
    tuesday: '9:00 AM - 7:00 PM',
    wednesday: '9:00 AM - 7:00 PM',
    thursday: '9:00 AM - 7:00 PM',
    friday: '9:00 AM - 7:00 PM',
    saturday: '9:00 AM - 6:00 PM',
    sunday: 'Closed',
  });

  // Social links
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Payment toggles
  const [mtnEnabled, setMtnEnabled] = useState(true);
  const [airtelEnabled, setAirtelEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);

  // Notification toggles
  const [orderConfirmEmail, setOrderConfirmEmail] = useState(true);
  const [orderShippedEmail, setOrderShippedEmail] = useState(true);
  const [appointmentReminder, setAppointmentReminder] = useState(true);

  // Shipping zones
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

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch('/api/admin/shipping-zones');
        const data = await res.json();
        if (data.success) setShippingZones(data.data);
      } catch (e) { console.error(e); }
      finally { setZonesLoading(false); }
    };
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.data) {
          const s = data.data;
          if (s.storeName) setStoreName(s.storeName);
          if (s.storeEmail) setStoreEmail(s.storeEmail);
          if (s.storePhone) setStorePhone(s.storePhone);
          if (s.storeAddress) setStoreAddress(s.storeAddress);
          if (s.currency) setCurrency(s.currency);
          if (s.freeShippingThreshold) setFreeShippingThreshold(parseInt(s.freeShippingThreshold));
          if (s.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
          if (s.facebookUrl) setFacebookUrl(s.facebookUrl);
          if (s.instagramUrl) setInstagramUrl(s.instagramUrl);
          if (s.twitterUrl) setTwitterUrl(s.twitterUrl);
          if (s.tiktokUrl) setTiktokUrl(s.tiktokUrl);
          if (s.youtubeUrl) setYoutubeUrl(s.youtubeUrl);
          if (s.openingHours) {
            try { setOpeningHours(prev => ({ ...prev, ...JSON.parse(s.openingHours) })); } catch {}
          }
          if (s.paymentMtnEnabled !== undefined) setMtnEnabled(s.paymentMtnEnabled === 'true');
          if (s.paymentAirtelEnabled !== undefined) setAirtelEnabled(s.paymentAirtelEnabled === 'true');
          if (s.paymentPaypalEnabled !== undefined) setPaypalEnabled(s.paymentPaypalEnabled === 'true');
          if (s.paymentCodEnabled !== undefined) setCodEnabled(s.paymentCodEnabled === 'true');
          if (s.notifyOrderConfirm !== undefined) setOrderConfirmEmail(s.notifyOrderConfirm === 'true');
          if (s.notifyOrderShipped !== undefined) setOrderShippedEmail(s.notifyOrderShipped === 'true');
          if (s.notifyAppointmentReminder !== undefined) setAppointmentReminder(s.notifyAppointmentReminder === 'true');
        }
      } catch (e) { console.error(e); }
    };
    fetchZones();
    fetchSettings();
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
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            storeName, storeEmail, storePhone, storeAddress, currency,
            freeShippingThreshold: String(freeShippingThreshold),
            whatsappNumber,
            openingHours: JSON.stringify(openingHours),
            facebookUrl, instagramUrl, twitterUrl, tiktokUrl, youtubeUrl,
            paymentMtnEnabled: String(mtnEnabled),
            paymentAirtelEnabled: String(airtelEnabled),
            paymentPaypalEnabled: String(paypalEnabled),
            paymentCodEnabled: String(codEnabled),
            notifyOrderConfirm: String(orderConfirmEmail),
            notifyOrderShipped: String(orderShippedEmail),
            notifyAppointmentReminder: String(appointmentReminder),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.error || 'Failed to save settings');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'fa-cog' },
    { id: 'social', label: 'Social Links', icon: 'fa-share-alt' },
    { id: 'hours', label: 'Opening Hours', icon: 'fa-clock' },
    { id: 'payments', label: 'Payments', icon: 'fa-credit-card' },
    { id: 'shipping', label: 'Shipping', icon: 'fa-truck' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
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
          className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50'}`}
        >
          {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : saved ? <><i className="fas fa-check"></i> Saved!</> : <><i className="fas fa-save"></i> Save All</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${activeTab === tab.id ? 'bg-pink-50 text-pink-600 border-l-4 border-pink-500' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
              >
                <i className={`fas ${tab.icon} w-5 text-center`}></i>
                <span className="text-sm font-medium">{tab.label}</span>
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
                    <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
                    <input type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Phone</label>
                    <input type="tel" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                    <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="+256703878485" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                      <option value="UGX">UGX - Ugandan Shilling</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold</label>
                    <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                  <textarea value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Social Media Links</h2>
              <p className="text-sm text-gray-500 mb-6">These links appear in the footer and contact pages.</p>
              <div className="space-y-4">
                {[
                  { icon: 'fa-facebook-f', bg: 'bg-blue-600', label: 'Facebook', value: facebookUrl, setter: setFacebookUrl, placeholder: 'https://facebook.com/chockysuganda' },
                  { icon: 'fa-instagram', bg: 'bg-gradient-to-br from-purple-600 to-pink-500', label: 'Instagram', value: instagramUrl, setter: setInstagramUrl, placeholder: 'https://instagram.com/chockysuganda' },
                  { icon: 'fa-twitter', bg: 'bg-sky-500', label: 'Twitter / X', value: twitterUrl, setter: setTwitterUrl, placeholder: 'https://twitter.com/chockysuganda' },
                  { icon: 'fa-tiktok', bg: 'bg-black', label: 'TikTok', value: tiktokUrl, setter: setTiktokUrl, placeholder: 'https://tiktok.com/@chockysuganda' },
                  { icon: 'fa-youtube', bg: 'bg-red-600', label: 'YouTube', value: youtubeUrl, setter: setYoutubeUrl, placeholder: 'https://youtube.com/@chockysuganda' },
                ].map((social) => (
                  <div key={social.label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 ${social.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <i className={`fab ${social.icon} text-white`}></i>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{social.label}</label>
                      <input type="url" value={social.value} onChange={(e) => social.setter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder={social.placeholder} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Opening Hours</h2>
              <p className="text-sm text-gray-500 mb-6">Set your store and salon operating hours.</p>
              <div className="space-y-3">
                {Object.entries(openingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <span className="w-28 text-sm font-medium text-gray-700 capitalize">{day}</span>
                    <input type="text" value={hours} onChange={(e) => setOpeningHours(prev => ({ ...prev, [day]: e.target.value }))} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="e.g., 9:00 AM - 7:00 PM" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h2>
              <div className="space-y-4">
                {[
                  { label: 'MTN Mobile Money', desc: 'Accept payments via MTN MoMo', checked: mtnEnabled, setter: setMtnEnabled, color: 'bg-yellow-400', text: 'MTN' },
                  { label: 'Airtel Money', desc: 'Accept payments via Airtel Money', checked: airtelEnabled, setter: setAirtelEnabled, color: 'bg-red-500', text: 'Airtel' },
                  { label: 'PayPal', desc: 'Accept international payments', checked: paypalEnabled, setter: setPaypalEnabled, color: 'bg-blue-700', icon: 'fa-paypal' },
                  { label: 'Cash on Delivery', desc: 'Accept cash payments on delivery', checked: codEnabled, setter: setCodEnabled, color: 'bg-green-600', icon: 'fa-money-bill-wave' },
                ].map((pm) => (
                  <div key={pm.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${pm.color} rounded-lg flex items-center justify-center`}>
                        {pm.icon ? <i className={`fas ${pm.icon} text-white`}></i> : <span className="font-bold text-xs text-white">{pm.text}</span>}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{pm.label}</h3>
                        <p className="text-sm text-gray-500">{pm.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={pm.checked} onChange={(e) => pm.setter(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Shipping Zones</h2>
                <button onClick={() => setShowAddZone(!showAddZone)} className="px-3 py-1.5 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600">{showAddZone ? 'Cancel' : '+ Add Zone'}</button>
              </div>
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
                    <input type="number" placeholder="Base fee" value={newZone.baseFee || ''} onChange={e => setNewZone({...newZone, baseFee: Number(e.target.value)})} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="number" placeholder="Per kg fee" value={newZone.perKgFee || ''} onChange={e => setNewZone({...newZone, perKgFee: Number(e.target.value)})} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="number" placeholder="Est. days" value={newZone.estimatedDays || ''} onChange={e => setNewZone({...newZone, estimatedDays: Number(e.target.value)})} className="px-3 py-2 border rounded-lg text-sm" />
                    <button onClick={handleAddZone} className="px-3 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600">Save</button>
                  </div>
                </div>
              )}
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
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Base Fee</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredZones.map(zone => (
                        <tr key={zone.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-900">{zone.name}</td>
                          <td className="px-3 py-2 text-gray-600">{zone.district}</td>
                          <td className="px-3 py-2"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{zone.region}</span></td>
                          <td className="px-3 py-2 text-right font-medium">{formatCurrency(zone.baseFee)}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${zone.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{zone.isActive ? 'Active' : 'Inactive'}</span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button onClick={() => handleDeleteZone(zone.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                          </td>
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
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={orderConfirmEmail} onChange={(e) => setOrderConfirmEmail(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Order Shipped Email</h3>
                    <p className="text-sm text-gray-500">Send email when order is shipped</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={orderShippedEmail} onChange={(e) => setOrderShippedEmail(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Appointment Reminders</h3>
                    <p className="text-sm text-gray-500">Send reminders 24 hours before appointment</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={appointmentReminder} onChange={(e) => setAppointmentReminder(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
