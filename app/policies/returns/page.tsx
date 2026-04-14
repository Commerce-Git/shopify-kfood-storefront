import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Our return and refund policy for K-Food snack boxes.",
};

export default function ReturnPolicyPage() {
  return (
    <>
      <h1 className="heading-md text-dark mb-6">Return & Refund Policy</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: April 2026</p>

      <h2>Our Guarantee</h2>
      <p>
        We want you to love your K-Food snack box! If there&apos;s an issue with your
        order, we&apos;re here to help.
      </p>

      <h2>Damaged Items</h2>
      <p>
        If any items in your box arrive damaged, please email us at{" "}
        <a href="mailto:hello@kfoodstore.com">hello@kfoodstore.com</a> within 48 hours
        of delivery with:
      </p>
      <ul>
        <li>Your order number</li>
        <li>Photos of the damaged item(s)</li>
        <li>A brief description of the issue</li>
      </ul>
      <p>
        We will either send a replacement item or issue a partial refund for the
        affected product(s).
      </p>

      <h2>Non-Returnable Items</h2>
      <p>
        Due to the perishable nature of food products and international shipping,
        we are unable to accept returns of opened or consumed items. All snack boxes
        are final sale unless items arrive damaged or defective.
      </p>

      <h2>Lost Packages</h2>
      <p>
        If your tracking shows delivery but you did not receive your package, please
        contact us within 7 days. We will work with the carrier to locate your package
        or issue a replacement.
      </p>

      <h2>Cancellations</h2>
      <p>
        Orders can be cancelled within 12 hours of placement for a full refund. After
        that, orders enter our fulfillment process and cannot be cancelled. Please
        contact us as soon as possible if you need to cancel.
      </p>

      <h2>Refund Process</h2>
      <p>
        Approved refunds will be processed within 3-5 business days and returned to the
        original payment method. Please allow an additional 5-10 business days for the
        refund to appear on your statement.
      </p>

      <h2>Contact Us</h2>
      <p>
        For any return or refund inquiries, please email{" "}
        <a href="mailto:hello@kfoodstore.com">hello@kfoodstore.com</a> with your order
        number.
      </p>
    </>
  );
}
