import type { Metadata } from "next";
import Link from "next/link";
import { CANCEL_WINDOW_HOURS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description:
    "Learn about our 3-hour zero-risk cancellation, 30-day delivery protection, and hassle-free refund process for Blank Seoul craft orders.",
};

export default function ReturnPolicyPage() {
  return (
    <>
      <h1 className="heading-md text-dark mb-4">Return & Refund Policy</h1>
      <p className="text-sm text-text-muted mb-6">Last updated: August 2026</p>

      {/* 2026 Modern Fast Facts Summary Grid */}
      <div className="bg-[#FAF9F6] border border-[#E8DFC8] rounded-2xl p-5 sm:p-6 mb-8 shadow-2xs not-prose">
        <h3
          className="text-xs font-bold uppercase tracking-wider text-[#C25E38] mb-3 flex items-center gap-1.5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span>⚡</span> Returns at a Glance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#3F3F46]">
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">⚡</span>
            <div>
              <strong className="block text-[#18181B] font-bold">1-Click Cancellation</strong>
              <span>100% full refund within {CANCEL_WINDOW_HOURS} hours of order</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">🛡️</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Guarantee Window</strong>
              <span>30-Day Safe Delivery & Protection Guarantee</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">📦</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Damaged / Defective</strong>
              <span className="text-[#2E7D32] font-semibold">100% Free Reshipment or Full Refund</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E8DFC8]/60">
            <span className="text-base shrink-0">⏱️</span>
            <div>
              <strong className="block text-[#18181B] font-bold">Refund Timeline</strong>
              <span>Processed in 3–5 business days to original card</span>
            </div>
          </div>
        </div>
      </div>

      <h2>1. 3-Hour Zero-Risk Cancellation (Before Dispatch)</h2>
      <p>
        We want you to shop with complete peace of mind. You may cancel your order for a <strong>100% full refund</strong> within{" "}
        <strong>{CANCEL_WINDOW_HOURS} hours</strong> of placing your order — no questions asked.
      </p>
      <p>
        To cancel yourself in one click, simply visit your{" "}
        <Link href="/account" className="font-bold underline text-[#C25E38]">
          Account Dashboard
        </Link>{" "}
        and click <strong>&quot;Cancel this order&quot;</strong>. Your refund will be initiated immediately.
        You may also email us at <a href="mailto:support@blankseoul.com">support@blankseoul.com</a> before your package is dispatched.
      </p>

      <h2>2. 30-Day Safe Delivery & Damage Protection</h2>
      <p>
        Every piece sent from Seoul is packaged with rigorous protective materials. In the rare event that your item arrives damaged, defective, or incorrect, you are fully covered under our <strong>30-Day Safe Delivery Protection</strong>. Simply notify our support team within <strong>30 days of delivery</strong>.
      </p>
      
      {/* 3-Step Hassle-Free Visual Flow */}
      <div className="bg-[#FAF9F6] border border-[#E8DFC8]/80 rounded-2xl p-5 my-5 not-prose">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#18181B] mb-3">
          📋 3-Step Hassle-Free Resolution Flow
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#3F3F46]">
          <div className="bg-white p-3 rounded-xl border border-[#E8DFC8]/60 space-y-1">
            <span className="w-5 h-5 rounded-full bg-[#C25E38] text-white flex items-center justify-center text-[10px] font-bold">1</span>
            <strong className="block text-[#18181B] font-bold pt-1">Take Photos</strong>
            <p className="text-[11px] text-[#71717A]">Capture 1–2 clear photos of the damaged item & outer packaging.</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#E8DFC8]/60 space-y-1">
            <span className="w-5 h-5 rounded-full bg-[#C25E38] text-white flex items-center justify-center text-[10px] font-bold">2</span>
            <strong className="block text-[#18181B] font-bold pt-1">Email Support</strong>
            <p className="text-[11px] text-[#71717A]">Send order # and photos to <span className="text-[#C25E38] font-medium">support@blankseoul.com</span>.</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#E8DFC8]/60 space-y-1">
            <span className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[10px] font-bold">3</span>
            <strong className="block text-[#18181B] font-bold pt-1">24h Resolution</strong>
            <p className="text-[11px] text-[#71717A]">Receive 100% free expedited replacement or full refund. No return shipping hassle.</p>
          </div>
        </div>
      </div>

      <p>
        <strong>No International Return Shipping Required:</strong> You do not need to pay expensive international return postage to ship damaged goods back to Korea. Once verified via photo, we resolve it immediately.
      </p>

      <h2>3. Lost or Delayed Package Resolution</h2>
      <p>
        All orders include end-to-end barcode tracking via Korea Post and domestic postal partners (such as USPS in the US).
        If your tracking shows no updates for 15 business days, or if it is marked as delivered but cannot be located, please contact us within <strong>30 days of shipment</strong>. We will directly handle the courier investigation and arrange a <strong>free expedited reshipment or full refund</strong>.
      </p>

      <h2>4. Non-Refundable Situations</h2>
      <p>
        Due to direct international dispatch from independent Seoul ateliers and international customs logistics, we cannot accept returns or issue refunds in the following scenarios:
      </p>
      <ul>
        <li>Change of mind after your order has been dispatched from Seoul</li>
        <li>Items showing clear signs of customer misuse, modification, or intentional damage</li>
        <li>Incorrect shipping address provided by the customer at checkout</li>
        <li>Parcels refused or unclaimed at destination customs or local delivery offices</li>
      </ul>

      <h2>5. Refund Processing Timeline</h2>
      <p>
        Approved refunds are processed through Shopify Payments within <strong>3–5 business days</strong> and returned to your original payment method (Credit Card, PayPal, Apple Pay, Google Pay).
        Please allow an additional 5–10 business days for the credit to appear on your bank statement depending on your financial institution.
      </p>

      <h2>6. Dedicated Concierge Support</h2>
      <p>
        For any questions regarding cancellations, returns, or order protection, our dedicated support team is here to assist you:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:support@blankseoul.com">support@blankseoul.com</a>
        </li>
        <li>
          <strong>Response Time:</strong> Within 24 hours (Monday – Friday)
        </li>
        <li>
          <strong>Order Tracking:</strong>{" "}
          <Link href="/order-lookup">Blank Seoul Order Lookup Portal</Link>
        </li>
      </ul>
    </>
  );
}
