import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="text-center max-w-lg">
        {/* Large 404 */}
        <div className="relative mb-8">
          <h1 className="text-[120px] sm:text-[180px] font-heading font-bold text-gray-100 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fas fa-search text-primary text-3xl"></i>
            </div>
          </div>
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn btn-primary px-6"
          >
            <i className="fas fa-home mr-2"></i>
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
          >
            <i className="fas fa-shopping-bag mr-2"></i>
            Browse Shop
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 mb-4">Popular Destinations</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Shop', href: '/shop' },
              { label: 'Salon Booking', href: '/salon/booking' },
              { label: 'Track Order', href: '/track' },
              { label: 'Contact Us', href: '/contact' },
              { label: 'FAQ', href: '/faq' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 hover:text-primary transition-colors px-3 py-1 rounded-full hover:bg-primary/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
