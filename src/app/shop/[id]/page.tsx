"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
          setRelatedProducts(data.data.relatedProducts || []);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Save to recently viewed in localStorage
  useEffect(() => {
    if (!product) return;
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const entry = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        originalPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
        image: product.images?.[0]?.url || '/images/placeholder.jpg',
        category: product.category?.name || 'Beauty',
        rating: product.averageRating || 0,
        reviews: product.reviewCount || 0,
      };
      const filtered = stored.filter((p: any) => p.id !== product.id);
      filtered.unshift(entry);
      localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));
    } catch {}
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-center px-4">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The product you are looking for doesn't exist or has been removed.</p>
        <Link href="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0]?.url || '/images/placeholders/product.jpg',
      quantity: quantity,
      variant: product.variants?.[selectedVariant]?.name,
    });
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images[0]?.url || '/images/placeholders/product.jpg',
        category: product.category?.name || 'Uncategorized',
      });
    }
  };

  const formatPrice = (price: number) => {
    return `UGX ${Number(price).toLocaleString()}`;
  };

  const discount = product.compareAtPrice 
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100) 
    : 0;

  const productImages = product.images.length > 0 
    ? product.images.map((img: any) => img.url) 
    : ['/images/placeholders/product.jpg'];

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
            <Link href={`/shop?category=${product.category?.name}`} className="text-gray-500 hover:text-primary transition-colors">{product.category?.name}</Link>
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
                src={productImages[selectedImage]}
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
              {productImages.map((image: string, index: number) => (
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
              <p className="text-primary font-medium mb-2">{product.brand?.name || "CHOCKY'S Beauty"}</p>
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-sm ${
                        i < Math.floor(product.averageRating) ? 'text-primary' : 'text-gray-300'
                      }`}
                    ></i>
                  ))}
                  <span className="ml-2 text-gray-600">({product.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="font-medium mb-3">
                  Option: <span className="text-gray-600">{product.variants[selectedVariant].name}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any, index: number) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(index)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                        selectedVariant === index 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-gray-200 hover:border-primary/30'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                  {product.stockQuantity > 0 ? (
                    <span className="text-green-600"><i className="fas fa-check-circle mr-1"></i> In Stock ({product.stockQuantity} available)</span>
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
                disabled={product.stockQuantity <= 0}
                className="flex-1 btn btn-outline py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-shopping-bag mr-2"></i>
                Add to Cart
              </button>
              <Link
                href={product.stockQuantity > 0 ? '/checkout' : '#'}
                onClick={(e) => {
                  if (product.stockQuantity <= 0) { e.preventDefault(); return; }
                  handleAddToCart();
                }}
                className="flex-1 btn btn-primary py-4 text-lg text-center"
              >
                Buy Now
              </Link>
              <button
                onClick={handleWishlistToggle}
                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  inWishlist 
                    ? 'bg-primary border-primary text-white' 
                    : 'border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                <i className={`${inWishlist ? 'fas' : 'far'} fa-heart text-xl`}></i>
              </button>
            </div>

            {/* Delivery Info */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <i className="fas fa-truck text-primary mt-0.5"></i>
                <div>
                  <p className="font-medium text-sm">Delivery</p>
                  <p className="text-xs text-gray-500">Estimated 2-5 business days &middot; Rates vary by location</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-store text-primary mt-0.5"></i>
                <div>
                  <p className="font-medium text-sm">Store Pickup</p>
                  <p className="text-xs text-gray-500">Free pickup at Wandegeya, Kampala</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-undo text-primary mt-0.5"></i>
                <div>
                  <p className="font-medium text-sm">Returns</p>
                  <p className="text-xs text-gray-500">Free 7-day returns on eligible items</p>
                </div>
              </div>
            </div>

            {/* Product Meta */}
            <div className="border-t border-gray-200 pt-6 space-y-2 text-sm">
              <p><span className="text-gray-500">SKU:</span> {product.sku}</p>
              <p><span className="text-gray-500">Category:</span> <Link href={`/shop?category=${product.category?.name}`} className="text-primary hover:underline">{product.category?.name}</Link></p>
              <p><span className="text-gray-500">Brand:</span> {product.brand?.name}</p>
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
                  {tab === 'reviews' ? `Reviews (${product.reviewCount})` : tab}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                {product.ingredients && (
                  <>
                    <h4 className="font-semibold mb-2">Ingredients</h4>
                    <p className="text-gray-600 text-sm">{product.ingredients}</p>
                  </>
                )}
              </div>
            )}
            {activeTab === 'features' && (
              <ul className="space-y-3">
                {product.tags && product.tags.split(',').map((tag: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <i className="fas fa-check-circle text-primary mt-1"></i>
                    <span className="text-gray-600 uppercase text-sm">{tag.trim()}</span>
                  </li>
                ))}
              </ul>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Reviews Summary */}
                <div className="flex flex-col md:flex-row gap-8 pb-6 border-b border-gray-100">
                  <div className="text-center md:text-left">
                    <div className="text-5xl font-bold text-gray-900 mb-2">{product.averageRating}</div>
                    <div className="flex justify-center md:justify-start gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${
                            i < Math.floor(product.averageRating) ? 'text-primary' : 'text-gray-300'
                          }`}
                        ></i>
                      ))}
                    </div>
                    <p className="text-gray-500">{product.reviewCount} reviews</p>
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-6">
                  {product.reviews && product.reviews.length > 0 ? product.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.user?.firstName} {review.user?.lastName}</span>
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
                            <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  )) : (
                    <div className="py-8 text-center text-gray-500">No reviews yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="font-heading text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={{
                ...p,
                image: p.image || '/images/placeholders/product.jpg',
                category: product.category?.name || 'Uncategorized',
                rating: p.averageRating || 0,
                reviews: p.reviewCount || 0
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
