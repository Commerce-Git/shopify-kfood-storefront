import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Learn about our shipping process, delivery times, and tracking for Blank Seoul boxes shipped from Seoul, Korea.",
};

export default function ShippingPolicyPage() {
  return (
    <>
      <h1 className="heading-md text-dark mb-6">Shipping Policy</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: April 2026</p>

      <h2>Shipping Origin & Carriers</h2>
      <p>
        All orders are shipped directly from Seoul, South Korea. We partner with Korea Post to offer
        dependable international shipping services:
      </p>
      <ul>
        <li>
          <strong>Korea Post K-Packet (Standard International):</strong> Ideal for lightweight artisan accessories
          and curation boxes under 2kg. Fast, tracked airmail service.
        </li>
        <li>
          <strong>Korea Post EMS (Express Mail Service):</strong> Expedited international courier service
          for priority orders and heavier items.
        </li>
      </ul>

      <h2>Delivery Times</h2>
      <ul>
        <li><strong>Standard Shipping (K-Packet):</strong> 7–14 business days (US contiguous states)</li>
        <li><strong>Express Shipping (EMS):</strong> 3–7 business days</li>
        <li><strong>Hawaii, Alaska & US Territories:</strong> 10–18 business days</li>
      </ul>
      <p>
        Please note that delivery times are estimates and may vary due to customs
        processing, weather conditions, or local carrier transit times. During peak holiday seasons,
        delivery times may take slightly longer.
      </p>

      <h2>Order Processing & Crafting</h2>
      <p>
        Since our catalog features authentic handcrafted pieces by independent Korean artisans, each
        order undergoes careful artisan preparation and quality inspection in Seoul before dispatch.
        Once your package is packed and handed to the carrier, you will receive a shipping confirmation email
        with your tracking number.
      </p>

      <h2>Tracking Your Order</h2>
      <p>
        Every shipment includes end-to-end tracking. You can track your order in real-time through our{" "}
        <a href="/order-lookup">
          Order Tracking Portal
        </a>
        , via{" "}
        <a href="https://t.17track.net" target="_blank" rel="noopener noreferrer">
          17Track
        </a>
        , or directly through USPS / your local national postal service website once the package arrives in your destination country.
      </p>

      <h2>Shipping Costs</h2>
      <p>
        We are currently offering <strong>Free International Shipping</strong> on all our
        box orders via Korea Post EMS. There are no hidden shipping fees calculated
        at checkout.
      </p>

      <h2>Customs & Duties</h2>
      <p>
        Packages valued under $800 USD are generally exempt from US customs duties for
        personal imports. Our boxes are well below this threshold. In rare cases,
        there may be a small processing fee charged by the carrier. Any such fees are the
        responsibility of the buyer.
      </p>

      <h2>Lost or Delayed Packages</h2>
      <p>
        If your package has not arrived within 15 business days of shipment, please contact
        us at{" "}
        <a href="mailto:support@blankseoul.com">support@blankseoul.com</a> with your order
        number, and we will investigate with the carrier.
      </p>
    </>
  );
}
