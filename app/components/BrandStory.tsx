import Image from "next/image";

export default function BrandStory() {
  return (
    <section className="py-24 px-4 bg-surface-dim text-dark" id="brand-story">
      <div className="max-w-[1000px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Curator Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src="/assets/story-v3.png" 
                alt="Korean artisan crafts — Blank Seoul"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-xl -z-10" />
          </div>

          {/* Right: Our Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-2">
              Our Story
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-dark" style={{ fontFamily: "var(--font-heading)" }}>
              &quot;True Korean beauty isn&apos;t found in factory machines, but in the quiet workshops of narrow alleys.&quot;
            </h2>

            <div className="w-12 h-1 bg-primary rounded-full my-8"></div>

            <div className="space-y-5 text-lg text-text-muted leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Among thousands of mass-produced souvenirs, I wander the streets of Seoul to find that one piece with a soul. 
              </p>
              <p>
                I discovered incredible artisans who pour their hearts into every stitch, every knot, and every carving. They are preserving centuries of Korean heritage, yet their work remains hidden from the global stage.
              </p>
              <p className="text-dark font-medium">
                That is why I created <strong>Blank Seoul</strong>. We are not a factory. Every piece you see here is <strong>100% made in Korea</strong> by independent artisans, and <strong>shipped directly from Seoul</strong> to your door.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-border-light">
              <p className="font-semibold text-dark text-xl" style={{ fontFamily: "var(--font-heading)" }}>
                — Blank Seoul
              </p>
              <p className="text-sm text-text-muted uppercase tracking-widest mt-1">
                Direct from Seoul
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
