"use client";

export default function ArtisanRecruitmentCTA() {
  return (
    <section className="py-20 sm:py-24 bg-[#1A2F25] text-white relative overflow-hidden" id="join-artisan">
      {/* Background Watermark Texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-[1000px] mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/20 text-xs font-bold uppercase tracking-widest mb-6">
          <span>🏛️</span> Creator Partnership Program
        </div>

        {/* Headline */}
        <h2
          className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Are You a Korean Heritage Artisan?{" "}
          <span className="text-[#D4A373] block mt-1">Join Our Global Stage.</span>
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto mt-4 leading-relaxed">
          We empower independent Korean craft masters to reach global collectors without the barriers of foreign languages, international shipping, or currency exchange.
        </p>

        {/* 3 Partner Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-10 text-left">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xs">
            <span className="text-2xl mb-3 block">🌏</span>
            <h4 className="text-sm font-bold text-white mb-1">Global Reach in English & USD</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              We translate your craft story and manage overseas customers, payments, and customs.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xs">
            <span className="text-2xl mb-3 block">📦</span>
            <h4 className="text-sm font-bold text-white mb-1">Hassle-Free Seoul Logistics</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Ship to our domestic Seoul Hub—we handle international express dispatch, tracking, and Hanji wrapping.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xs">
            <span className="text-2xl mb-3 block">🎨</span>
            <h4 className="text-sm font-bold text-white mb-1">Your Dedicated Atelier Identity</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Never hidden behind generic labels. Your studio name, philosophy, and photos are honored.
            </p>
          </div>
        </div>

        {/* CTA Contact Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:contact@blankseoul.com?subject=[Artisan Partnership] 입점 문의"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#C25E38] hover:bg-[#A74B28] text-white font-bold text-sm tracking-wide uppercase transition-all shadow-lg text-center"
          >
            Apply for Atelier Partnership →
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm tracking-wide border border-white/20 transition-all text-center"
          >
            DM Us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
