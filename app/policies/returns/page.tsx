import type { Metadata } from "next";
import { CANCEL_WINDOW_HOURS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "Our return and refund policy for Blank Seoul orders.",
};

export default function ReturnPolicyPage() {
  return (
    <>
      <h1 className="heading-md text-dark mb-6">Return & Refund Policy</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: April 2026</p>

      <h2>Order Cancellation (Before Shipment)</h2>
      <p>
        You may cancel your order for a <strong>full refund</strong> within{" "}
        {CANCEL_WINDOW_HOURS} hour{CANCEL_WINDOW_HOURS !== 1 ? "s" : ""} of
        placing your order — no questions asked. Simply go to your{" "}
        <a href="/account">Account page</a> and click &quot;Cancel this
        order.&quot;
      </p>
      <p>
        If your order has not yet been shipped, you may also request cancellation
        by emailing us at{" "}
        <a href="mailto:support@blankseoul.com">support@blankseoul.com</a>.
        We will do our best to cancel before fulfillment.
      </p>

      <h2>Damaged or Defective Items</h2>
      <p>
        If any items in your box arrive damaged or defective, please email us at{" "}
        <a href="mailto:support@blankseoul.com">support@blankseoul.com</a>{" "}
        within <strong>14 days</strong> of delivery with:
      </p>
      <ul>
        <li>Your order number</li>
        <li>Photos of the damaged item(s) and packaging</li>
        <li>A brief description of the issue</li>
      </ul>
      <p>
        After review, we will offer one of the following resolutions:
      </p>
      <ul>
        <li>
          <strong>Full replacement</strong> — We&apos;ll send a new box at no
          charge
        </li>
        <li>
          <strong>Partial refund</strong> — Refund for the affected item(s)
        </li>
        <li>
          <strong>Full refund</strong> — In cases of severe damage
        </li>
      </ul>

      <h2>Lost Packages</h2>
      <p>
        All orders are shipped with EMS tracking. If your tracking shows
        delivered but you did not receive your package, please contact us
        within <strong>7 days</strong> of the delivery date. We will file a
        claim with Korea Post EMS and either resend your order or issue a
        full refund.
      </p>

      <h2>Non-Refundable Situations</h2>
      <p>
        Due to the perishable nature of food products and international
        shipping regulations, we <strong>cannot</strong> accept returns or
        issue refunds in the following cases:
      </p>
      <ul>
        <li>Change of mind after shipment</li>
        <li>Items that have been opened or consumed</li>
        <li>Incorrect shipping address provided by the customer</li>
        <li>Package refused or unclaimed at delivery</li>
      </ul>

      <h2>Refund Timeline</h2>
      <p>
        Approved refunds are processed within <strong>3-5 business days</strong>{" "}
        and returned to the original payment method. Please allow an additional
        5-10 business days for the refund to appear on your bank or credit card
        statement.
      </p>

      <h2>Contact Us</h2>
      <p>
        For any return or refund inquiries, email{" "}
        <a href="mailto:support@blankseoul.com">
          support@blankseoul.com
        </a>{" "}
        with your order number. We respond within 24 hours.
      </p>
    </>
  );
}
