"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const overlay = hero.querySelector<HTMLDivElement>(".hero-overlay");
      if (overlay) {
        overlay.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      id="hero-section"
    >
      {/* Background with gradient fallback */}
      <div
        className="hero-overlay absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-bg.webp')",
          backgroundColor: "#1A1A2E",
        }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />

      {/* Animated Background Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-400/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8 animate-fade-in"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        >
          <span>🇰🇷</span>
          <span>Direct from Seoul, Korea</span>
          <span>✈️</span>
        </div>

        {/* Main Heading */}
        <h1
          className="heading-xl text-white mb-6 animate-fade-in-up"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          Gift a Piece of{" "}
          <span className="gradient-text">Korea</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
          style={{
            fontFamily: "var(--font-body)",
            animationDelay: "0.6s",
            animationFillMode: "both",
          }}
        >
          Discover curated boxes of Korea&apos;s most-loved snacks, from trending
          convenience store picks to hidden gems. Shipped fresh to your door.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.8s", animationFillMode: "both" }}
        >
          <Link
            href="#product-showcase"
            className="btn-primary text-lg px-10 py-4 animate-pulse-neon"
          >
            Explore the Box
          </Link>
          <Link
            href="/about"
            className="btn-secondary text-white border-white/30 hover:border-white hover:text-white"
          >
            Our Story
          </Link>
        </div>

        {/* Stats */}
        <div
          className="mt-16 flex items-center justify-center gap-8 sm:gap-12 animate-fade-in-up"
          style={{ animationDelay: "1s", animationFillMode: "both" }}
        >
          {[
            { value: "10+", label: "Unique Snacks" },
            { value: "🇺🇸", label: "US Shipping" },
            { value: "FDA", label: "Compliant" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-white/50 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
