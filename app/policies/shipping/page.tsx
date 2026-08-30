import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Learn about our international shipping process, direct Seoul dispatch, delivery times, and tracking for Blank Seoul craft orders.",
};

export default function ShippingPolicyPage() {
  return (
    <>
      <h1 className="heading-md text-dark mb-4">Shipping Policy</h1>
      <p className="text-sm text-text-muted mb-6">Last updated: August 2026</p>

      {/* 2026 Modern Fast Facts Summary Grid */}
      <div className="bg-[#FAF9F6] border border-[#E8DFC8] rounded-2xl p-5 sm:p-6 mb-8 shadow-2xs not-prose">
        <h3
          className="text-xs font-bold uppercase tracking-wider text-[#C25E38] mb-3 flex items-center gap-1.5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span>⚡</span> Shipping at a Glance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#3F3F46]">
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">🇰🇷</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Origin</strong>
              <span>Dispatched direct from Seoul, South Korea</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">✈️</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Transit Time</strong>
              <span>7–14 business days (Tracked Air Express)</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">🎁</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Shipping Cost</strong>
              <span className="text-[#2E7D32] font-semibold">100% FREE Store-wide</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">🛡️</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Delivery Protection</strong>
              <span>30-Day Safe Delivery & Reshipment Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <h2>1. Shipping Origin & Verified Ateliers</h2>
      <p>
        All orders are dispatched directly from our international fulfillment hub in Seoul, South Korea.
        We partner closely with Korea Post to provide reliable, tracked international postal and express courier services:
      </p>
      <ul>
        <li>
          <strong>Korea Post K-Packet (Tracked International Airmail):</strong> Fast, reliable airmail service
          with end-to-end barcode tracking for lightweight artisan accessories, textiles, and craft goods.
        </li>
        <li>
          <strong>Korea Post EMS (Express Mail Service):</strong> Expedited courier priority service for
          larger parcels and high-value atelier collections.
        </li>
      </ul>

      <h2>2. Global Delivery Times & Regional Destinations</h2>
      <p>
        We ship across the globe from our Seoul hub. Estimated transit times by destination region are outlined below:
      </p>
      <ul>
        <li>
          <strong>United States (Contiguous 48 States):</strong> 7–14 business days (Direct Seoul dispatch via Korea Post ➔ USPS Priority · 100% Free Shipping)
        </li>
        <li>
          <strong>United States (Alaska, Hawaii, Puerto Rico, Guam & US Territories):</strong> 10–18 business days
        </li>
        <li>
          <strong>Military Addresses (APO / FPO / DPO):</strong> 12–20 business days
        </li>
        <li>
          <strong>Major International Destinations (Canada, United Kingdom, European Union, Australia, Japan & Singapore):</strong> 8–15 business days (Tracked International Airmail / EMS)
        </li>
        <li>
          <strong>Rest of the World (Custom Concierge Dispatch):</strong> 10–18 business days. If your country is not selectable at checkout, please email our support team at <a href="mailto:support@blankseoul.com">support@blankseoul.com</a> for personalized international courier arrangements.
        </li>
      </ul>
      <p>
        <em>* Note: Delivery estimates are calculated in business days (excluding weekends and statutory public holidays in South Korea and destination countries). Transit times may vary slightly during peak holiday carrier volume or severe weather events.</em>
      </p>

      <h2>3. Order Preparation & Quality Inspection</h2>
      <p>
        Each order features curated pieces from verified Korean craft studios and independent ateliers.
        Every piece undergoes careful quality inspection and secure protective packaging in Seoul before dispatch.
        Orders are typically processed and handed over to the carrier within <strong>1–2 business days</strong>.
        Once dispatched, you will automatically receive a shipping confirmation email containing your active tracking number.
      </p>

      <h2>4. End-to-End Order Tracking</h2>
      <p>
        Every shipment from Blank Seoul includes 100% full-journey barcode tracking. You can track your parcel in real-time through:
      </p>
      <ul>
        <li>
          Our dedicated <a href="/order-lookup">Order Tracking Portal</a>
        </li>
        <li>
          Global postal network tracking via{" "}
          <a href="https://t.17track.net" target="_blank" rel="noopener noreferrer">
            17Track
          </a>
        </li>
        <li>
          Directly through your destination country postal carrier (e.g., USPS in the United States) once the package enters domestic customs.
        </li>
      </ul>

      <h2>5. Shipping Rates & Zero Hidden Fees</h2>
      <p>
        We currently provide <strong>Free International Tracked Shipping</strong> on all orders.
        There are no hidden handling surcharges, unexpected delivery fees, or checkout markups calculated at payment.
      </p>

      <h2>6. Customs, Import Duties & US De Minimis</h2>
      <p>
        Under current United States customs regulations, personal imports valued under $800 USD are generally exempt
        from import duties and tariffs (US De Minimis threshold). Our curated artisan pieces are well within this duty-free threshold.
        For international destinations outside the US, standard local VAT or import regulations of the destination country may apply.
      </p>

      <h2>7. 30-Day Safe Delivery & Lost Package Guarantee</h2>
      <p>
        We take full responsibility for ensuring your order arrives safely at your doorstep. If your package has not arrived
        within 20 business days of dispatch, or if tracking shows delivered but you cannot locate the package, please contact our
        dedicated support team at{" "}
        <a href="mailto:support@blankseoul.com">support@blankseoul.com</a>.
      </p>
      <p>
        Under our <strong>30-Day Safe Delivery Guarantee</strong>, we will immediately investigate with Korea Post and either
        provide a <strong>100% free expedited replacement</strong> or issue a <strong>full refund</strong> to your original payment method.
      </p>
    </>
  );
}
