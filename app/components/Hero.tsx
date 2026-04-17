"use client";

import Image from "next/image";
import BuyButton from "./BuyButton";

interface HeroProps {
  variantId?: string;
}

export default function Hero({ variantId }: HeroProps) {
  return (
    <section
      className="relative w-full min-h-screen flex items-center overflow-hidden"
      id="hero-section"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0A1A] via-[#1A1A2E] to-[#0D0D1A]" />

      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Glow accents */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#1E3A5F]/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Content — Split Layout */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-20 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left — Text & CTA */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            {/* Urgency Badge */}
            <div
              className="inline-block bg-orange-500/10 text-orange-400 font-bold px-4 py-2 rounded-lg border border-orange-500/20 text-sm w-fit mx-auto lg:mx-0 self-center lg:self-start"
            >
              ✈️ Order now to catch this week's direct shipment from Seoul
            </div>

            {/* Badge */}
            <div
              className="inline-flex self-center lg:self-start items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium animate-fade-in"
              style={{ animationDelay: "0.2s", animationFillMode: "both" }}
            >
              <span>🇰🇷</span>
              <span>Direct from Seoul, Korea</span>
              <span>✈️</span>
            </div>

            {/* Main Heading */}
            <h1
              className="heading-xl text-white animate-fade-in-up"
              style={{ animationDelay: "0.4s", animationFillMode: "both" }}
            >
              Stop Watching K-Dramas.{" "}
              <span className="gradient-text">Start Tasting Them.</span>
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
              Seoul&apos;s viral convenience store snacks — the ones you see in
              every K-Drama — curated in one premium box and shipped to your door.
            </p>

            {/* Price hint */}
            <div
              className="flex items-baseline gap-3 justify-center lg:justify-start animate-fade-in-up"
              style={{ animationDelay: "0.7s", animationFillMode: "both" }}
            >
              <span className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                $45.00
              </span>
            </div>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up"
              style={{ animationDelay: "0.8s", animationFillMode: "both" }}
            >
              {variantId ? (
                <BuyButton
                  variantId={variantId}
                  label="Yes! Send Me The Snack Box 🎁"
                  size="lg"
                  showSecureBadge={false}
                />
              ) : (
                <span className="btn-primary text-lg px-10 py-4 opacity-70 cursor-not-allowed">
                  Coming Soon
                </span>
              )}
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-8 sm:gap-10 justify-center lg:justify-start mt-4 animate-fade-in-up"
              style={{ animationDelay: "1s", animationFillMode: "both" }}
            >
              {[
                { value: "10+", label: "Unique Snacks" },
                { value: "5-10", label: "Day Delivery" },
                { value: "FDA", label: "Compliant" },
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

          {/* Right — Box Image */}
          <div
            className="relative flex justify-center lg:justify-end animate-fade-in-up"
            style={{ animationDelay: "0.5s", animationFillMode: "both" }}
          >
            <div className="relative w-full max-w-[520px] aspect-square">
              {/* Glow behind box */}
              <div className="absolute inset-8 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

              <Image
                src="/images/seoul-snack-box.jpg"
                alt="The Ultimate Seoul Box — Premium Korean Treats"
                fill
                className="object-contain drop-shadow-2xl relative z-10"
                sizes="(max-width: 1024px) 90vw, 45vw"
                priority
              />
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
