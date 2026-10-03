import Image from "next/image";

export default function BrandStory() {
  return (
    <section className="py-24 px-4 bg-transparent text-white" id="brand-story">
      <div className="max-w-[1000px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: Curator Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src="/assets/brand-story-craft.png"
                alt="Products Made in Korea — Blank Seoul"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-xl -z-10" />
          </div>

          {/* Right: Our Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block px-3 py-1 bg-white/10 text-primary-light border border-white/15 text-xs font-bold uppercase tracking-widest rounded-full mb-2">
              Our Story
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Made in Korea. Shipped from Korea.
            </h2>

            <div className="w-12 h-1 bg-primary rounded-full my-8"></div>

            <div className="space-y-5 text-lg text-white/80 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                We curate products made in Korea, from everyday essentials to distinctive design objects.
              </p>
              <p>
                Korean makers, designers, brands and manufacturers bring a wide range of products to everyday life. We help global shoppers discover their collections.
              </p>
              <p className="text-white font-medium">
                <strong>Blank Seoul</strong> connects you with products <strong>made in Korea</strong> and <strong>shipped directly from Korea</strong>.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="font-semibold text-white text-xl" style={{ fontFamily: "var(--font-heading)" }}>
                — Blank Seoul
              </p>
              <p className="text-sm text-white/50 uppercase tracking-widest mt-1">
                Made in Korea · Shipped from Korea
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
