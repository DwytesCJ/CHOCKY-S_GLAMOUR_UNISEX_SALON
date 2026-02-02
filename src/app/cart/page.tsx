"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

  const shipping = totalPrice > 100000 ? 0 : 10000;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-shopping-bag text-4xl text-gray-300"></i>
            </div>
            <h1 className="font-heading text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added anything to your cart yet. 
              Start shopping to fill it up!
            </p>
            <Link href="/shop" className="btn btn-primary px-8">
              Start Shopping
            </Link>
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
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary">Home</Link>
            <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold mb-8">
          Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variant}`} className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Product */}
                      <div className="col-span-12 md:col-span-6">
                        <div className="flex gap-4">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/shop/${item.id}`} className="font-medium hover:text-primary line-clamp-2">
                              {item.name}
                            </Link>
                            {item.variant && (
                              <p className="text-sm text-gray-500 mt-1">Variant: {item.variant}</p>
                            )}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm text-red-500 hover:underline mt-2 md:hidden"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-4 md:col-span-2 text-center">
                        <span className="md:hidden text-sm text-gray-500">Price: </span>
                        <span className="font-medium">{formatPrice(item.price)}</span>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-4 md:col-span-2 flex justify-center">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                          >
                            <i className="fas fa-minus text-xs"></i>
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                          >
                            <i className="fas fa-plus text-xs"></i>
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-4 md:col-span-2 text-right">
                        <span className="md:hidden text-sm text-gray-500">Total: </span>
                        <span className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="hidden md:block text-sm text-gray-400 hover:text-red-500 mt-1"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6 flex justify-between items-center">
              <Link href="/shop" className="text-primary hover:underline">
                <i className="fas fa-arrow-left mr-2"></i>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
              <h2 className="font-heading text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500">
                    Add {formatPrice(100000 - totalPrice)} more for free shipping
                  </p>
                )}
              </div>

              {/* Promo Code */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">
                    Apply
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(grandTotal)}</span>
                </div>
                <Link href="/checkout" className="btn btn-primary w-full py-3">
                  Proceed to Checkout
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <i className="fas fa-lock"></i>
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="fas fa-shield-alt"></i>
                    <span>Protected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="fas fa-undo"></i>
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-4 flex justify-center gap-2">
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                  <i className="fab fa-cc-visa text-blue-600"></i>
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                  <i className="fab fa-cc-mastercard text-red-500"></i>
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-yellow-600">
                  MTN
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-red-600">
                  Airtel
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
