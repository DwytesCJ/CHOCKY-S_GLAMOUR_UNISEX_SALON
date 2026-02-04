'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PaymentMethod {
  id: string;
  type: 'CARD' | 'MOBILE_MONEY' | 'PAYPAL';
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
  provider?: string;
  phoneNumber?: string;
  email?: string;
  isDefault: boolean;
  createdAt: string;
}

export default function AccountPayments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchPaymentMethods() {
      if (status !== 'authenticated') return;
      
      try {
        const res = await fetch('/api/account/payment-methods');
        const data = await res.json();
        
        if (data.success) {
          setPaymentMethods(data.data);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentMethods();
  }, [status]);

  const setDefaultPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/account/payment-methods/${paymentId}/default`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        setPaymentMethods(paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === paymentId
        })));
      }
    } catch (error) {
      console.error('Error setting default payment:', error);
    }
  };

  const deletePaymentMethod = async (paymentId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    
    try {
      const res = await fetch(`/api/account/payment-methods/${paymentId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setPaymentMethods(paymentMethods.filter(method => method.id !== paymentId));
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'CARD':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'MOBILE_MONEY':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'PAYPAL':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatExpiry = (month?: string, year?: string) => {
    if (!month || !year) return '';
    return `${month}/${year.slice(-2)}`;
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Payment Methods</h1>
          <p className="text-gray-300 mt-2">Manage your saved payment methods</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{paymentMethods.length} saved payment method{paymentMethods.length !== 1 ? 's' : ''}</p>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Add Payment Method
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No payment methods saved</h3>
            <p className="text-gray-500 mb-6">Add a payment method for faster checkout!</p>
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getPaymentIcon(method.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {method.type === 'CARD' && `**** **** **** ${method.last4}`}
                          {method.type === 'MOBILE_MONEY' && `${method.provider} - ${method.phoneNumber}`}
                          {method.type === 'PAYPAL' && method.email}
                        </h3>
                        {method.isDefault && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </div>
                      {method.type === 'CARD' && (
                        <p className="text-gray-500 text-sm">
                          Expires {formatExpiry(method.expiryMonth, method.expiryYear)}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm">
                        Added {new Date(method.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <button 
                        onClick={() => setDefaultPayment(method.id)}
                        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button 
                      onClick={() => deletePaymentMethod(method.id)}
                      className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Secure Payment Methods</h4>
              <p className="text-blue-700 text-sm">
                Your payment information is securely stored and encrypted. We never store full card numbers on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}