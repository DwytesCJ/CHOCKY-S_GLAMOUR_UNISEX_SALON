'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MultiImageUpload from '@/components/admin/MultiImageUpload';

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    shortDescription: '',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    categoryId: '',
    brandId: '',
    stockQuantity: '0',
    lowStockThreshold: '5',
    weight: '',
    dimensions: '',
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    isBestseller: false,
    isOnSale: false,
    metaTitle: '',
    metaDescription: '',
    tags: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, catRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch('/api/admin/categories'),
        ]);

        const productData = await productRes.json();
        const catData = await catRes.json();

        if (catData.success) setCategories(catData.data);

        if (productData.success && productData.data) {
          const p = productData.data;
          setFormData({
            name: p.name || '',
            sku: p.sku || '',
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            price: p.price?.toString() || '',
            compareAtPrice: p.compareAtPrice?.toString() || '',
            costPrice: p.costPrice?.toString() || '',
            categoryId: p.categoryId || '',
            brandId: p.brandId || '',
            stockQuantity: p.stockQuantity?.toString() || '0',
            lowStockThreshold: p.lowStockThreshold?.toString() || '5',
            weight: p.weight?.toString() || '',
            dimensions: p.dimensions || '',
            isActive: p.isActive ?? true,
            isFeatured: p.isFeatured ?? false,
            isNewArrival: p.isNewArrival ?? false,
            isBestseller: p.isBestseller ?? false,
            isOnSale: p.isOnSale ?? false,
            metaTitle: p.metaTitle || '',
            metaDescription: p.metaDescription || '',
            tags: (p.tags || []).join(', '),
          });
          const imgs = p.images?.map((img: any) => img.url) || [];
          setImageUrls(imgs.length > 0 ? imgs : []);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setFetching(false);
      }
    };
    if (productId) fetchData();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const images = imageUrls
        .filter(url => url.trim() !== '')
        .map((url, index) => ({ url: url.trim(), alt: formData.name, sortOrder: index, isPrimary: index === 0 }));

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        brandId: formData.brandId || null,
        images,
      };

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin/products');
      } else {
        setError(data.error || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-1">Update product details</p>
        </div>
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700">
          <i className="fas fa-arrow-left mr-2"></i>Back to Products
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (UGX) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare at Price</label>
              <input type="number" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cost Price</label>
              <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
              <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          <MultiImageUpload
            values={imageUrls}
            onChange={setImageUrls}
            folder="products"
            label=""
            maxImages={10}
          />
        </div>

        {/* Flags */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-4">Product Flags</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'isActive', label: 'Active' },
              { name: 'isFeatured', label: 'Featured' },
              { name: 'isNewArrival', label: 'New Arrival' },
              { name: 'isBestseller', label: 'Bestseller' },
              { name: 'isOnSale', label: 'On Sale' },
            ].map(flag => (
              <label key={flag.name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name={flag.name}
                  checked={(formData as any)[flag.name]}
                  onChange={handleChange}
                  className="rounded text-primary" />
                <span className="text-sm">{flag.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-4">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Meta Title</label>
              <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                placeholder="beauty, skincare, moisturizer" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/products" className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={loading}
            className="btn btn-primary disabled:opacity-60">
            {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
