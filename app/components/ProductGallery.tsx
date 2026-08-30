"use client";

import { useState, useEffect, useCallback, MouseEvent } from "react";
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
  const [isHovered, setIsHovered] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (activeImageUrl) {
      const stripQuery = (url: string) => url.split('?')[0];
      const idx = images.findIndex((img) => stripQuery(img.url) === stripQuery(activeImageUrl));
      if (idx !== -1) {
        setSelectedIndex(idx);
      }
    }
  }, [activeImageUrl, images]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  }, []);
  
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#FAF9F6] border border-[#E8DFC8]/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
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
      {/* Main Image (0-Click Interactive Hover Pan-Zoom with GPU Acceleration) */}
      <div
        className="group relative aspect-square rounded-3xl overflow-hidden bg-[#FAF9F6] border border-[#E8DFC8]/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-zoom-in select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={mainImage.url}
          alt={mainImage.alt || title}
          fill
          className="object-cover transition-transform duration-200 ease-out"
          style={{
            transformOrigin: isHovered ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : "center center",
            transform: isHovered ? "scale(2.4)" : "scale(1)",
          }}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {/* Subtle Quiet-Luxury Zoom Hint Pill */}
        <div
          className={`
            absolute bottom-3.5 right-3.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md
            border border-white/20 text-[11px] font-medium text-white/90 flex items-center gap-1.5
            pointer-events-none transition-opacity duration-300 shadow-sm
            ${isHovered ? "opacity-0" : "opacity-100 hidden sm:flex"}
          `}
        >
          <span className="text-xs">🔍</span>
          <span>Hover to zoom</span>
        </div>
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
                relative aspect-square rounded-2xl overflow-hidden bg-[#FAF9F6] cursor-pointer
                border-2 transition-all duration-300 shadow-2xs
                ${i === selectedIndex ? "border-[#C25E38] ring-2 ring-[#C25E38]/20" : "border-[#E8DFC8]/80 hover:border-[#C25E38]/50"}
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
