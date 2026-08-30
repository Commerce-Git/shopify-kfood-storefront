import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service and legal agreements for Blank Seoul, operated by Blank Palette LLC.",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="heading-md text-dark mb-4">Terms of Service</h1>
      <p className="text-sm text-text-muted mb-6">Last updated: August 2026</p>

      {/* 2026 Modern Fast Facts Summary Grid */}
      <div className="bg-[#FAF9F6] border border-[#E8DFC8] rounded-2xl p-5 sm:p-6 mb-8 shadow-2xs not-prose">
        <h3
          className="text-xs font-bold uppercase tracking-wider text-[#C25E38] mb-3 flex items-center gap-1.5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span>⚡</span> Terms at a Glance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#3F3F46]">
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">🏢</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Operator</strong>
              <span>Blank Palette LLC (Sheridan, WY, USA)</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">🔒</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Checkout Security</strong>
              <span>PCI-DSS Level 1 Encrypted via Shopify</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">⚖️</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Governing Law</strong>
              <span>State of Wyoming, United States</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">🛡️</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Consumer Protection</strong>
              <span>30-Day Safe Delivery & Protection Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <h2>1. Agreement to Terms & Platform Scope</h2>
      <p>
        By accessing or purchasing from the Blank Seoul website, operated by Blank Palette LLC (&quot;Blank Seoul&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;),
        you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not access or use our store.
      </p>

      <h2>2. Products, Pricing & Natural Craft Characteristics</h2>
      <p>
        Blank Seoul curates authentic artisan accessories, traditional textiles, lifestyle items, and craft goods directly from verified independent Korean craft studios and ateliers:
      </p>
      <ul>
        <li>All product prices are listed in US Dollars (USD) and exclude local taxes where applicable.</li>
        <li>We reserve the right to update product availability, collections, and pricing without prior notice.</li>
        <li>
          <strong>Organic & Natural Variations:</strong> Many of our items incorporate natural materials such as genuine mother-of-pearl, hand-loomed or jacquard fabrics, natural horn, and hand-finished brass.
          Subtle organic variations in color tone, wood grain, or texture are inherent hallmarks of artisanal craftsmanship and make each piece unique.
        </li>
      </ul>

      <h2>3. Orders, Secure Payments & Cancellation</h2>
      <p>
        All transactions are securely processed through Shopify Payments using industry-standard 256-bit SSL encryption (PCI-DSS Level 1 compliant).
        We do not store or have direct access to your full credit card numbers.
      </p>
      <p>
        <strong>3-Hour Self-Cancellation:</strong> You may cancel any order for a 100% full refund within 3 hours of placement directly through your{" "}
        <Link href="/account" className="font-bold underline text-[#C25E38]">
          Account Dashboard
        </Link>.
      </p>

      <h2>4. International Shipping & Customs</h2>
      <p>
        All orders are dispatched directly from our international fulfillment hub in Seoul, South Korea via Korea Post (K-Packet & EMS).
        Please review our dedicated <Link href="/policies/shipping">Shipping Policy</Link> for detailed transit times, tracking procedures, and customs guidelines.
      </p>

      <h2>5. Returns, Refunds & 30-Day Guarantee</h2>
      <p>
        Your purchases are protected under our comprehensive <strong>30-Day Safe Delivery & Protection Guarantee</strong>.
        Please review our dedicated <Link href="/policies/returns">Return & Refund Policy</Link> for full resolution procedures for damaged or delayed parcels.
      </p>

      <h2>6. Intellectual Property & Master Atelier Rights</h2>
      <p>
        All original artwork, handcrafted designs, pattern motifs, atelier trademarks, photographs, and branding on this website
        are the protected intellectual property of Blank Palette LLC and its partnering Korean master studios (including Barneulkkot Lalabi, Miyu, Kkamagwi, and Sosimhan Gomson).
        Unauthorized reproduction, scraping, copying, or commercial distribution of any visual or textual assets without written permission is strictly prohibited.
      </p>

      <h2>7. Product Safety, Material Care & Guidelines</h2>
      <p>
        Our collections are designed for lifestyle, aesthetic, and accessory use:
      </p>
      <ul>
        <li>
          <strong>Jewelry & Metal Care:</strong> Keep brass and mother-of-pearl items dry and away from harsh household chemicals, perfumes, or saltwater. Wipe gently with a soft micro-fiber cloth.
        </li>
        <li>
          <strong>Textile Care:</strong> Hand-wash or spot-clean delicate embroidered or jacquard fabrics with mild detergent in cold water. Lay flat to dry out of direct sunlight.
        </li>
        <li>
          <strong>Safety Notice:</strong> Accessories containing small parts or metal components are not toys and should be kept away from unattended young children or infants. Products are strictly not intended for ingestion.
        </li>
      </ul>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Blank Seoul and Blank Palette LLC shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use our products or website.
        Our total aggregate liability for any claim shall not exceed the total amount paid by you for the specific order giving rise to such claim.
      </p>

      <h2>9. Governing Law & Jurisdiction</h2>
      <p>
        These Terms of Service shall be governed by and construed in accordance with the laws of the State of Wyoming, United States, without regard to principles of conflicts of law.
        Any legal proceeding or dispute arising out of these terms shall be submitted to the exclusive jurisdiction of the state or federal courts located in Sheridan County, Wyoming.
      </p>

      <h2>10. Corporate Legal Contact</h2>
      <p>
        If you have questions regarding these Terms of Service or corporate inquiries, please contact our legal and customer relations team:
      </p>
      <p className="bg-white p-4 rounded-xl border border-[#E8DFC8]/60 text-xs text-[#3F3F46] not-prose space-y-1">
        <strong className="block text-[#18181B] font-bold text-sm">Blank Palette LLC</strong>
        <span>30 N Gould St, STE R, Sheridan, WY 82801, USA</span>
        <br />
        <span>Email: <a href="mailto:support@blankseoul.com" className="text-[#C25E38] font-medium underline">support@blankseoul.com</a></span>
      </p>
    </>
  );
}
