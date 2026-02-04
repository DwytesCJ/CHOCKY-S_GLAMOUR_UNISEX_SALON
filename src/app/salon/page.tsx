"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const stylists = [
  {
    id: 1,
    name: 'Grace Nakamya',
    role: 'Senior Hair Stylist',
    image: '/images/team/SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg',
    specialties: ['Braiding', 'Wig Installation', 'Hair Coloring'],
    rating: 4.9,
    reviews: 156,
  },
  {
    id: 2,
    name: 'Sarah Achieng',
    role: 'Makeup Artist',
    image: '/images/team/SnapInsta.to_624543554_18078416900580404_729626818934809874_n.jpg',
    specialties: ['Bridal Makeup', 'Editorial', 'Special Effects'],
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 3,
    name: 'Amina Hassan',
    role: 'Skincare Specialist',
    image: '/images/team/SnapInsta.to_625048011_18078416870580404_5424531763907010008_n.jpg',
    specialties: ['Facials', 'Anti-Aging', 'Acne Treatment'],
    rating: 4.9,
    reviews: 98,
  },
  {
    id: 4,
    name: 'Joy Namubiru',
    role: 'Hair Colorist',
    image: '/images/team/SnapInsta.to_625048531_18078416903580404_2925058900756321713_n.jpg',
    specialties: ['Balayage', 'Highlights', 'Color Correction'],
    rating: 4.7,
    reviews: 87,
  },
];

export default function SalonPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch services from API
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/salon/services?grouped=true');
        const data = await res.json();
        if (data.success) {
          setServices(data.data);
        }
      } catch (error) {
        console.error('Error fetching salon services:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchServices();
  }, []);

  const formatPrice = (price: number) => {
    return `UGX ${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/banners/pexels-artbovich-7750115.jpg"
            alt="Salon Services"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-2 bg-primary/20 backdrop-blur-sm text-white rounded-full text-sm mb-4">
              Professional Beauty Services
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Transform Your Look
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              Experience luxury beauty services from our team of expert stylists and beauticians. 
              Book your appointment today and let us bring out your inner glamour.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/salon/booking" className="btn btn-primary px-8 py-4">
                <i className="fas fa-calendar-alt mr-2"></i>
                Book Appointment
              </Link>
              <a href="#services" className="btn btn-outline border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4">
                View Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'fa-award', title: 'Expert Stylists', desc: 'Certified professionals' },
              { icon: 'fa-leaf', title: 'Premium Products', desc: 'Quality brands only' },
              { icon: 'fa-clock', title: 'Flexible Hours', desc: 'Open 7 days a week' },
              { icon: 'fa-heart', title: 'Satisfaction', desc: '100% guaranteed' },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className={`fas ${feature.icon} text-xl text-primary`}></i>
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">OUR SERVICES</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
              What We Offer
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From hair styling to skincare, we offer a comprehensive range of beauty services 
              to help you look and feel your best.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : services.length > 0 ? (
            <>
              {/* Category Tabs */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {services.map((service, index) => (
                  <button
                    key={service.id}
                    onClick={() => setActiveCategory(index)}
                    className={`px-6 py-3 rounded-full font-medium transition-all ${
                      activeCategory === index
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className={`fas ${service.icon} mr-2`}></i>
                    {service.category}
                  </button>
                ))}
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services[activeCategory].items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <span className="text-primary font-bold">{formatPrice(item.price)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        <i className="far fa-clock mr-1"></i>
                        {item.duration}
                      </span>
                      <Link
                        href={`/salon/booking?service=${encodeURIComponent(item.name)}`}
                        className="text-primary font-medium hover:underline"
                      >
                        Book Now <i className="fas fa-arrow-right ml-1 text-sm"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No services available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">MEET THE TEAM</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
              Our Expert Stylists
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our talented team of beauty professionals is dedicated to helping you achieve your desired look.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stylists.map((stylist) => (
              <div key={stylist.id} className="group">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={stylist.image}
                    alt={stylist.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex flex-wrap gap-1">
                        {stylist.specialties.map((specialty, index) => (
                          <span key={index} className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg">{stylist.name}</h3>
                <p className="text-primary text-sm mb-2">{stylist.role}</p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center text-primary">
                    <i className="fas fa-star"></i>
                    <span className="ml-1 font-medium">{stylist.rating}</span>
                  </div>
                  <span className="text-gray-400">({stylist.reviews} reviews)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">OUR WORK</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
              Before & After Gallery
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              '/images/products/hair/pexels-venus-31818416.jpg',
              '/images/products/makeup/pexels-828860-2536009.jpg',
              '/images/products/hair/pexels-rdne-6923351.jpg',
              '/images/products/skincare/pexels-misolo-cosmetic-2588316-4841339.jpg',
              '/images/products/makeup/pexels-shiny-diamond-3373734.jpg',
              '/images/products/hair/pexels-alinaskazka-14730865.jpg',
              '/images/products/skincare/pexels-karola-g-4889036.jpg',
              '/images/products/makeup/pexels-828860-2693644.jpg',
            ].map((image, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                <Image
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <i className="fas fa-expand text-white text-2xl"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary via-rose-gold to-burgundy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Look?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the CHOCKY&apos;S difference. 
            Our expert team is ready to help you look and feel amazing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/salon/booking" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4">
              <i className="fas fa-calendar-alt mr-2"></i>
              Book Appointment
            </Link>
            <a href="tel:+256700123456" className="btn border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4">
              <i className="fas fa-phone mr-2"></i>
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-map-marker-alt text-xl text-primary"></i>
              </div>
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600">Kampala Road, Kampala<br />Uganda</p>
            </div>
            <div>
              <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-xl text-primary"></i>
              </div>
              <h3 className="font-semibold mb-2">Opening Hours</h3>
              <p className="text-gray-600">Mon - Sat: 9AM - 6PM<br />Sunday: By Appointment</p>
            </div>
            <div>
              <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-phone text-xl text-primary"></i>
              </div>
              <h3 className="font-semibold mb-2">Contact</h3>
              <p className="text-gray-600">+256 700 123 456<br />info@chockys.ug</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
