"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ShopifyImage } from "@/lib/shopify/types";

interface ProductGalleryProps {
  images: { url: string; alt: string }[];
  title: string;
  activeImageUrl?: string;
  onImageSelect?: (url: string) => void;
}

export default function ProductGallery({ images, title, activeImageUrl, onImageSelect }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (activeImageUrl) {
      const stripQuery = (url: string) => url.split('?')[0];
      const idx = images.findIndex((img) => stripQuery(img.url) === stripQuery(activeImageUrl));
      if (idx !== -1) {
        setSelectedIndex(idx);
      }
    }
  }, [activeImageUrl, images]);
  
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-dim">
        <Image
          src="/assets/blank_seoul_symbol.png"
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
    );
  }

  const mainImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-[#E8DFC8] shadow-xs">
        <Image
          src={mainImage.url}
          alt={mainImage.alt || title}
          fill
          className="object-contain p-4 sm:p-6 transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedIndex(i);
                if (onImageSelect) {
                  onImageSelect(img.url);
                }
              }}
              className={`
                relative aspect-square rounded-xl overflow-hidden bg-surface-dim cursor-pointer
                border-2 transition-all duration-200
                ${i === selectedIndex ? "border-primary" : "border-transparent hover:border-primary/30"}
              `}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
