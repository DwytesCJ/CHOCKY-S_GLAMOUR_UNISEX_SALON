"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface SalonService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category?: { id: string; name: string };
  categoryId?: string;
  description?: string;
}

interface Stylist {
  id: string;
  name: string;
  specialty: string;
  image: string;
  bio?: string;
}

// Fallback data if API fails
const fallbackServices: SalonService[] = [
  { id: 'fb1', name: 'Hair Styling', price: 50000, duration: 60, category: { id: 'c1', name: 'Hair' } },
  { id: 'fb2', name: 'Hair Coloring', price: 150000, duration: 150, category: { id: 'c1', name: 'Hair' } },
  { id: 'fb3', name: 'Wig Installation', price: 80000, duration: 90, category: { id: 'c1', name: 'Hair' } },
  { id: 'fb4', name: 'Braiding & Plaiting', price: 100000, duration: 240, category: { id: 'c1', name: 'Hair' } },
  { id: 'fb5', name: 'Hair Treatment', price: 70000, duration: 60, category: { id: 'c1', name: 'Hair' } },
  { id: 'fb6', name: 'Bridal Makeup', price: 250000, duration: 120, category: { id: 'c2', name: 'Makeup' } },
  { id: 'fb7', name: 'Event Makeup', price: 100000, duration: 60, category: { id: 'c2', name: 'Makeup' } },
  { id: 'fb8', name: 'Photoshoot Makeup', price: 150000, duration: 90, category: { id: 'c2', name: 'Makeup' } },
  { id: 'fb9', name: 'Classic Facial', price: 80000, duration: 60, category: { id: 'c3', name: 'Skin' } },
  { id: 'fb10', name: 'Anti-Aging Facial', price: 120000, duration: 90, category: { id: 'c3', name: 'Skin' } },
];

const fallbackStylists: Stylist[] = [
  { id: 'fs1', name: 'Grace Nakamya', specialty: 'Hair', image: '/uploads/team/SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg' },
  { id: 'fs2', name: 'Sarah Achieng', specialty: 'Makeup', image: '/uploads/team/SnapInsta.to_624543554_18078416900580404_729626818934809874_n.jpg' },
  { id: 'fs3', name: 'Amina Hassan', specialty: 'Skin', image: '/uploads/team/SnapInsta.to_625048011_18078416870580404_5424531763907010008_n.jpg' },
  { id: 'fs4', name: 'Joy Namubiru', specialty: 'Hair', image: '/uploads/team/SnapInsta.to_625048531_18078416903580404_2925058900756321713_n.jpg' },
];

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
];

