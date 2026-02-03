'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Appointment {
  id: string;
  appointmentNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  service: {
    name: string;
    category: string;
    duration: number;
    price: number;
  };
  stylist: {
    name: string;
    image: string;
  } | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  depositPaid: boolean;
  totalAmount: number;
  createdAt: string;
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Simulated data - replace with actual API calls
    const fetchAppointments = async () => {
      try {
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            appointmentNumber: 'APT-2024-001',
            customer: {
              name: 'Mary Tendo',
              email: 'mary@example.com',
              phone: '+256701234567',
            },
            service: {
              name: 'Bridal Makeup',
              category: 'Makeup',
              duration: 120,
              price: 350000,
            },
            stylist: {
              name: 'Grace Nakimera',
              image: '/images/team/stylist-1.jpg',
            },
            date: '2024-01-16',
            startTime: '09:00',
            endTime: '11:00',
            status: 'CONFIRMED',
            notes: 'Bride wants natural glam look',
            depositPaid: true,
            totalAmount: 350000,
            createdAt: '2024-01-10T14:30:00Z',
          },
          {
            id: '2',
            appointmentNumber: 'APT-2024-002',
            customer: {
              name: 'Agnes Namutebi',
              email: 'agnes@example.com',
              phone: '+256702345678',
            },
            service: {
              name: 'Hair Styling - Braids',
              category: 'Hair',
              duration: 180,
              price: 150000,
            },
            stylist: {
              name: 'Sarah Achieng',
              image: '/images/team/stylist-2.jpg',
            },
            date: '2024-01-16',
            startTime: '10:30',
            endTime: '13:30',
            status: 'PENDING',
            notes: null,
            depositPaid: false,
            totalAmount: 150000,
            createdAt: '2024-01-12T09:15:00Z',
          },
          {
            id: '3',
            appointmentNumber: 'APT-2024-003',
            customer: {
              name: 'Rose Akello',
              email: 'rose@example.com',
              phone: '+256703456789',
            },
            service: {
              name: 'Facial Treatment - Deep Cleanse',
              category: 'Skincare',
              duration: 60,
              price: 80000,
            },
            stylist: {
              name: 'Faith Nambi',
              image: '/images/team/stylist-3.jpg',
            },
            date: '2024-01-16',
            startTime: '14:00',
            endTime: '15:00',
            status: 'CONFIRMED',
            notes: 'Sensitive skin - use gentle products',
            depositPaid: true,
            totalAmount: 80000,
            createdAt: '2024-01-11T16:45:00Z',
          },
          {
            id: '4',
            appointmentNumber: 'APT-2024-004',
            customer: {
              name: 'Joy Atim',
              email: 'joy@example.com',
              phone: '+256704567890',
            },
            service: {
              name: 'Wig Installation',
              category: 'Hair',
              duration: 90,
              price: 200000,
            },
            stylist: null,
            date: '2024-01-17',
            startTime: '11:00',
            endTime: '12:30',
            status: 'PENDING',
            notes: 'Customer bringing own wig',
            depositPaid: false,
            totalAmount: 200000,
            createdAt: '2024-01-13T10:20:00Z',
          },
          {
            id: '5',
            appointmentNumber: 'APT-2024-005',
            customer: {
              name: 'Peace Nakato',
              email: 'peace@example.com',
              phone: '+256705678901',
            },
            service: {
              name: 'Event Makeup',
              category: 'Makeup',
              duration: 90,
              price: 180000,
            },
            stylist: {
              name: 'Grace Nakimera',
              image: '/images/team/stylist-1.jpg',
            },
            date: '2024-01-15',
            startTime: '15:00',
            endTime: '16:30',
            status: 'COMPLETED',
            notes: null,
            depositPaid: true,
            totalAmount: 180000,
            createdAt: '2024-01-08T11:00:00Z',
          },
          {
            id: '6',
            appointmentNumber: 'APT-2024-006',
            customer: {
              name: 'Hope Achieng',
              email: 'hope@example.com',
              phone: '+256706789012',
            },
            service: {
              name: 'Hair Coloring',
              category: 'Hair',
              duration: 150,
              price: 250000,
            },
            stylist: {
              name: 'Sarah Achieng',
              image: '/images/team/stylist-2.jpg',
            },
            date: '2024-01-14',
            startTime: '09:00',
            endTime: '11:30',
            status: 'CANCELLED',
            notes: 'Customer rescheduled',
            depositPaid: false,
            totalAmount: 250000,
            createdAt: '2024-01-07T14:30:00Z',
          },
        ];
        setAppointments(mockAppointments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.appointmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = apt.date === new Date().toISOString().split('T')[0];
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = apt.date === tomorrow.toISOString().split('T')[0];
    } else if (dateFilter === 'week') {
      const today = new Date();
      const weekLater = new Date();
      weekLater.setDate(weekLater.getDate() + 7);
      const aptDate = new Date(apt.date);
      matchesDate = aptDate >= today && aptDate <= weekLater;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'PENDING').length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    today: appointments.filter((a) => a.date === new Date().toISOString().split('T')[0]).length,
  };

  // Get today's appointments for calendar view
  const todayAppointments = appointments.filter((apt) => apt.date === selectedDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage salon service bookings</p>
        </div>
        <div className="flex gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              Calendar
            </button>
          </div>
          <Link
            href="/admin/appointments/new"
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Appointment
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-pink-50 rounded-lg shadow-sm border border-pink-100 p-4">
          <p className="text-sm text-pink-600">Today</p>
          <p className="text-2xl font-bold text-pink-700">{stats.today}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-100 p-4">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-4">
          <p className="text-sm text-blue-600">Confirmed</p>
          <p className="text-2xl font-bold text-blue-700">{stats.confirmed}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-100 p-4">
          <p className="text-sm text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by appointment number, customer or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="w-full md:w-40">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This Week</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stylist
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/appointments/${apt.id}`}
                          className="font-medium text-pink-600 hover:text-pink-700"
                        >
                          {apt.appointmentNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{apt.customer.name}</p>
                          <p className="text-sm text-gray-500">{apt.customer.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{apt.service.name}</p>
                          <p className="text-sm text-gray-500">{apt.service.duration} mins</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {apt.stylist ? (
                          <span className="text-gray-900">{apt.stylist.name}</span>
                        ) : (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(apt.date)}</p>
                          <p className="text-sm text-gray-500">{apt.startTime} - {apt.endTime}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{formatCurrency(apt.totalAmount)}</p>
                          {apt.depositPaid && (
                            <span className="text-xs text-green-600">Deposit paid</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/appointments/${apt.id}`}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          {apt.status === 'PENDING' && (
                            <button
                              className="p-2 text-green-500 hover:text-green-600 transition-colors"
                              title="Confirm"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Cancel"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredAppointments.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Appointments will appear here when customers book services'}
              </p>
            </div>
          )}
        </>
      ) : (
        /* Calendar View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Select Date</h3>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            
            {/* Quick date buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow.toISOString().split('T')[0]);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Day Schedule */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Schedule for {formatDate(selectedDate)}
              </h3>
              <span className="text-sm text-gray-500">
                {todayAppointments.length} appointment(s)
              </span>
            </div>

            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        apt.status === 'CONFIRMED'
                          ? 'border-l-blue-500 bg-blue-50'
                          : apt.status === 'PENDING'
                          ? 'border-l-yellow-500 bg-yellow-50'
                          : apt.status === 'COMPLETED'
                          ? 'border-l-green-500 bg-green-50'
                          : 'border-l-gray-500 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {apt.startTime} - {apt.endTime}
                            </span>
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="font-medium text-gray-800 mt-1">{apt.service.name}</p>
                          <p className="text-sm text-gray-600">{apt.customer.name}</p>
                          {apt.stylist && (
                            <p className="text-sm text-gray-500">with {apt.stylist.name}</p>
                          )}
                        </div>
                        <Link
                          href={`/admin/appointments/${apt.id}`}
                          className="text-pink-500 hover:text-pink-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No appointments scheduled for this date</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
