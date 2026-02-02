import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const values = [
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

const stats = [
  { number: '10K+', label: 'Happy Customers' },
  { number: '500+', label: 'Products' },
  { number: '50+', label: 'Brands' },
  { number: '5+', label: 'Years Experience' },
];

const team = [
  {
    name: 'Christine Nakato',
    role: 'Founder & CEO',
    image: '/images/team/SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg',
    bio: 'With over 15 years in the beauty industry, Christine founded CHOCKY\'S to bring premium beauty to Uganda.',
  },
  {
    name: 'Grace Nakamya',
    role: 'Head Stylist',
    image: '/images/team/SnapInsta.to_624543554_18078416900580404_729626818934809874_n.jpg',
    bio: 'Grace leads our salon team with expertise in hair styling, coloring, and wig installation.',
  },
  {
    name: 'Sarah Achieng',
    role: 'Lead Makeup Artist',
    image: '/images/team/SnapInsta.to_625048011_18078416870580404_5424531763907010008_n.jpg',
    bio: 'Sarah specializes in bridal and editorial makeup, bringing glamour to every client.',
  },
  {
    name: 'David Okello',
    role: 'Operations Manager',
    image: '/images/team/SnapInsta.to_625048531_18078416903580404_2925058900756321713_n.jpg',
    bio: 'David ensures smooth operations and exceptional customer service across all channels.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/banners/pexels-cottonbro-3993134.jpg"
            alt="About CHOCKY'S"
            fill
            className="object-cover"
            priority
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
                  src="/images/banners/pexels-artbovich-7750115.jpg"
                  alt="CHOCKY'S Store"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-2xl -z-10"></div>
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
                    <p className="text-gray-600">Kampala Road, Kampala, Uganda</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-clock text-primary"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Opening Hours</h4>
                    <p className="text-gray-600">Mon - Sat: 9:00 AM - 7:00 PM</p>
                    <p className="text-gray-600">Sunday: 10:00 AM - 5:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-phone text-primary"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Contact</h4>
                    <p className="text-gray-600">+256 700 123 456</p>
                    <p className="text-gray-600">info@chockys.ug</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200">
              {/* Map placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-map-marked-alt text-6xl text-gray-400"></i>
              </div>
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
