"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShopifyProduct } from "@/lib/shopify/types";
import { getProductImage } from "@/lib/shopify/api";

interface HeroProps {
  products?: ShopifyProduct[];
}

export default function Hero({ products = [] }: HeroProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const displayProducts = products.length > 0 ? products : [];
  // 3-set array for 100% seamless infinite scroll both left and right
  const marqueeProducts = [...displayProducts, ...displayProducts, ...displayProducts];

  // 60fps requestAnimationFrame continuous glide loop + drag support
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || displayProducts.length === 0) return;

    let animationFrameId: number;

    const animate = () => {
      if (!isDragging) {
        const oneThird = slider.scrollWidth / 3;
        if (slider.scrollLeft >= oneThird * 2) {
          slider.scrollLeft -= oneThird;
        } else if (slider.scrollLeft <= 0) {
          slider.scrollLeft += oneThird;
        } else {
          slider.scrollLeft += 1.5; // Auto glide speed
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging, displayProducts.length]);

  // Desktop Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Mobile Touch Drag Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <section
      className="relative w-full min-h-[100svh] flex flex-col justify-center py-16 pt-28 sm:pt-32 md:pt-36 bg-transparent"
      id="hero-section"
    >
      {/* Hero Top Hook Title */}
      <div className="relative z-10 text-center max-w-[1200px] mx-auto px-4 mt-0 sm:mt-1 md:mt-2 mb-4 sm:mb-6">
        <h1
          className="text-sm sm:text-lg md:text-xl font-bold tracking-widest text-white/90 uppercase leading-relaxed"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="block">AUTHENTIC HANDCRAFTED MASTERPIECES</span>
          <span className="block mt-1 bg-gradient-to-r from-[#F5D0A9] via-[#E8AA70] to-[#C77B4A] bg-clip-text text-transparent">
            DIRECT FROM KOREA.
          </span>
        </h1>
      </div>

      {/* 100% Interactive Full-Bleed Continuous Track Slider */}
      <div
        className="relative z-10 w-full overflow-hidden py-4 sm:py-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className="flex gap-6 overflow-x-auto scrollbar-none py-2 px-4 select-none cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {marqueeProducts.length > 0 ? (
            marqueeProducts.map((product, idx) => (
              <div
                key={`${product.id || idx}-${idx}`}
                className="flex-none w-[320px] sm:w-[420px] md:w-[480px] lg:w-[520px] group bg-white/10 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-white/10 shadow-2xl select-none transition-transform duration-500 hover:-translate-y-3 transform-gpu"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <Link href={`/product/${product.handle}`} className="block select-none" draggable={false}>
                  {/* Pure Image Artwork Container — 100% Pure Visual, No Text, No Overlays */}
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-black/20 pointer-events-none">
                    <Image
                      src={getProductImage(product)}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 select-none transform-gpu"
                      sizes="(max-width: 768px) 340px, 520px"
                      priority={idx < 3}
                      loading={idx < 3 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="w-full h-96 flex items-center justify-center text-white/50 border border-white/10 rounded-3xl">
              Loading 8 Heritage Masterpieces...
            </div>
          )}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <Link
        href="#artisan-spotlight"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce-slow z-20 cursor-pointer hover:opacity-100 transition-opacity"
        aria-label="Scroll down to Section 1"
      >
        <span className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">Scroll Down</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-60"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </Link>
    </section>
  );
}
