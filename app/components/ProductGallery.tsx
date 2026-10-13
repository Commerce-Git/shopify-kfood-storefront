"use client";

import { useState, useCallback, MouseEvent } from "react";
import Image from "next/image";
import Modal from './Modal';

interface ProductGalleryProps {
  images: { url: string; alt: string }[];
  title: string;
  activeImageUrl?: string;
  onImageSelect?: (url: string) => void;
}

export default function ProductGallery({ images, title, activeImageUrl, onImageSelect }: ProductGalleryProps) {
  const [localIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [enlarged, setEnlarged] = useState(false);

  const activeIndex = activeImageUrl
    ? images.findIndex(img => img.url.split("?")[0] === activeImageUrl.split("?")[0])
    : -1;
  const selectedIndex = activeIndex >= 0 ? activeIndex : Math.min(localIndex, Math.max(0, images.length - 1));

  const handleMouseMove = useCallback((e: MouseEvent<HTMLButtonElement>) => {
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
      <button
        type="button"
        aria-label={`Enlarge image: ${mainImage.alt || title}`}
        className="block w-full group relative aspect-square rounded-3xl overflow-hidden bg-[#FAF9F6] border border-[#E8DFC8]/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-zoom-in select-none focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => { setViewerOpen(true); setEnlarged(false); setIsHovered(false); }}
        onMouseEnter={() => setIsHovered(window.matchMedia('(hover: hover) and (pointer: fine)').matches)}
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
        <span
          className={`
            absolute bottom-3.5 right-3.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md
            border border-white/20 text-[11px] font-medium text-white/90 flex items-center gap-1.5
            pointer-events-none transition-opacity duration-300 shadow-sm
            ${isHovered ? "opacity-0" : "opacity-100"}
          `}
        >
          <span className="text-xs">🔍</span>
          <span>Enlarge image</span>
        </span>
      </button>

      {viewerOpen && <Modal label="Product image viewer" onClose={() => setViewerOpen(false)} className="flex flex-col bg-white!">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2">
          <p className="min-w-0 truncate text-sm font-medium">{title}</p>
          <button type="button" className="min-h-11 shrink-0 px-3 text-sm underline" onClick={() => setEnlarged(value => !value)}>{enlarged ? 'Zoom out' : 'Zoom in'}</button>
          <button type="button" aria-label="Close image viewer" className="min-h-11 min-w-11 text-xl" onClick={() => setViewerOpen(false)}>✕</button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto overscroll-contain" tabIndex={0} aria-label="Image; scroll to explore when zoomed">
          <div className="relative aspect-square" style={{ width: enlarged ? '200%' : '100%', minHeight: enlarged ? undefined : '100%' }}>
            <Image src={mainImage.url} alt={mainImage.alt || title} fill className="object-contain" sizes={enlarged ? '200vw' : '100vw'} />
          </div>
        </div>
        {images.length > 1 && <div className="flex shrink-0 items-center justify-between border-t px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <button type="button" disabled={selectedIndex === 0} className="min-h-11 px-3 text-sm disabled:opacity-40" onClick={() => { const index = selectedIndex - 1; setSelectedIndex(index); onImageSelect?.(images[index].url); setEnlarged(false); }}>Previous image</button>
          <span className="text-xs">{selectedIndex + 1} / {images.length}</span>
          <button type="button" disabled={selectedIndex === images.length - 1} className="min-h-11 px-3 text-sm disabled:opacity-40" onClick={() => { const index = selectedIndex + 1; setSelectedIndex(index); onImageSelect?.(images[index].url); setEnlarged(false); }}>Next image</button>
        </div>}
      </Modal>}

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
