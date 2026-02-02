"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

// Format price in UGX
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(price);
};

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, isOpen, closeCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-glamour-lg z-[101] animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-heading text-xl font-semibold">
            Shopping Bag ({items.length})
          </h2>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center hover:bg-cream-100 rounded-full transition-colors"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shopping-bag text-3xl text-gray-400"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Your bag is empty</h3>
              <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
              <button
                onClick={closeCart}
                className="btn btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-cream-50 rounded-xl">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-dark-900 truncate">{item.name}</h4>
                    {item.variant && (
                      <p className="text-sm text-gray-500">{item.variant}</p>
                    )}
                    <p className="font-semibold text-primary-500 mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-cream-100 transition-colors"
                        >
                          <i className="fas fa-minus text-xs"></i>
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-cream-100 transition-colors"
                        >
                          <i className="fas fa-plus text-xs"></i>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-heading text-xl font-bold text-primary-500">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Shipping and taxes calculated at checkout
            </p>
            <div className="space-y-3">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn btn-primary w-full py-3"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn btn-outline w-full py-3"
              >
                View Cart
              </Link>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
              <i className="fas fa-lock"></i>
              <span>Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
