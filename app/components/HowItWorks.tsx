export default function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-surface-dim border-y border-border-light">
      <div className="max-w-[1000px] mx-auto text-center">
        <h2 className="heading-md text-dark mb-4">
          From the Artisan&apos;s Hands to Your Door
        </h2>
        <p className="text-text-muted mb-12 max-w-2xl mx-auto">
          We handle the logistics so our artisans can focus on what they do best: creating beautiful things. Here is how your order reaches you safely.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-[1px] bg-border-light -translate-y-[20px] z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center bg-surface-dim px-4">
            <div className="w-16 h-16 rounded-full bg-white border border-border-light shadow-sm flex items-center justify-center text-3xl mb-4 text-primary">
              🤲
            </div>
            <h3 className="font-bold text-dark mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              1. Handcrafted
            </h3>
            <p className="text-sm text-text-muted">
              Made with care in the artisan&apos;s local studio. No factories, no mass production.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center bg-surface-dim px-4">
            <div className="w-16 h-16 rounded-full bg-white border border-border-light shadow-sm flex items-center justify-center text-3xl mb-4 text-primary">
              📦
            </div>
            <h3 className="font-bold text-dark mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              2. Curated & Packed
            </h3>
            <p className="text-sm text-text-muted">
              We inspect each item for quality in Seoul and wrap it securely in our premium packaging.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center bg-surface-dim px-4">
            <div className="w-16 h-16 rounded-full bg-white border border-border-light shadow-sm flex items-center justify-center text-3xl mb-4 text-primary">
              ✈️
            </div>
            <h3 className="font-bold text-dark mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              3. Global Delivery
            </h3>
            <p className="text-sm text-text-muted">
              Shipped directly from Seoul with reliable international shipping. Fully tracked, arriving in 7-14 days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
