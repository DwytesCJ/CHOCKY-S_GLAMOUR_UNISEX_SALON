'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'portrait';
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'general',
  label = 'Upload Image',
  className = '',
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
    portrait: 'aspect-[3/4]',
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, GIF, WebP, or SVG.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setError('');
    setUploading(true);

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

      onChange(data.data.files[0].url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: value }),
        });
      } catch (err) {
        console.error('Failed to delete image:', err);
      }
      onChange('');
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleInputChange}
        className="hidden"
      />

      {value ? (
        <div className={`relative ${aspectRatioClasses[aspectRatio]} bg-gray-100 rounded-lg overflow-hidden group`}>
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              disabled={uploading}
            >
              <i className="fas fa-exchange-alt mr-1"></i>
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              disabled={uploading}
            >
              <i className="fas fa-trash mr-1"></i>
              Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Uploading...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            ${aspectRatioClasses[aspectRatio]} 
            border-2 border-dashed rounded-lg cursor-pointer transition-colors
            flex flex-col items-center justify-center
            ${dragOver ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'}
            ${uploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <i className="fas fa-spinner fa-spin text-xl"></i>
              <span>Uploading...</span>
            </div>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
              <p className="text-sm text-gray-600 font-medium">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP, SVG (max 10MB)</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
}
