"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

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

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [zoneSearch, setZoneSearch] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState({
    // Contact
    email: '',
    phone: '',
    // Shipping
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    district: '',
    notes: '',
    // Delivery
    deliveryMethod: 'delivery',
    // Payment
    paymentMethod: 'mobile_money',
    mobileProvider: 'mtn',
    mobileNumber: '',
  });
  const [orderComplete, setOrderComplete] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    fetch('/api/shipping/zones')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.zones) setShippingZones(data.data.zones);
      })
      .catch(() => {});
  }, []);

  const selectedZone = shippingZones.find(z => z.id === selectedZoneId);
  const shipping = formData.deliveryMethod === 'pickup' ? 0 : (selectedZone?.baseFee || 0);
  const grandTotal = totalPrice + shipping - couponDiscount;

  const groupedZones = useMemo(() => {
    const filtered = shippingZones.filter(z =>
      z.name.toLowerCase().includes(zoneSearch.toLowerCase()) ||
      z.district.toLowerCase().includes(zoneSearch.toLowerCase())
    );
    return filtered.reduce((acc, zone) => {
      if (!acc[zone.region]) acc[zone.region] = [];
      acc[zone.region].push(zone);
      return acc;
    }, {} as Record<string, ShippingZone[]>);
  }, [shippingZones, zoneSearch]);

  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: totalPrice }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponDiscount(data.data.discount);
        setCouponApplied(data.data.code);
      } else {
        setCouponError(data.error || 'Invalid coupon');
        setCouponDiscount(0);
        setCouponApplied('');
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied('');
    setCouponError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2 && formData.deliveryMethod === 'delivery' && !selectedZoneId) {
      return; // Don't proceed without selecting a shipping zone
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Process order
      setIsPlacingOrder(true);
      try {
        const orderData = {
          items: items.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price, variant: item.variant })),
          shippingAddress: { firstName: formData.firstName, lastName: formData.lastName, address: formData.address, city: formData.city, district: formData.district },
          contactInfo: { email: formData.email, phone: formData.phone },
          deliveryMethod: formData.deliveryMethod,
          shippingZoneId: formData.deliveryMethod === 'delivery' ? selectedZoneId : null,
          shippingCost: shipping,
          subtotal: totalPrice,
          total: grandTotal,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        };
        const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
        const result = await res.json();
        setOrderNumber(result.orderNumber || `CHK-${Date.now().toString().slice(-8)}`);
      } catch {
        setOrderNumber(`CHK-${Date.now().toString().slice(-8)}`);
      } finally {
        setIsPlacingOrder(false);
      }
      setOrderComplete(true);
      clearCart();
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-shopping-bag text-4xl text-gray-300"></i>
            </div>
            <h1 className="font-heading text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
            <Link href="/shop" className="btn btn-primary px-8">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check text-4xl text-green-500"></i>
            </div>
            <h1 className="font-heading text-3xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-2">Thank you for your order.</p>
            <p className="text-gray-600 mb-8">
              Order #{orderNumber} has been placed successfully.
              We&apos;ve sent a confirmation to your email and phone.
            </p>
            <div className="bg-white rounded-xl p-6 shadow-soft mb-8 text-left">
              <h3 className="font-semibold mb-4">What&apos;s Next?</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <i className="fas fa-envelope text-primary mt-1"></i>
                  <span>You&apos;ll receive an email confirmation shortly</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-sms text-primary mt-1"></i>
                  <span>SMS updates will be sent to your phone</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-truck text-primary mt-1"></i>
                  <span>Your order will be delivered within 2-5 business days</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account/orders" className="btn btn-outline">
                View Order
              </Link>
              <Link href="/shop" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-rose-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold">C</span>
              </div>
              <span className="font-heading font-bold">CHOCKY&apos;S</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <i className="fas fa-lock"></i>
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            {['Information', 'Delivery', 'Payment'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-primary text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > index + 1 ? <i className="fas fa-check text-xs"></i> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${step === index + 1 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  {label}
                </span>
                {index < 2 && (
                  <div className={`w-12 md:w-24 h-0.5 mx-4 ${step > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Information */}
              {step === 1 && (
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <h2 className="font-heading text-xl font-semibold mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        placeholder="+256 700 000 000"
                        required
                      />
                    </div>
                  </div>

                  <h2 className="font-heading text-xl font-semibold mt-8 mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        placeholder="Street address, building, apartment"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">District *</label>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                          required
                        >
                          <option value="">Select district</option>
                          {[...new Set(shippingZones.map(z => z.district))].sort().map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                          {shippingZones.length === 0 && (
                            <>
                              <option value="Kampala">Kampala</option>
                              <option value="Wakiso">Wakiso</option>
                              <option value="Mukono">Mukono</option>
                              <option value="Jinja">Jinja</option>
                              <option value="Entebbe">Entebbe</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        rows={3}
                        placeholder="Special instructions for delivery..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Delivery */}
              {step === 2 && (
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <h2 className="font-heading text-xl font-semibold mb-6">Delivery Method</h2>
                  
                  {/* Delivery vs Pickup Toggle */}
                  <div className="flex gap-4 mb-6">
                    {[
                      { id: 'delivery', name: 'Delivery', icon: 'fa-truck', desc: 'Ship to your location' },
                      { id: 'pickup', name: 'Store Pickup', icon: 'fa-store', desc: 'FREE - Pick up at our store' },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          formData.deliveryMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={method.id}
                          checked={formData.deliveryMethod === method.id}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-primary"
                        />
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <i className={`fas ${method.icon} text-gray-600`}></i>
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-xs text-gray-500">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Shipping Zone Selection */}
                  {formData.deliveryMethod === 'delivery' && (
                    <div>
                      <h3 className="font-medium mb-3">Select Destination Town Center</h3>
                      <div className="relative mb-4">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                          type="text"
                          value={zoneSearch}
                          onChange={e => setZoneSearch(e.target.value)}
                          placeholder="Search town or district..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        />
                      </div>
                      
                      <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                        {Object.keys(groupedZones).length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            {shippingZones.length === 0 ? 'Loading shipping zones...' : 'No towns found matching your search'}
                          </div>
                        ) : (
                          Object.entries(groupedZones).sort(([a], [b]) => a.localeCompare(b)).map(([region, zones]) => (
                            <div key={region}>
                              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0">
                                {region} Region
                              </div>
                              {zones.map(zone => (
                                <label
                                  key={zone.id}
                                  className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    selectedZoneId === zone.id ? 'bg-primary/5' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name="shippingZone"
                                      value={zone.id}
                                      checked={selectedZoneId === zone.id}
                                      onChange={() => setSelectedZoneId(zone.id)}
                                      className="w-4 h-4 accent-primary"
                                    />
                                    <div>
                                      <p className="text-sm font-medium">{zone.name}</p>
                                      <p className="text-xs text-gray-500">{zone.district} &middot; ~{zone.distanceKm}km &middot; {zone.estimatedDays}</p>
                                    </div>
                                  </div>
                                  <span className="text-sm font-semibold text-primary">{formatPrice(zone.baseFee)}</span>
                                </label>
                              ))}
                            </div>
                          ))
                        )}
                      </div>

                      {selectedZone && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                            <div className="text-sm">
                              <p className="font-medium text-blue-800">Delivery to {selectedZone.name}</p>
                              <p className="text-blue-600">Estimated: {selectedZone.estimatedDays} &middot; Shipping: {formatPrice(selectedZone.baseFee)}</p>
                              <p className="text-blue-500 mt-1">Our admin will confirm the exact drop-off point with the delivery service.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.deliveryMethod === 'delivery' && !selectedZoneId && (
                        <p className="mt-3 text-sm text-amber-600"><i className="fas fa-exclamation-triangle mr-1"></i> Please select a destination to continue</p>
                      )}
                    </div>
                  )}

                  {formData.deliveryMethod === 'pickup' && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-medium mb-2">Pickup Location</h3>
                      <p className="text-sm text-gray-600">
                        CHOCKY&apos;S Ultimate Glamour<br />
                        Wandegeya, Kampala<br />
                        Open: Mon-Sat 9AM-7PM, Sun 10AM-5PM
                      </p>
                      <p className="text-sm text-green-600 mt-2 font-medium">
                        <i className="fas fa-check-circle mr-1"></i> FREE - No shipping charges
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <h2 className="font-heading text-xl font-semibold mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    {[
                      { id: 'mobile_money', name: 'Mobile Money', icon: 'fa-mobile-alt', desc: 'MTN MoMo or Airtel Money' },
                      { id: 'card', name: 'Credit/Debit Card', icon: 'fa-credit-card', desc: 'Visa, Mastercard' },
                      { id: 'cod', name: 'Cash on Delivery', icon: 'fa-money-bill-wave', desc: 'Pay when you receive' },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          formData.paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-primary"
                        />
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <i className={`fas ${method.icon} text-gray-600`}></i>
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {formData.paymentMethod === 'mobile_money' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Select Provider</label>
                        <div className="flex gap-4">
                          {[
                            { id: 'mtn', name: 'MTN MoMo', color: 'bg-yellow-400' },
                            { id: 'airtel', name: 'Airtel Money', color: 'bg-red-500' },
                          ].map((provider) => (
                            <label
                              key={provider.id}
                              className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${
                                formData.mobileProvider === provider.id ? 'border-primary' : 'border-gray-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name="mobileProvider"
                                value={provider.id}
                                checked={formData.mobileProvider === provider.id}
                                onChange={handleInputChange}
                                className="sr-only"
                              />
                              <div className={`w-6 h-6 ${provider.color} rounded`}></div>
                              <span className="font-medium text-sm">{provider.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Mobile Number *</label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                          placeholder="07XX XXX XXX"
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        <i className="fas fa-info-circle mr-1"></i>
                        You will receive a prompt on your phone to confirm the payment.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="btn btn-outline"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back
                  </button>
                ) : (
                  <Link href="/cart" className="btn btn-outline">
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Cart
                  </Link>
                )}
                <button type="submit" className="btn btn-primary" disabled={isPlacingOrder}>
                  {step === 3 ? (isPlacingOrder ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Placing Order...</>) : 'Place Order') : 'Continue'}
                  {step < 3 && <i className="fas fa-arrow-right ml-2"></i>}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
              <h2 className="font-heading text-lg font-semibold mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variant}`} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                      <p className="text-sm text-primary font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({couponApplied})</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Coupon Code */}
              <div className="border-t border-gray-100 mt-4 pt-4">
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-green-700"><i className="fas fa-check-circle mr-1"></i>{couponApplied}</span>
                      <span className="text-sm text-green-600 ml-2">-{formatPrice(couponDiscount)}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 text-sm">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                        placeholder="Coupon code"
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
                      >
                        {couponLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
