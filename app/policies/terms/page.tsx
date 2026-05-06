import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using K-Food Store.",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="heading-md text-dark mb-6">Terms of Service</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: April 2026</p>

      <h2>Agreement to Terms</h2>
      <p>
        By accessing or using the K-Food Store website and services, you agree to be
        bound by these Terms of Service. If you do not agree to these terms, please do
        not use our website.
      </p>

      <h2>Products & Pricing</h2>
      <ul>
        <li>All prices are listed in US Dollars (USD)</li>
        <li>We reserve the right to change prices at any time without prior notice</li>
        <li>Product images are for illustration purposes; actual box contents may vary</li>
        <li>We reserve the right to limit quantities per order</li>
      </ul>

      <h2>Orders & Payment</h2>
      <p>
        All payments are processed securely through Shopify. By placing an order, you
        represent that you are at least 18 years old or have parent/guardian consent.
        We reserve the right to refuse or cancel any order at our discretion.
      </p>

      <h2>Shipping & Delivery</h2>
      <p>
        Please refer to our{" "}
        <a href="/policies/shipping">Shipping Policy</a> for detailed information
        about shipping times, costs, and procedures.
      </p>

      <h2>Returns & Refunds</h2>
      <p>
        Please refer to our{" "}
        <a href="/policies/returns">Return Policy</a> for detailed information
        about returns, exchanges, and refunds.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content on this website — including text, images, logos, and design — is the
        property of Blank Palette LLC and is protected by applicable copyright and
        trademark laws. You may not reproduce, distribute, or use any content without
        our prior written consent.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        K-Food Store and Blank Palette LLC shall not be liable for any indirect,
        incidental, or consequential damages arising from the use of our website or
        products. Our total liability shall not exceed the amount you paid for your order.
      </p>

      <h2>Allergen Disclaimer</h2>
      <p>
        Our snack boxes may contain common allergens including but not limited to: nuts,
        soy, wheat, milk, eggs, sesame, and shellfish. Please check individual product
        labels for specific allergen information. We are not responsible for allergic
        reactions to any products.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms of Service shall be governed by and construed in accordance with the
        laws of the State of Wyoming, United States, without regard to conflict of law provisions.
        Any disputes shall be resolved in the courts of Sheridan County, Wyoming.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these terms, please contact us at{" "}
        <a href="mailto:thec9rqwer@gmail.com">thec9rqwer@gmail.com</a>.
      </p>
    </>
  );
}
