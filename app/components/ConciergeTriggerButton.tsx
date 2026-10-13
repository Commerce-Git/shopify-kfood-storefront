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
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-1 py-2.5 text-sm font-medium leading-5 text-zinc-700 underline underline-offset-4 transition-colors hover:text-[#2D4A3E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2D4A3E] ${className}`}
        aria-label="Ask customer support about this item"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></svg>
        <span>Ask about this item</span>
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
