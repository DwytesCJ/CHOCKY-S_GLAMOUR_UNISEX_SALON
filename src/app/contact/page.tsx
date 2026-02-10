"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send message');
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            We&apos;d love to hear from you. Get in touch with our team for any questions or inquiries.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              {/* Visit Us */}
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-map-marker-alt text-primary text-xl"></i>
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">Visit Our Store</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  CHOCKY&apos;S Ultimate Glamour<br />
                  Annex Building, Wandegeya<br />
                  Kampala, Uganda
                </p>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary text-sm mt-3 hover:underline"
                >
                  Get Directions <i className="fas fa-external-link-alt text-xs"></i>
                </a>
              </div>

              {/* Call Us */}
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-phone-alt text-primary text-xl"></i>
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">Call Us</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Mon - Sat: 9:00 AM - 7:00 PM<br />
                  Sunday: 10:00 AM - 5:00 PM
                </p>
                <a href="tel:+256703878485" className="text-primary font-medium hover:underline">
                  +256 703 878 485
                </a>
              </div>

              {/* Email Us */}
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-envelope text-primary text-xl"></i>
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">Email Us</h3>
                <p className="text-gray-600 text-sm mb-2">
                  We&apos;ll respond within 24 hours
                </p>
                <a href="mailto:josephchandin@gmail.com" className="text-primary font-medium hover:underline">
                  josephchandin@gmail.com
                </a>
              </div>

              {/* WhatsApp */}
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fab fa-whatsapp text-green-600 text-xl"></i>
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">WhatsApp</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Quick responses via WhatsApp
                </p>
                <a 
                  href="https://wa.me/256703878485" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  <i className="fab fa-whatsapp"></i>
                  Chat with Us
                </a>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <h3 className="font-heading text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { icon: 'fa-facebook-f', color: 'bg-blue-600', href: '#' },
                    { icon: 'fa-instagram', color: 'bg-gradient-to-br from-purple-600 to-pink-500', href: '#' },
                    { icon: 'fa-twitter', color: 'bg-sky-500', href: '#' },
                    { icon: 'fa-tiktok', color: 'bg-black', href: '#' },
                    { icon: 'fa-youtube', color: 'bg-red-600', href: '#' },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className={`w-10 h-10 ${social.color} rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity`}
                    >
                      <i className={`fab ${social.icon}`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-8 shadow-soft">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-check text-green-500 text-2xl"></i>
                    </div>
                    <h3 className="font-heading text-2xl font-semibold mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="btn btn-primary"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-heading text-2xl font-semibold mb-6">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Your Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            required
                          />
                        </div>
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
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            placeholder="+256 700 000 000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Subject *</label>
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            required
                          >
                            <option value="">Select a subject</option>
                            <option value="general">General Inquiry</option>
                            <option value="order">Order Support</option>
                            <option value="appointment">Salon Appointment</option>
                            <option value="products">Product Information</option>
                            <option value="partnership">Business Partnership</option>
                            <option value="feedback">Feedback</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Your Message *</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                          placeholder="How can we help you?"
                          required
                        ></textarea>
                      </div>
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                          {error}
                        </div>
                      )}
                      <button type="submit" disabled={loading} className="btn btn-primary px-8 disabled:opacity-60">
                        {loading ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Sending...</>
                        ) : (
                          <>Send Message<i className="fas fa-paper-plane ml-2"></i></>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold mb-2">Find Us</h2>
            <p className="text-gray-600">Visit our store in the heart of Kampala</p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-soft h-96 bg-gray-200">
            {/* Map placeholder - in production, use Google Maps or similar */}
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <i className="fas fa-map-marked-alt text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">Interactive Map</p>
                <p className="text-sm text-gray-400">Annex Building, Wandegeya, Kampala</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-16 bg-gradient-to-r from-primary via-rose-gold to-burgundy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
            Have Questions?
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Check out our frequently asked questions for quick answers.
          </p>
          <Link href="/faq" className="btn bg-white text-primary hover:bg-gray-100">
            View FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}
