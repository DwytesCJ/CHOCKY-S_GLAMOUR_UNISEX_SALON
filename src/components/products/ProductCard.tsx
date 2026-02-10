'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, memo } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: 'Sale' | 'New' | 'Bestseller' | 'Trending';
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const toast = useToast();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
      toast.success('Added to wishlist');
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Sale':
        return 'bg-primary text-white';
      case 'New':
        return 'bg-emerald-500 text-white';
      case 'Bestseller':
        return 'bg-primary text-white';
      case 'Trending':
        return 'bg-primary text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  // Generate star rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fas fa-star text-sm text-primary"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-sm text-primary"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-sm text-primary"></i>);
      }
    }
    return stars;
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-glamour transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/shop/${product.id}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-cream">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Badge */}
          {product.badge && (
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(product.badge)}`}>
              {product.badge}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center transition-colors duration-200 ${
              inWishlist ? 'text-primary' : 'text-gray-400 hover:text-primary'
            }`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <i className={`${inWishlist ? 'fas' : 'far'} fa-heart`}></i>
          </button>

          {/* Add to Cart Button - Shows on Hover */}
          <div
            className={`absolute inset-x-0 bottom-0 p-3 transition-all duration-200 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors duration-200 text-sm"
            >
              <i className="fas fa-shopping-bag"></i>
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            {product.category}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {renderStars()}
            </div>
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-black">
              UGX {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  UGX {product.originalPrice.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default memo(ProductCard);
