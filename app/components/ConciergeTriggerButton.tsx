'use client';

import React from 'react';
import { triggerHaptic } from '@/lib/haptics';

export interface ConciergeTriggerButtonProps {
  variant?: 'pdp-buybox' | 'pdp-atelier' | 'artist-hero' | 'chip';
  contextType?: 'product' | 'artist';
  productTitle?: string;
  productHandle?: string;
  productImageUrl?: string;
  artistName?: string;
  artistSlug?: string;
  artistAvatar?: string;
  variantTitle?: string;
  selectedOptions?: Record<string, string>;
  price?: string;
  currency?: string;
  className?: string;
}

export default function ConciergeTriggerButton({
  variant = 'pdp-buybox',
  contextType = 'product',
  productTitle,
  productHandle,
  productImageUrl,
  artistName,
  artistSlug,
  artistAvatar,
  variantTitle,
  selectedOptions,
  price,
  currency = 'USD',
  className = '',
}: ConciergeTriggerButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic(8);

    const detail = {
      product: {
        type: contextType,
        title: contextType === 'artist' ? (artistName || 'Artist Studio') : (productTitle || 'Inquired Piece'),
        handle: productHandle,
        imageUrl: contextType === 'artist' ? artistAvatar : productImageUrl,
        artist: artistName,
        artistSlug,
        variantTitle: variantTitle && variantTitle !== 'Default Title' ? variantTitle : undefined,
        selectedOptions,
        price,
        currency,
      },
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-concierge', { detail }));
    }
  };

  if (variant === 'artist-hero') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`group px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-full font-bold border border-[#E8DFC8] bg-white hover:bg-[#18181B] text-[#18181B] hover:text-white shadow-2xs hover:border-[#18181B] transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-95 select-none ${className}`}
        aria-label={`Message ${artistName || 'Studio'}`}
      >
        <span className="text-sm group-hover:scale-110 transition-transform">✉️</span>
        <span>Message Atelier</span>
      </button>
    );
  }

  if (variant === 'pdp-atelier') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`px-4 py-2 sm:py-2.5 text-xs rounded-full font-bold border border-[#E8DFC8] bg-white hover:bg-[#18181B] text-[#18181B] hover:text-white shadow-2xs hover:border-[#18181B] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 shrink-0 select-none ${className}`}
        aria-label={`Inquire with ${artistName || 'Studio'}`}
      >
        <span className="text-xs">💬</span>
        <span>Inquire with Studio</span>
      </button>
    );
  }

  if (variant === 'chip') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#E8DFC8] bg-white/90 hover:bg-[#18181B] hover:text-white text-[#18181B] transition-all cursor-pointer shadow-2xs active:scale-95 select-none ${className}`}
      >
        <span className="text-xs">💬</span>
        <span>Ask Concierge</span>
      </button>
    );
  }

  // Default: 'pdp-buybox'
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full py-2.5 px-3.5 sm:px-4 rounded-2xl border border-[#E8DFC8] bg-[#FAF8F5]/80 hover:bg-white hover:border-[#18181B] transition-all duration-200 cursor-pointer flex items-center justify-between group shadow-2xs active:scale-[0.99] text-left select-none ${className}`}
      aria-label="Inquire about this piece with Blank Seoul Concierge"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-white border border-[#E8DFC8] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#18181B] transition-all shadow-2xs text-sm">
          💬
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-[#18181B] group-hover:text-[#18181B] flex items-center gap-1.5">
            <span>Inquire About This Piece</span>
            <span className="hidden sm:inline-block text-[9.5px] font-bold uppercase tracking-wider text-[#C25E38] bg-[#F4EFE6] px-1.5 py-0.5 rounded-md border border-[#E8DFC8]">
              Live Translation
            </span>
          </div>
          <p className="text-[10.5px] text-[#71717A] truncate">
            Custom sizing, insured shipping, or bespoke artisan requests
          </p>
        </div>
      </div>
      <div className="text-xs font-bold text-[#71717A] group-hover:text-[#18181B] group-hover:translate-x-0.5 transition-all shrink-0 pl-2">
        →
      </div>
    </button>
  );
}
