"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';

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

function mapPaymentMethod(method: string, provider?: string): string {
  switch (method) {
    case 'mobile_money':
      return provider === 'airtel' ? 'AIRTEL_MONEY' : 'MTN_MOBILE_MONEY';
    case 'card':
      return 'CREDIT_CARD';
    case 'cod':
      return 'CASH_ON_DELIVERY';
    default:
      return 'MTN_MOBILE_MONEY';
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { settings } = useSiteSettings();
  const { data: session, status: authStatus } = useSession();

  const [step, setStep] = useState(1);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [zoneSearch, setZoneSearch] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [freeShipThreshold, setFreeShipThreshold] = useState(100000);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    district: '',
    notes: '',
    deliveryMethod: 'delivery',
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
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    fetch('/api/shipping/zones')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.zones) setShippingZones(data.data.zones);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.freeShippingThreshold) {
          setFreeShipThreshold(parseInt(data.data.freeShippingThreshold));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (authStatus === 'authenticated' && session?.user && !sessionLoaded) {
      setFormData(prev => ({
        ...prev,
        email: session.user.email || prev.email,
        phone: (session.user as any).phone || prev.phone,
        firstName: (session.user as any).firstName || session.user.name?.split(' ')[0] || prev.firstName,
        lastName: (session.user as any).lastName || session.user.name?.split(' ').slice(1).join(' ') || prev.lastName,
      }));
      setStep(2);
      setSessionLoaded(true);
    } else if (authStatus === 'unauthenticated') {
      setSessionLoaded(true);
    }
  }, [authStatus, session, sessionLoaded]);

  const selectedZone = shippingZones.find(z => z.id === selectedZoneId);
  const isFreeShipping = totalPrice >= freeShipThreshold;
  const shipping = formData.deliveryMethod === 'pickup' ? 0 : isFreeShipping ? 0 : (selectedZone?.baseFee || 0);
  const grandTotal = Math.max(0, totalPrice + shipping - couponDiscount);

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
    setOrderError('');
    if (step === 2 && formData.deliveryMethod === 'delivery' && !selectedZoneId) return;
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsPlacingOrder(true);
      try {
        const mappedPaymentMethod = mapPaymentMethod(formData.paymentMethod, formData.mobileProvider);
        const orderData = {
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            variant: item.variant,
          })),
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            district: formData.district,
          },
          contactInfo: { email: formData.email, phone: formData.phone },
          deliveryMethod: formData.deliveryMethod,
          shippingZoneId: formData.deliveryMethod === 'delivery' ? selectedZoneId : null,
          shippingCost: shipping,
          subtotal: totalPrice,
          couponCode: couponApplied || undefined,
          couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
          total: grandTotal,
          paymentMethod: mappedPaymentMethod,
          mobileNumber: formData.paymentMethod === 'mobile_money' ? formData.mobileNumber : undefined,
          notes: formData.notes,
          isFreeShipping,
        };
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        const result = await res.json();
        if (result.success) {
          setOrderNumber(result.orderNumber || result.data?.orderNumber || '');
          setOrderComplete(true);
          clearCart();
        } else {
          setOrderError(result.error || 'Failed to place order. Please try again.');
        }
      } catch {
        setOrderError('Network error. Please check your connection and try again.');
      } finally {
        setIsPlacingOrder(false);
      }
    }
  };

  const steps = authStatus === 'authenticated' ? ['Delivery', 'Payment'] : ['Information', 'Delivery', 'Payment'];
  const stepOffset = authStatus === 'authenticated' ? 1 : 0;

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
            <Link href="/shop" className="btn btn-primary px-8">Start Shopping</Link>
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
            <p className="text-gray-600 mb-8">Order #{orderNumber} has been placed successfully.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account/orders" className="btn btn-outline">View Order</Link>
              <Link href="/shop" className="btn btn-primary">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
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
              {authStatus === 'authenticated' && (
                <span className="ml-2 text-green-600">
                  <i className="fas fa-check-circle mr-1"></i>Signed in
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            {steps.map((label, index) => {
              const actualStep = index + 1 + stepOffset;
              return (
                <div key={label} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step > actualStep ? 'bg-green-500 text-white' :
                    step === actualStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > actualStep ? <i className="fas fa-check text-xs"></i> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${step === actualStep ? 'text-primary font-medium' : 'text-gray-500'}`}>{label}</span>
                  {index < steps.length - 1 && <div className={`w-12 md:w-24 h-0.5 mx-4 ${step > actualStep ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
                </div>
              );
            })}
          </div>
        </div>

        {orderError && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <i className="fas fa-exclamation-circle text-red-400 mr-2"></i>
              <span className="text-red-700">{orderError}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              {step === 1 && authStatus !== 'authenticated' && (
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <h2 className="font-heading text-xl font-semibold mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" placeholder="+256 700 000 000" required />
                    </div>
                  </div>
                  <h2 className="font-heading text-xl font-semibold mt-8 mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Address *</label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" placeholder="Street address" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">District *</label>
                        <select name="district" value={formData.district} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" required>
                          <option value="">Select district</option>
                          {[...new Set(shippingZones.map(z => z.district))].sort().map(d => <option key={d} value={d}>{d}</option>)}
                          {shippingZones.length === 0 && <><option value="Kampala">Kampala</option><option value="Wakiso">Wakiso</option></>}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                      <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" rows={3} placeholder="Special instructions..."></textarea>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700">
                      <i className="fas fa-info-circle mr-2"></i>
                      Already have an account? <Link href="/account/login?callbackUrl=/checkout" className="font-medium underline">Sign in</Link> to speed up checkout.
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <h2 className="font-heading text-xl font-semibold mb-6">Delivery Method</h2>
                  {authStatus === 'authenticated' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">{formData.firstName} {formData.lastName} &middot; {formData.email}</p>
                    </div>
                  )}
                  <div className="flex gap-4 mb-6">
                    {[{ id: 'delivery', name: 'Delivery', icon: 'fa-truck' }, { id: 'pickup', name: 'Store Pickup', icon: 'fa-store' }].map((method) => (
                      <label key={method.id} className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer ${formData.deliveryMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                        <input type="radio" name="deliveryMethod" value={method.id} checked={formData.deliveryMethod === method.id} onChange={handleInputChange} className="w-4 h-4 accent-primary" />
                        <i className={`fas ${method.icon} text-gray-600`}></i>
                        <span className="font-medium">{method.name}</span>
                      </label>
                    ))}
                  </div>
                  {isFreeShipping && formData.deliveryMethod === 'delivery' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-700 font-medium"><i className="fas fa-gift mr-2"></i>You qualify for FREE shipping!</p>
                    </div>
                  )}
                  {formData.deliveryMethod === 'delivery' && (
                    <div>
                      <h3 className="font-medium mb-3">Select Destination</h3>
                      <input type="text" value={zoneSearch} onChange={e => setZoneSearch(e.target.value)} placeholder="Search town..." className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary mb-4" />
                      <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                        {Object.keys(groupedZones).length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">Loading zones...</div>
                        ) : (
                          Object.entries(groupedZones).sort(([a], [b]) => a.localeCompare(b)).map(([region, zones]) => (
                            <div key={region}>
                              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">{region} Region</div>
                              {zones.map(zone => (
                                <label key={zone.id} className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedZoneId === zone.id ? 'bg-primary/5' : ''}`}>
                                  <div className="flex items-center gap-3">
                                    <input type="radio" name="shippingZone" value={zone.id} checked={selectedZoneId === zone.id} onChange={() => setSelectedZoneId(zone.id)} className="w-4 h-4 accent-primary" />
                                    <div>
                                      <p className="text-sm font-medium">{zone.name}</p>
                                      <p className="text-xs text-gray-500">{zone.district} &middot; {zone.estimatedDays} days</p>
                                    </div>
                                  </div>
                                  <span className="text-sm font-semibold text-primary">{isFreeShipping ? 'FREE' : formatPrice(zone.baseFee)}</span>
                                </label>
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                      {formData.deliveryMethod === 'delivery' && !selectedZoneId && (
                        <p className="mt-3 text-sm text-amber-600"><i className="fas fa-exclamation-triangle mr-1"></i>Please select a destination</p>
                      )}
                    </div>
                  )}
                  {formData.deliveryMethod === 'pickup' && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium">Store Pickup - FREE</p>
                      <p className="text-sm text-gray-600 mt-1">Pick up at our store location. Ready in 24 hours.</p>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <h2 className="font-heading text-xl font-semibold mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    {[{ id: 'mobile_money', name: 'Mobile Money', icon: 'fa-mobile-alt' }, { id: 'card', name: 'Credit/Debit Card', icon: 'fa-credit-card' }, { id: 'cod', name: 'Cash on Delivery', icon: 'fa-money-bill-wave' }].map((method) => (
                      <label key={method.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer ${formData.paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                        <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleInputChange} className="w-4 h-4 accent-primary" />
                        <i className={`fas ${method.icon} text-xl text-gray-600`}></i>
                        <span className="font-medium">{method.name}</span>
                      </label>
                    ))}
                  </div>
                  {formData.paymentMethod === 'mobile_money' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Provider</label>
                        <select name="mobileProvider" value={formData.mobileProvider} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary">
                          <option value="mtn">MTN Mobile Money</option>
                          <option value="airtel">Airtel Money</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Mobile Number *</label>
                        <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" placeholder="0700 000 000" required />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                {step > (authStatus === 'authenticated' ? 2 : 1) && (
                  <button type="button" onClick={() => setStep(step - 1)} className="btn btn-outline">
                    <i className="fas fa-arrow-left mr-2"></i>Back
                  </button>
                )}
                {step <= (authStatus === 'authenticated' ? 2 : 1) && <div></div>}
                <button type="submit" disabled={isPlacingOrder || (step === 2 && formData.deliveryMethod === 'delivery' && !selectedZoneId)} className="btn btn-primary px-8">
                  {isPlacingOrder ? <><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</> : step === 3 ? 'Place Order' : 'Continue'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:w-96">
            <div className="bg-white rounded-xl p-6 shadow-soft sticky top-24">
              <h2 className="font-heading text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variant}`} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                      <p className="text-sm text-primary font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Discount ({couponApplied})</span><span>-{formatPrice(couponDiscount)}</span></div>
                )}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4">
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg mb-4">
                    <span className="text-sm font-medium text-green-700"><i className="fas fa-check-circle mr-1"></i>{couponApplied}</span>
                    <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 text-sm"><i className="fas fa-times"></i></button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }} placeholder="Coupon code" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary" />
                      <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50">
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
