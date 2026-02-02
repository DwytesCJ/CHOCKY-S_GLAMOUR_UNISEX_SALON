"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/products/ProductCard';

// Sample product data (in real app, this would come from API)
const productData = {
  id: '1',
  name: 'Luxury Matte Lipstick Collection',
  price: 45000,
  originalPrice: 65000,
  description: 'Experience the ultimate in lip luxury with our Matte Lipstick Collection. Formulated with nourishing ingredients, this long-lasting formula delivers intense color payoff while keeping your lips hydrated and comfortable all day long.',
  images: [
    '/images/products/makeup/pexels-828860-2536009.jpg',
    '/images/products/makeup/pexels-shiny-diamond-3373734.jpg',
    '/images/products/makeup/pexels-828860-2693644.jpg',
    '/images/products/makeup/pexels-suzy-hazelwood-1191531.jpg',
  ],
  category: 'Makeup',
  subcategory: 'Lips',
  brand: 'CHOCKY\'S Beauty',
  rating: 4.5,
  reviews: 124,
  inStock: true,
  sku: 'LIP-MAT-001',
  colors: [
    { name: 'Ruby Red', hex: '#9B111E' },
    { name: 'Nude Pink', hex: '#E8B4B8' },
    { name: 'Berry Wine', hex: '#722F37' },
    { name: 'Coral Sunset', hex: '#FF7F50' },
    { name: 'Mauve Magic', hex: '#E0B0FF' },
  ],
  features: [
    'Long-lasting 12-hour wear',
    'Hydrating formula with Vitamin E',
    'Cruelty-free and vegan',
    'Highly pigmented',
    'Smooth, non-drying finish',
  ],
  ingredients: 'Ricinus Communis (Castor) Seed Oil, Caprylic/Capric Triglyceride, Ozokerite, Candelilla Cera, Cera Alba, Tocopheryl Acetate (Vitamin E), Fragrance.',
};

const relatedProducts = [
  {
    id: '7',
    name: 'Foundation SPF 30',
    price: 85000,
    image: '/images/products/makeup/pexels-shiny-diamond-3373734.jpg',
    category: 'Makeup',
    rating: 4.4,
    reviews: 98,
  },
  {
    id: '13',
    name: 'Eyeshadow Palette',
    price: 75000,
    image: '/images/products/makeup/pexels-828860-2693644.jpg',
    category: 'Makeup',
    rating: 4.6,
    reviews: 67,
    badge: 'New' as const,
  },
  {
    id: '14',
    name: 'Mascara Volume',
    price: 35000,
    image: '/images/products/makeup/pexels-suzy-hazelwood-1191531.jpg',
    category: 'Makeup',
    rating: 4.7,
    reviews: 156,
    badge: 'Bestseller' as const,
  },
  {
    id: '15',
    name: 'Blush Duo',
    price: 55000,
    image: '/images/products/makeup/pexels-828860-2536009.jpg',
    category: 'Makeup',
    rating: 4.5,
    reviews: 43,
  },
];