function convertTimeTo24(time12: string): string {
  const [time, modifier] = time12.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get('service');
  const { data: session, status: authStatus } = useSession();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<SalonService[]>(fallbackServices);
  const [stylistsList, setStylistsList] = useState<Stylist[]>(fallbackStylists);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [appointmentNumber, setAppointmentNumber] = useState('');
  const [loadingServices, setLoadingServices] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<{start: string; end: string}[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch services from API
  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, stylistsRes] = await Promise.all([
          fetch('/api/salon/services'),
          fetch('/api/stylists'),
        ]);
        const servicesData = await servicesRes.json();
        const stylistsData = await stylistsRes.json();

          if (servicesData.success && servicesData.data?.length > 0) {
          const mapped = servicesData.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            price: Number(s.price),
            duration: s.duration,
            category: s.category || { id: '', name: '' },
            description: s.description,
          }));
          setServices(mapped);
          if (preselectedService) {
            const match = mapped.find((s: SalonService) => s.name === preselectedService);
            if (match) setSelectedServices([match.id]);
          }
        } else if (preselectedService) {
          const match = fallbackServices.find(s => s.name === preselectedService);
          if (match) setSelectedServices([match.id]);
        }

        if (stylistsData.success && stylistsData.data?.length > 0) {
          setStylistsList(stylistsData.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            specialty: s.specialty || s.specialization || '',
            image: s.image || s.avatar || '/images/placeholder.jpg',
            bio: s.bio,
          })));
        }
      } catch {
        // Use fallback data
        if (preselectedService) {
          const match = fallbackServices.find(s => s.name === preselectedService);
          if (match) setSelectedServices([match.id]);
        }
      } finally {
        setLoadingServices(false);
      }
    }
    fetchData();
  }, [preselectedService]);

  // Auto-fill form data from session when user is logged in
  useEffect(() => {
    if (authStatus === 'authenticated' && session?.user) {
      const user = session.user as any;
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || user.name?.split(' ')[0] || prev.firstName,
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [authStatus, session]);

  const formatPrice = (price: number) => `UGX ${Number(price).toLocaleString()}`;
  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;
  };

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
  const selectedServicesData = services.filter(s => selectedServices.includes(s.id));
  const selectedServiceData = selectedServicesData[0]; // primary service for compatibility
  const selectedStylistData = stylistsList.find(s => s.id === selectedStylist);
  const totalPrice = selectedServicesData.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServicesData.reduce((sum, s) => sum + s.duration, 0);
  const categoryName = selectedServicesData.map(s => s.category?.name).filter(Boolean)[0] || '';

  // Show category-matched stylists first, but always show all if none match
  const categoryMatched = categoryName
    ? stylistsList.filter(s => s.specialty.toLowerCase().includes(categoryName.toLowerCase()) || s.specialty.toLowerCase() === 'all')
    : [];
  const filteredStylists = categoryMatched.length > 0 ? categoryMatched : stylistsList;

  // Fetch booked slots when date or stylist changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    const params = new URLSearchParams({ date: selectedDate });
    if (selectedStylist && selectedStylist !== 'none') params.set('stylistId', selectedStylist);
    fetch(`/api/appointments/availability?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setBookedSlots(data.data?.bookedSlots || []);
      })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedStylist]);

  // Check if a time slot is booked (uses total duration of all selected services)
  const isSlotBooked = (time12: string): boolean => {
    if (bookedSlots.length === 0 || selectedServices.length === 0) return false;
    const t24 = convertTimeTo24(time12);
    const duration = totalDuration || 60;
    const [h, m] = t24.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, h, m + duration);
    const slotEnd = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    return bookedSlots.some(b => t24 < b.end && slotEnd > b.start);
  };

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const time24 = convertTimeTo24(selectedTime);
      const payload: any = {
        serviceId: selectedServices[0], // primary service
        serviceIds: selectedServices, // all selected services
        date: selectedDate,
        appointmentTime: time24,
        notes: formData.notes,
        contactName: `${formData.firstName} ${formData.lastName}`,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        totalDuration,
        totalAmount: totalPrice,
      };
      if (selectedStylist && selectedStylist !== 'none') {
        payload.stylistId = selectedStylist;
      }

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setAppointmentNumber(data.data?.appointmentNumber || '');
        setStep(5);
      } else {
        setSubmitError(data.error || 'Failed to book appointment. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedServices.length > 0;
      case 2: return selectedStylist !== null;
      case 3: return selectedDate !== '' && selectedTime !== '';
      case 4: return formData.firstName && formData.lastName && formData.email && formData.phone;
      default: return false;
    }
  };

  const isLoggedIn = authStatus === 'authenticated';

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
          {isLoggedIn && (
            <p className="text-gray-300 mt-2">
              <i className="fas fa-check-circle text-green-400 mr-2"></i>
              Signed in as {session?.user?.name || session?.user?.email}
            </p>
          )}
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
              {loadingServices ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedServices.includes(service.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedServices.includes(service.id) ? 'bg-primary border-primary' : 'border-gray-300'
                          }`}>
                            {selectedServices.includes(service.id) && <i className="fas fa-check text-white text-xs"></i>}
                          </div>
                          <div>
                            <h3 className="font-medium">{service.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              <i className="far fa-clock mr-1"></i>
                              {formatDuration(service.duration)}
                            </p>
                            {service.category?.name && (
                              <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {service.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-primary font-semibold">{formatPrice(service.price)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedServices.length > 0 && (
                <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected</span>
                    <span className="font-semibold text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total duration: {formatDuration(totalDuration)}</p>
                </div>
              )}
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
                        sizes="80px"
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
                onClick={() => setSelectedStylist('none')}
                className={`mt-4 w-full p-4 rounded-xl border-2 text-center transition-all ${
                  selectedStylist === 'none'
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

              {selectedDate && (
                <div>
                  <h3 className="font-medium mb-4">Choose a Time</h3>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-gray-500">Checking availability...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {timeSlots.map((time) => {
                        const booked = isSlotBooked(time);
                        return (
                          <button
                            key={time}
                            onClick={() => !booked && setSelectedTime(time)}
                            disabled={booked}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              booked
                                ? 'border-red-200 bg-red-50 text-red-300 cursor-not-allowed line-through'
                                : selectedTime === time
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-gray-200 hover:border-gray-300'
                            }`}
                            title={booked ? 'This slot is already booked' : ''}
                          >
                            {time}
                            {booked && <span className="block text-[10px] no-underline">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Personal Details - Auto-filled if logged in */}
          {step === 4 && (
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="font-heading text-xl font-semibold mb-6">Your Details</h2>
              
              {isLoggedIn && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <i className="fas fa-check-circle"></i>
                    <span className="font-medium">Signed in as {session?.user?.name || session?.user?.email}</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">Your details have been auto-filled from your account.</p>
                </div>
              )}

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

              {submitError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>{submitError}
                </div>
              )}

              {!isLoggedIn && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">
                    <i className="fas fa-info-circle mr-2"></i>
                    <Link href="/account/login" className="font-medium underline">Sign in</Link> to auto-fill your details and view your appointments later.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div className="bg-white rounded-xl p-8 shadow-soft text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-4xl text-green-500"></i>
              </div>
              <h2 className="font-heading text-2xl font-bold mb-2">Booking Confirmed!</h2>
              {appointmentNumber && (
                <p className="text-lg font-medium text-primary mb-2">
                  Appointment #{appointmentNumber}
                </p>
              )}
              <p className="text-gray-600 mb-6">
                Your appointment has been successfully booked. We&apos;ve sent a confirmation to your email and phone.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-6 text-left mb-6">
                <h3 className="font-semibold mb-4">Appointment Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service{selectedServicesData.length > 1 ? 's' : ''}:</span>
                    <span className="font-medium text-right">{selectedServicesData.map(s => s.name).join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stylist:</span>
                    <span className="font-medium">{selectedStylistData?.name || 'First Available'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{formatDuration(totalDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer:</span>
                    <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/salon" className="btn btn-outline">
                  Back to Salon
                </Link>
                <Link href="/account" className="btn btn-primary">
                  <i className="fas fa-calendar-check mr-2"></i>
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
                onClick={() => {
                  if (step === 4) {
                    handleSubmit();
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={!canProceed() || isSubmitting}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Booking...
                  </>
                ) : (
                  <>
                    {step === 4 ? 'Confirm Booking' : 'Continue'}
                    <i className="fas fa-arrow-right ml-2"></i>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Booking Summary Sidebar */}
          {step < 5 && selectedServices.length > 0 && (
            <div className="mt-8 bg-white rounded-xl p-6 shadow-soft">
              <h3 className="font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                {selectedServicesData.map(s => (
                  <div key={s.id} className="flex justify-between">
                    <span className="text-gray-500">{s.name}</span>
                    <span className="font-medium">{formatPrice(s.price)}</span>
                  </div>
                ))}
                {selectedStylist && selectedStylist !== 'none' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stylist:</span>
                    <span className="font-medium">{selectedStylistData?.name || 'First Available'}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Duration:</span>
                  <span className="font-medium">{formatDuration(totalDuration)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-primary">{formatPrice(totalPrice)}</span>
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
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <BookingContent />
    </Suspense>
  );
}
