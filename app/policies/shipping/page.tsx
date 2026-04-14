import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Learn about our shipping process, delivery times, and tracking for K-Food snack boxes shipped from Seoul, Korea.",
};

export default function ShippingPolicyPage() {
  return (
    <>
      <h1 className="heading-md text-dark mb-6">Shipping Policy</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: April 2026</p>

      <h2>Shipping Origin</h2>
      <p>
        All orders are shipped directly from Seoul, South Korea. We use Korea Post EMS
        (Express Mail Service) as our primary shipping carrier to ensure fast and reliable
        international delivery.
      </p>

      <h2>Delivery Times</h2>
      <ul>
        <li><strong>United States (Contiguous 48 states):</strong> 5-10 business days</li>
        <li><strong>Hawaii & Alaska:</strong> 7-14 business days</li>
        <li><strong>US Territories:</strong> 10-15 business days</li>
      </ul>
      <p>
        Please note that delivery times are estimates and may vary due to customs
        processing, weather conditions, or carrier delays. During peak seasons
        (holidays, special promotions), delivery times may be slightly longer.
      </p>

      <h2>Order Processing</h2>
      <p>
        Orders are processed within 1-2 business days (Monday-Friday, Korean Standard Time).
        Once your order ships, you will receive a confirmation email with a tracking number.
      </p>

      <h2>Tracking Your Order</h2>
      <p>
        All shipments include full tracking via Korea Post EMS. You can track your package at{" "}
        <a href="https://www.koreapost.go.kr" target="_blank" rel="noopener noreferrer">
          koreapost.go.kr
        </a>{" "}
        or through your local postal service website once it arrives in the US.
      </p>

      <h2>Shipping Costs</h2>
      <p>
        Shipping costs are calculated at checkout based on the weight of your order and
        destination. We occasionally offer free shipping promotions — follow us on social
        media to stay updated!
      </p>

      <h2>Customs & Duties</h2>
      <p>
        Packages valued under $800 USD are generally exempt from US customs duties for
        personal imports. Our snack boxes are well below this threshold. In rare cases,
        there may be a small processing fee charged by the carrier. Any such fees are the
        responsibility of the buyer.
      </p>

      <h2>Lost or Delayed Packages</h2>
      <p>
        If your package has not arrived within 15 business days of shipment, please contact
        us at{" "}
        <a href="mailto:hello@kfoodstore.com">hello@kfoodstore.com</a> with your order
        number, and we will investigate with the carrier.
      </p>
    </>
  );
}
