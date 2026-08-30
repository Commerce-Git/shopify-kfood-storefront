import type { Metadata } from "next";
import FAQ from "../components/FAQ";

export const metadata: Metadata = {
  title: "FAQ & Help Center",
  description:
    "Frequently asked questions about Blank Seoul — authentic Korean artisan crafts, direct Seoul dispatch, 30-Day Safe Delivery Guarantee, customs, and care.",
};

export default function FAQPage() {
  return (
    <div className="pt-28 sm:pt-36 min-h-screen bg-[#FBF9F5]">
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-[#E8DFC8]/60">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
          <span className="text-[#C25E38] text-xs font-bold uppercase tracking-widest mb-3 block">
            Help Center & Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18181B] tracking-tight mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Frequently Asked <span className="text-[#C25E38]">Questions</span>
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-xl mx-auto">
            Everything you need to know about our Seoul artisan curation, 100% free tracked shipping, and 30-Day Protection Guarantee.
          </p>
        </div>
      </section>

      {/* Full FAQ with Category Filter */}
      <FAQ showAll />
    </div>
  );
}
