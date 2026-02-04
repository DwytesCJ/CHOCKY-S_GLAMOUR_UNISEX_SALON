'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Address {
  id: string;
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
  type: 'SHIPPING' | 'BILLING';
}

export default function AccountAddresses() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchAddresses() {
      if (status !== 'authenticated') return;
      
      try {
        const res = await fetch('/api/account/addresses');
        const data = await res.json();
        
        if (data.success) {
          setAddresses(data.data);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAddresses();
  }, [status]);

  const setDefaultAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${addressId}/default`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        setAddresses(addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        })));
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const res = await fetch(`/api/account/addresses/${addressId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
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
          <h1 className="font-heading text-2xl md:text-3xl font-bold">My Addresses</h1>
          <p className="text-gray-300 mt-2">Manage your shipping and billing addresses</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Add New Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-500 mb-6">Add your first address to make checkout faster!</p>
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      address.type === 'SHIPPING' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {address.type}
                    </span>
                    {address.isDefault && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                  {!address.isDefault && (
                    <button 
                      onClick={() => setDefaultAddress(address.id)}
                      className="text-sm text-primary hover:text-primary-dark"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {address.firstName} {address.lastName}
                  </h3>
                  <p className="text-gray-600">{address.phone}</p>
                </div>
                
                <div className="text-gray-700 space-y-1 mb-6">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>{address.city}, {address.district}</p>
                  <p>{address.country} {address.postalCode}</p>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button 
                      onClick={() => deleteAddress(address.id)}
                      className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}