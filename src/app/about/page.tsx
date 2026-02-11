"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';

// Fallback values data
const fallbackValues = [
  {
    icon: 'fa-heart',
    title: 'Passion for Beauty',
    description: 'We are driven by our love for beauty and helping our customers look and feel their best.',
  },
  {
    icon: 'fa-gem',
    title: 'Quality First',
    description: 'We only offer authentic, premium products from trusted brands you can rely on.',
  },
  {
    icon: 'fa-users',
    title: 'Customer Focus',
    description: 'Your satisfaction is our priority. We go above and beyond to serve you better.',
  },
  {
    icon: 'fa-leaf',
    title: 'Sustainability',
    description: 'We are committed to eco-friendly practices and supporting sustainable beauty.',
  },
];

// Fallback stats data
const fallbackStats = [
  { number: '10K+', label: 'Happy Customers' },
  { number: '500+', label: 'Products' },
  { number: '50+', label: 'Brands' },
  { number: '5+', label: 'Years Experience' },
];

const team = [
  {
    name: 'Christine Nakato',
    role: 'Founder & CEO',
    image: '/uploads/team/SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg',
    bio: 'With over 15 years in the beauty industry, Christine founded CHOCKY\'S to bring premium beauty to Uganda.',
  },
  {
    name: 'Grace Nakamya',
    role: 'Head Stylist',
    image: '/uploads/team/SnapInsta.to_624543554_18078416900580404_729626818934809874_n.jpg',
    bio: 'Grace leads our salon team with expertise in hair styling, coloring, and wig installation.',
  },
  {
    name: 'Sarah Achieng',
    role: 'Lead Makeup Artist',
    image: '/uploads/team/SnapInsta.to_625048011_18078416870580404_5424531763907010008_n.jpg',
    bio: 'Sarah specializes in bridal and editorial makeup, bringing glamour to every client.',
  },
  {
    name: 'David Okello',
    role: 'Operations Manager',
    image: '/uploads/team/SnapInsta.to_625048531_18078416903580404_2925058900756321713_n.jpg',
    bio: 'David ensures smooth operations and exceptional customer service across all channels.',
  },
];

export default function AboutPage() {
  const { settings } = useSiteSettings();
  const [values, setValues] = useState(fallbackValues);
  const [stats, setStats] = useState(fallbackStats);

  // Fetch dynamic values and stats from ContentBlock API
  useEffect(() => {
    async function fetchContentBlocks() {
      try {
        const [valuesRes, statsRes] = await Promise.all([
          fetch('/api/content-blocks?page=about&section=values'),
          fetch('/api/content-blocks?page=about&section=stats'),
        ]);

        const valuesData = await valuesRes.json();
        const statsData = await statsRes.json();

        if (valuesData.success && valuesData.data.length > 0) {
          setValues(valuesData.data.map((block: any) => {
            const meta = block.metadata ? JSON.parse(block.metadata) : {};
            return {
              icon: meta.icon || 'fa-star',
              title: block.title || '',
              description: block.content || '',
            };
          }));
        }

        if (statsData.success && statsData.data.length > 0) {
          setStats(statsData.data.map((block: any) => {
            const meta = block.metadata ? JSON.parse(block.metadata) : {};
            return {
              number: meta.number || block.title || '0',
              label: block.content || '',
            };
          }));
        }
      } catch (error) {
        console.error('Error fetching about page content blocks:', error);
      }
    }

    fetchContentBlocks();
  }, []);

  const phoneDisplay = settings.storePhone.replace(/(\+256)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/uploads/banners/pexels-cottonbro-3993134.jpg"
            alt="About CHOCKY'S"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Our Story
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Bringing premium beauty products and professional salon services to Uganda since 2019
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/uploads/banners/pexels-artbovich-7750115.jpg"
                  alt="CHOCKY'S Store"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
                            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-2xl -z-10 hidden sm:block"></div>
            </div>
            <div>
              <span className="text-primary font-medium">WHO WE ARE</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-6">
                Your Premier Beauty Destination in Uganda
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  CHOCKY&apos;S Ultimate Glamour was founded in 2019 with a simple mission: to make premium 
                  beauty products and professional salon services accessible to everyone in Uganda.
                </p>
                <p>
                  What started as a small beauty shop in Kampala has grown into a comprehensive beauty 
                  destination, offering everything from luxury skincare and makeup to professional hair 
                  styling and bridal services.
                </p>
                <p>
                  We believe that everyone deserves to look and feel their best. That&apos;s why we carefully 
                  curate our product selection, ensuring only authentic, high-quality items make it to 
                  our shelves. Our team of expert stylists and beauticians are trained to deliver 
                  exceptional results every time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">OUR VALUES</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className={`fas ${value.icon} text-2xl text-primary`}></i>
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary via-rose-gold to-burgundy">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">OUR TEAM</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
              Meet the People Behind CHOCKY&apos;S
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our dedicated team of beauty professionals is committed to helping you achieve your beauty goals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-soft">
                <div className="relative aspect-square">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-primary text-sm mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-medium">VISIT US</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-6">
                Our Location
              </h2>
              <p className="text-gray-600 mb-8">
                Visit our flagship store and salon in the heart of Kampala. Experience our full range 
                of products and services in person.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-map-marker-alt text-primary"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Address</h4>
                    <p className="text-gray-600">{settings.storeAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-clock text-primary"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Opening Hours</h4>
                    <p className="text-gray-600">{settings.openingHoursWeekday || 'Mon - Fri: 9:00 AM - 7:00 PM'}</p>
                    <p className="text-gray-600">{settings.openingHoursSaturday || 'Saturday: 9:00 AM - 7:00 PM'}</p>
                    <p className="text-gray-600">{settings.openingHoursSunday || 'Sunday: 10:00 AM - 5:00 PM'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-phone text-primary"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Contact</h4>
                    <p className="text-gray-600">{phoneDisplay}</p>
                    <p className="text-gray-600">{settings.storeEmail}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200">
              {settings.googleMapsEmbed ? (
                <iframe
                  src={settings.googleMapsEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location"
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-map-marked-alt text-6xl text-gray-400"></i>
                    <p className="text-gray-500 mt-2">{settings.storeAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience CHOCKY&apos;S?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re shopping for premium beauty products or booking a salon appointment, 
            we&apos;re here to help you look and feel amazing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="btn btn-primary px-8 py-4">
              Shop Now
            </Link>
            <Link href="/salon/booking" className="btn btn-outline border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4">
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
