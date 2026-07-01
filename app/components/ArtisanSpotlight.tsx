export default function ArtisanSpotlight() {
  return (
    <section className="py-24 bg-white" id="why-blank-seoul">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 block">
            Why Blank Seoul
          </span>
          <h2 className="heading-lg text-dark mb-4">
            Not Just Products. A Direct Line to Korea.
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            We cut out the middlemen, the factories, and the guesswork. Here&apos;s what makes us different.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Prop 1 */}
          <div className="text-center group">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-dim border border-border-light flex items-center justify-center text-4xl group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
              🇰🇷
            </div>
            <h3
              className="text-xl font-bold text-dark mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              100% Made in Korea
            </h3>
            <p className="text-text-muted leading-relaxed text-sm max-w-xs mx-auto">
              Every piece is handcrafted by independent Korean artisans in their own workshops. No factories. No mass production. Just real human craftsmanship.
            </p>
          </div>

          {/* Prop 2 */}
          <div className="text-center group">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-dim border border-border-light flex items-center justify-center text-4xl group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
              ✈️
            </div>
            <h3
              className="text-xl font-bold text-dark mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Direct from Seoul
            </h3>
            <p className="text-text-muted leading-relaxed text-sm max-w-xs mx-auto">
              Your order is packed and shipped straight from Korea to your doorstep. No warehouses in between, no middlemen inflating the price.
            </p>
          </div>

          {/* Prop 3 */}
          <div className="text-center group">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-dim border border-border-light flex items-center justify-center text-4xl group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
              🤲
            </div>
            <h3
              className="text-xl font-bold text-dark mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Made to Order
            </h3>
            <p className="text-text-muted leading-relaxed text-sm max-w-xs mx-auto">
              Each item is crafted after you place your order. That&apos;s why every piece feels personal — because it was literally made for you.
            </p>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-16 pt-10 border-t border-border-light flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">✓</span>
            Tracking number provided
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">✓</span>
            7–14 business day delivery
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">✓</span>
            Secure checkout via Shopify
          </div>
        </div>
      </div>
    </section>
  );
}
