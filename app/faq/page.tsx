import type { Metadata } from "next";
import FAQ from "../components/FAQ";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about K-Food Store snack boxes — shipping, customs, ingredients, returns, and more.",
};

export default function FAQPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-surface-dim border-b border-border-light">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
          <h1 className="heading-lg text-dark mb-4">
            Frequently Asked{" "}
            <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-text-muted">
            Can&apos;t find what you&apos;re looking for? Email us at{" "}
            <a
              href="mailto:support@seoulsnackbox.com"
              className="text-primary hover:text-primary-hover transition-colors font-medium"
            >
              support@seoulsnackbox.com
            </a>
          </p>
        </div>
      </section>

      {/* Full FAQ */}
      <FAQ showAll />
    </div>
  );
}
