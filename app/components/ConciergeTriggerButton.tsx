'use client';

import React from 'react';
import { triggerHaptic } from '@/lib/haptics';
import { openSupport } from '../../lib/inquiries/openSupport';

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
      openSupport(detail);
    }
  };

  if (variant === 'artist-hero') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`group px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-full font-bold border border-[#E8DFC8] bg-white hover:bg-[#18181B] text-[#18181B] hover:text-white shadow-2xs hover:border-[#18181B] transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-95 select-none ${className}`}
        aria-label={`Ask customer support about ${artistName || 'this maker'}`}
      >
        <span className="text-sm group-hover:scale-110 transition-transform">✉️</span>
        <span>Ask About the Work</span>
      </button>
    );
  }

  if (variant === 'pdp-atelier') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`px-4 py-2 sm:py-2.5 text-xs rounded-full font-bold border border-[#E8DFC8] bg-white hover:bg-[#18181B] text-[#18181B] hover:text-white shadow-2xs hover:border-[#18181B] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 shrink-0 select-none ${className}`}
        aria-label={`Ask customer support about ${artistName || 'this maker'}`}
      >
        <span className="text-xs">💬</span>
        <span>Ask About the Work</span>
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
        <span>Ask Customer Support</span>
      </button>
    );
  }

  return <button type="button" onClick={handleClick}
    aria-label="Ask customer support about this item"
    className={`inline-flex min-h-11 items-center gap-2 px-1 text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-900 focus-visible:outline-2 ${className}`}>
    Ask about this item <span aria-hidden="true">→</span>
  </button>;
}
