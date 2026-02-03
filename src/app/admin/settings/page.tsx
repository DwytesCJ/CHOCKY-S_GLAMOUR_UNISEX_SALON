'use client';

import { useState } from 'react';

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
  const [standardShippingRate, setStandardShippingRate] = useState(10000);
  const [expressShippingRate, setExpressShippingRate] = useState(25000);

  const [mtnEnabled, setMtnEnabled] = useState(true);
  const [airtelEnabled, setAirtelEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);

  const [orderConfirmEmail, setOrderConfirmEmail] = useState(true);
  const [orderShippedEmail, setOrderShippedEmail] = useState(true);
  const [appointmentReminder, setAppointmentReminder] = useState(true);

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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (UGX)</label>
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Orders above this amount qualify for free shipping</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Standard Shipping (UGX)</label>
                    <input
                      type="number"
                      value={standardShippingRate}
                      onChange={(e) => setStandardShippingRate(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">3-5 business days</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Express Shipping (UGX)</label>
                    <input
                      type="number"
                      value={expressShippingRate}
                      onChange={(e) => setExpressShippingRate(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">1-2 business days</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">Delivery Zones</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Kampala Central</p>
                        <p className="text-sm text-gray-500">Same-day delivery available</p>
                      </div>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Greater Kampala</p>
                        <p className="text-sm text-gray-500">Wakiso, Mukono, Entebbe</p>
                      </div>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Upcountry</p>
                        <p className="text-sm text-gray-500">Other regions in Uganda</p>
                      </div>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
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
