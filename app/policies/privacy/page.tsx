import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How K-Food Store collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1 className="heading-md text-dark mb-6">Privacy Policy</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: April 2026</p>

      <h2>Introduction</h2>
      <p>
        K-Food Store, operated by Blank Palette LLC, is committed to protecting your
        privacy. This policy explains how we collect, use, and safeguard your personal
        information when you visit our website or make a purchase.
      </p>

      <h2>Information We Collect</h2>
      <p>We collect the following types of information:</p>
      <ul>
        <li><strong>Order Information:</strong> Name, email, shipping address, phone number</li>
        <li><strong>Payment Information:</strong> Processed securely by Shopify — we never store your payment details</li>
        <li><strong>Usage Data:</strong> Pages visited, time on site, device type, browser (via analytics)</li>
        <li><strong>Communication:</strong> Emails, support requests, and any messages you send us</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To process and fulfill your orders</li>
        <li>To send shipping confirmations and tracking updates</li>
        <li>To respond to customer service inquiries</li>
        <li>To improve our website and product offerings</li>
        <li>To send marketing emails (only with your consent)</li>
      </ul>

      <h2>Third-Party Services</h2>
      <p>We use the following third-party services:</p>
      <ul>
        <li><strong>Shopify:</strong> E-commerce and payment processing</li>
        <li><strong>Korea Post EMS:</strong> Shipping and tracking</li>
        <li><strong>Vercel:</strong> Website hosting</li>
      </ul>
      <p>
        These services have their own privacy policies. We encourage you to review them.
      </p>

      <h2>Data Security</h2>
      <p>
        We implement industry-standard security measures to protect your personal
        information. All payment transactions are processed through Shopify&apos;s
        PCI-DSS compliant payment gateway.
      </p>

      <h2>Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Opt out of marketing communications</li>
      </ul>

      <h2>Contact</h2>
      <p>
        For privacy-related inquiries, please contact us at{" "}
        <a href="mailto:support@seoulsnackbox.com">support@seoulsnackbox.com</a>.
      </p>
    </>
  );
}
