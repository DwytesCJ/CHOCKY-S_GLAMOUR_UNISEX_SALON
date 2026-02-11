"use client";

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const services = [
  { id: 1, name: 'Hair Styling', price: 50000, duration: 60, category: 'Hair' },
  { id: 2, name: 'Hair Coloring', price: 150000, duration: 150, category: 'Hair' },
  { id: 3, name: 'Wig Installation', price: 80000, duration: 90, category: 'Hair' },
  { id: 4, name: 'Braiding & Plaiting', price: 100000, duration: 240, category: 'Hair' },
  { id: 5, name: 'Hair Treatment', price: 70000, duration: 60, category: 'Hair' },
  { id: 6, name: 'Bridal Makeup', price: 250000, duration: 120, category: 'Makeup' },
  { id: 7, name: 'Event Makeup', price: 100000, duration: 60, category: 'Makeup' },
  { id: 8, name: 'Photoshoot Makeup', price: 150000, duration: 90, category: 'Makeup' },
  { id: 9, name: 'Classic Facial', price: 80000, duration: 60, category: 'Skin' },
  { id: 10, name: 'Anti-Aging Facial', price: 120000, duration: 90, category: 'Skin' },
];

const stylists = [
  { id: 1, name: 'Grace Nakamya', specialty: 'Hair', image: '/uploads/team/SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg' },
  { id: 2, name: 'Sarah Achieng', specialty: 'Makeup', image: '/uploads/team/SnapInsta.to_624543554_18078416900580404_729626818934809874_n.jpg' },
  { id: 3, name: 'Amina Hassan', specialty: 'Skin', image: '/uploads/team/SnapInsta.to_625048011_18078416870580404_5424531763907010008_n.jpg' },
  { id: 4, name: 'Joy Namubiru', specialty: 'Hair', image: '/uploads/team/SnapInsta.to_625048531_18078416903580404_2925058900756321713_n.jpg' },
];

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
];

function BookingContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get('service');

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(
    preselectedService ? services.find(s => s.name === preselectedService)?.id || null : null
  );
  const [selectedStylist, setSelectedStylist] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });

  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;
  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;
  };

  // Generate next 14 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedStylistData = stylists.find(s => s.id === selectedStylist);

  const filteredStylists = selectedServiceData
    ? stylists.filter(s => s.specialty === selectedServiceData.category || s.specialty === 'All')
    : stylists;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, submit to API
    setStep(5); // Show confirmation
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedService !== null;
      case 2: return selectedStylist !== null;
      case 3: return selectedDate !== '' && selectedTime !== '';
      case 4: return formData.firstName && formData.lastName && formData.email && formData.phone;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-gray-400 hover:text-white">Home</Link>
            <i className="fas fa-chevron-right text-gray-600 text-xs"></i>
            <Link href="/salon" className="text-gray-400 hover:text-white">Salon</Link>
            <i className="fas fa-chevron-right text-gray-600 text-xs"></i>
            <span>Book Appointment</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Book Your Appointment</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {['Service', 'Stylist', 'Date & Time', 'Details', 'Confirm'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-medium ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-primary text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > index + 1 ? <i className="fas fa-check"></i> : index + 1}
                </div>
                {index < 4 && (
                  <div className={`hidden sm:block w-16 md:w-24 h-1 mx-2 ${
                    step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm">
            {['Service', 'Stylist', 'Date & Time', 'Details', 'Confirm'].map((label, index) => (
              <span key={label} className={`${step === index + 1 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="font-heading text-xl font-semibold mb-6">Select a Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedService === service.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          <i className="far fa-clock mr-1"></i>
                          {formatDuration(service.duration)}
                        </p>
                      </div>
                      <span className="text-primary font-semibold">{formatPrice(service.price)}</span>
                    </div>
                    {selectedService === service.id && (
                      <div className="mt-2 text-primary text-sm">
                        <i className="fas fa-check-circle mr-1"></i> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Stylist */}
          {step === 2 && (
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="font-heading text-xl font-semibold mb-6">Choose Your Stylist</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredStylists.map((stylist) => (
                  <button
                    key={stylist.id}
                    onClick={() => setSelectedStylist(stylist.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedStylist === stylist.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden">
                      <Image
                        src={stylist.image}
                        alt={stylist.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-sm">{stylist.name}</h3>
                    <p className="text-xs text-gray-500">{stylist.specialty} Specialist</p>
                    {selectedStylist === stylist.id && (
                      <div className="mt-2 text-primary text-xs">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedStylist(0)}
                className={`mt-4 w-full p-4 rounded-xl border-2 text-center transition-all ${
                  selectedStylist === 0
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-random mr-2"></i>
                No Preference (First Available)
              </button>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="font-heading text-xl font-semibold mb-6">Select Date & Time</h2>
              
              {/* Date Selection */}
              <div className="mb-8">
                <h3 className="font-medium mb-4">Choose a Date</h3>
                <div className="flex gap-3 overflow-x-auto pb-4">
                  {availableDates.map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = date.getDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex-shrink-0 w-20 p-3 rounded-xl border-2 text-center transition-all ${
                          selectedDate === dateStr
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xs opacity-75">{dayName}</div>
                        <div className="text-2xl font-bold">{dayNum}</div>
                        <div className="text-xs">{month}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 className="font-medium mb-4">Choose a Time</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedTime === time
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Personal Details */}
          {step === 4 && (
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="font-heading text-xl font-semibold mb-6">Your Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="+256 700 000 000"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Special Requests (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    rows={3}
                    placeholder="Any special requests or notes for your appointment..."
                  ></textarea>
                </div>
              </form>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div className="bg-white rounded-xl p-8 shadow-soft text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-4xl text-green-500"></i>
              </div>
              <h2 className="font-heading text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Your appointment has been successfully booked. We&apos;ve sent a confirmation to your email and phone.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-6 text-left mb-6">
                <h3 className="font-semibold mb-4">Appointment Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service:</span>
                    <span className="font-medium">{selectedServiceData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stylist:</span>
                    <span className="font-medium">{selectedStylistData?.name || 'First Available'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-primary">{formatPrice(selectedServiceData?.price || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/salon" className="btn btn-outline">
                  Back to Salon
                </Link>
                <Link href="/account/appointments" className="btn btn-primary">
                  View My Appointments
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </button>
              <button
                onClick={() => step === 4 ? handleSubmit(new Event('submit') as unknown as React.FormEvent) : setStep(step + 1)}
                disabled={!canProceed()}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 4 ? 'Confirm Booking' : 'Continue'}
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          )}

          {/* Booking Summary Sidebar */}
          {step < 5 && selectedService && (
            <div className="mt-8 bg-white rounded-xl p-6 shadow-soft">
              <h3 className="font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Service:</span>
                  <span className="font-medium">{selectedServiceData?.name}</span>
                </div>
                {selectedStylist !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stylist:</span>
                    <span className="font-medium">{selectedStylistData?.name || 'First Available'}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{formatDuration(selectedServiceData?.duration || 0)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-primary">{formatPrice(selectedServiceData?.price || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
