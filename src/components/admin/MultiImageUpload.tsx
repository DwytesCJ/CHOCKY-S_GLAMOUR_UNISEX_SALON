'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  maxImages?: number;
  className?: string;
}

export default function MultiImageUpload({
  values = [],
  onChange,
  folder = 'products',
  label = 'Product Images',
  maxImages = 10,
  className = '',
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const addInputRef = useRef<HTMLInputElement>(null);

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const handleFileUpload = async (file: File, index?: number) => {
    if (!file) return;

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, GIF, WebP, or SVG.');
      return;
    }

    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setError('');
    const uploadIndex = index !== undefined ? index : values.length;
    setUploading(uploadIndex);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      const uploadedUrl = data.data.files[0].url;

      if (index !== undefined) {
        // Replace existing image
        const newValues = [...values];
        newValues[index] = uploadedUrl;
        onChange(newValues);
      } else {
        // Add new image
        onChange([...values, uploadedUrl]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, index);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file, index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const removeImage = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= values.length) return;
    const newValues = [...values];
    const [moved] = newValues.splice(fromIndex, 1);
    newValues.splice(toIndex, 0, moved);
    onChange(newValues);
  };

  const filteredValues = values.filter((url) => url && url.trim() !== '');

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <p className="text-xs text-gray-500 mb-3">
        Click to select images from your PC or drag & drop. First image is the primary/featured image. (Max {maxImages} images)
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Existing images */}
        {filteredValues.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
              index === 0 ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200'
            } ${dragOverIndex === index ? 'border-pink-400 bg-pink-50' : ''}`}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
          >
            {/* Primary badge */}
            {index === 0 && (
              <div className="absolute top-2 left-2 z-10 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                ★ Primary
              </div>
            )}

            {/* Image preview */}
            <div className="aspect-square relative bg-gray-100">
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="200px"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                }}
              />
            </div>

            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {/* Move left */}
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, index - 1)}
                  className="p-1.5 bg-white text-gray-700 rounded-lg text-xs hover:bg-gray-100 transition-colors"
                  title="Move left"
                >
                  ←
                </button>
              )}

              {/* Replace */}
              <button
                type="button"
                onClick={() => fileInputRefs.current[index]?.click()}
                className="p-1.5 bg-white text-gray-700 rounded-lg text-xs hover:bg-gray-100 transition-colors"
                title="Replace image"
                disabled={uploading !== null}
              >
                🔄
              </button>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors"
                title="Remove image"
                disabled={uploading !== null}
              >
                ✕
              </button>

              {/* Move right */}
              {index < filteredValues.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, index + 1)}
                  className="p-1.5 bg-white text-gray-700 rounded-lg text-xs hover:bg-gray-100 transition-colors"
                  title="Move right"
                >
                  →
                </button>
              )}
            </div>

            {/* Uploading overlay */}
            {uploading === index && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="flex flex-col items-center gap-1 text-gray-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
                  <span className="text-xs">Uploading...</span>
                </div>
              </div>
            )}

            {/* Hidden file input for replacing */}
            <input
              type="file"
              ref={(el) => { fileInputRefs.current[index] = el; }}
              onChange={(e) => handleInputChange(e, index)}
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              className="hidden"
            />
          </div>
        ))}

        {/* Add new image button */}
        {filteredValues.length < maxImages && (
          <div
            onClick={() => addInputRef.current?.click()}
            onDrop={(e) => handleDrop(e)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(-1);
            }}
            onDragLeave={handleDragLeave}
            className={`
              aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors
              flex flex-col items-center justify-center
              ${dragOverIndex === -1 ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'}
              ${uploading === values.length ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            {uploading === values.length ? (
              <div className="flex flex-col items-center gap-1 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
                <span className="text-xs">Uploading...</span>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-xs text-gray-600 font-medium text-center px-2">Click or drag to add image</p>
                <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input for adding new images */}
      <input
        type="file"
        ref={addInputRef}
        onChange={(e) => handleInputChange(e)}
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-500">
          ⚠️ {error}
        </p>
      )}

      {filteredValues.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">
          {filteredValues.length} image{filteredValues.length !== 1 ? 's' : ''} added. 
          The first image (★ Primary) will be used as the main product image.
        </p>
      )}
    </div>
  );
}