const reviews = [
  {
    id: 1,
    author: 'Sarah M.',
    rating: 5,
    date: '2024-01-15',
    title: 'Best lipstick ever!',
    content: 'I absolutely love this lipstick! The color is gorgeous and it lasts all day without drying out my lips. Will definitely buy more colors!',
    verified: true,
  },
  {
    id: 2,
    author: 'Grace K.',
    rating: 4,
    date: '2024-01-10',
    title: 'Great quality',
    content: 'Beautiful color and smooth application. Only giving 4 stars because I wish it came in more shades.',
    verified: true,
  },
  {
    id: 3,
    author: 'Amina J.',
    rating: 5,
    date: '2024-01-05',
    title: 'Perfect for everyday wear',
    content: 'This has become my go-to lipstick. The matte finish is beautiful and it doesn\'t feel heavy on the lips.',
    verified: true,
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const product = productData; // In real app, fetch based on params.id
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
      variant: product.colors[selectedColor].name,
    });
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
      });
    }
  };

  const formatPrice = (price: number) => {
    return `UGX ${price.toLocaleString()}`;
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="text-gray-500 hover:text-primary transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
            <Link href="/shop" className="text-gray-500 hover:text-primary transition-colors">Shop</Link>
            <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
            <Link href={`/shop?category=${product.category}`} className="text-gray-500 hover:text-primary transition-colors">{product.category}</Link>
            <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-soft">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                  -{discount}%
                </span>
              )}
              <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                <i className="fas fa-expand text-gray-600"></i>
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-primary font-medium mb-2">{product.brand}</p>
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-sm ${
                        i < Math.floor(product.rating) ? 'text-primary' : 'text-gray-300'
                      }`}
                    ></i>
                  ))}
                  <span className="ml-2 text-gray-600">({product.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            <div>
              <p className="font-medium mb-3">
                Color: <span className="text-gray-600">{product.colors[selectedColor].name}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(index)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === index ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-medium mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <i className="fas fa-minus text-sm"></i>
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <i className="fas fa-plus text-sm"></i>
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.inStock ? (
                    <span className="text-green-600"><i className="fas fa-check-circle mr-1"></i> In Stock</span>
                  ) : (
                    <span className="text-red-600"><i className="fas fa-times-circle mr-1"></i> Out of Stock</span>
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 btn btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-shopping-bag mr-2"></i>
                Add to Cart
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-colors ${
                  inWishlist 
                    ? 'bg-primary border-primary text-white' 
                    : 'border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                <i className={`${inWishlist ? 'fas' : 'far'} fa-heart text-xl`}></i>
              </button>
            </div>

            {/* Product Meta */}
            <div className="border-t border-gray-200 pt-6 space-y-2 text-sm">
              <p><span className="text-gray-500">SKU:</span> {product.sku}</p>
              <p><span className="text-gray-500">Category:</span> <Link href={`/shop?category=${product.category}`} className="text-primary hover:underline">{product.category}</Link></p>
              <p><span className="text-gray-500">Brand:</span> {product.brand}</p>
            </div>

            {/* Share */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Share:</span>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                  <i className="fab fa-facebook-f text-sm"></i>
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                  <i className="fab fa-twitter text-sm"></i>
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                  <i className="fab fa-pinterest text-sm"></i>
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                  <i className="fab fa-whatsapp text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-16">
          <div className="border-b border-gray-100">
            <div className="flex overflow-x-auto">
              {['description', 'features', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium capitalize whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab === 'reviews' ? `Reviews (${product.reviews})` : tab}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                <h4 className="font-semibold mb-2">Ingredients</h4>
                <p className="text-gray-600 text-sm">{product.ingredients}</p>
              </div>
            )}
            {activeTab === 'features' && (
              <ul className="space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <i className="fas fa-check-circle text-primary mt-1"></i>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Reviews Summary */}
                <div className="flex flex-col md:flex-row gap-8 pb-6 border-b border-gray-100">
                  <div className="text-center md:text-left">
                    <div className="text-5xl font-bold text-gray-900 mb-2">{product.rating}</div>
                    <div className="flex justify-center md:justify-start gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${
                            i < Math.floor(product.rating) ? 'text-primary' : 'text-gray-300'
                          }`}
                        ></i>
                      ))}
                    </div>
                    <p className="text-gray-500">{product.reviews} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3 mb-2">
                        <span className="text-sm w-8">{stars} <i className="fas fa-star text-xs text-primary"></i></span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : 5}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-8">{stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : 5}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.author}</span>
                            {review.verified && (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                <i className="fas fa-check mr-1"></i>Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star text-xs ${
                                    i < review.rating ? 'text-primary' : 'text-gray-300'
                                  }`}
                                ></i>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-gray-600">{review.content}</p>
                    </div>
                  ))}
                </div>

                <button className="btn btn-outline w-full">Load More Reviews</button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="font-heading text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
