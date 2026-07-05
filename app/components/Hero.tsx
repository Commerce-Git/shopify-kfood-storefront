"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative w-full min-h-[100svh] flex items-center overflow-hidden"
      id="hero-section"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1A15] via-[#1A2E25] to-[#0D1A14]" />

      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Glow accents — warm green tones */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Content — Split Layout */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-20 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left — Text & CTA */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            {/* Badge */}
            <div
              className="inline-flex self-center lg:self-start items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium animate-fade-in"
              style={{ animationDelay: "0.2s", animationFillMode: "both" }}
            >
              <span>🇰🇷</span>
              <span>Handcrafted in Korea</span>
              <span>✈️</span>
            </div>

            {/* Main Heading */}
            <h1
              className="heading-xl text-white animate-fade-in-up"
              style={{ animationDelay: "0.4s", animationFillMode: "both" }}
            >
              Artisan Crafts,{" "}
              <span className="gradient-text">Direct from Seoul.</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up"
              style={{
                fontFamily: "var(--font-body)",
                animationDelay: "0.6s",
                animationFillMode: "both",
              }}
            >
              Discover authentic pieces from independent Korean artisans. <strong className="text-white font-semibold">Every item is 100% made to order</strong> and <strong className="text-white font-semibold">shipped directly from Seoul</strong> to your door.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up"
              style={{ animationDelay: "0.8s", animationFillMode: "both" }}
            >
              <Link href="/collections" className="btn-primary text-center">
                Shop Now →
              </Link>
              <Link
                href="#collections"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white/90 border border-white/20 hover:bg-white/10 transition-all duration-300 text-sm"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Explore Collections
              </Link>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-8 sm:gap-10 justify-center lg:justify-start mt-4 animate-fade-in-up"
              style={{ animationDelay: "1s", animationFillMode: "both" }}
            >
              {[
                { value: "100%", label: "Made to Order" },
                { value: "Direct", label: "from Seoul" },
                { value: "8+", label: "Korean Artisans" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div
                    className="text-xl sm:text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Lifestyle Image */}
          <div
            className="relative flex justify-center lg:justify-end animate-fade-in-up"
            style={{ animationDelay: "0.5s", animationFillMode: "both" }}
          >
            <div className="relative w-full max-w-[520px] aspect-square lg:aspect-[4/5]">
              {/* Glow behind */}
              <div className="absolute inset-8 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

              {/* Single high-impact lifestyle image */}
              <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src="/assets/blank_seoul_symbol.png"
                  alt="Korean artisan traditional lifestyle"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow z-10">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
