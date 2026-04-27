"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How long does shipping take?",
    answer:
      "We ship directly from Seoul, South Korea via Korea Post EMS. Typical delivery time to the US is 5-10 business days. You'll receive a tracking number as soon as your box ships.",
  },
  {
    question: "Do I have to pay customs or duties?",
    answer:
      "In most cases, no! Packages under $800 in value are exempt from customs duties for personal imports to the US. Our snack boxes are well under this threshold. On rare occasions, there may be a small processing fee from the carrier.",
  },
  {
    question: "Are the snacks safe & FDA compliant?",
    answer:
      "Yes! All snacks in our boxes are properly declared with the US FDA through Prior Notice submissions. We only source from established Korean manufacturers with proper food safety certifications.",
  },
  {
    question: "What's the shelf life of the snacks?",
    answer:
      "We carefully curate each box to ensure all items have at least 3+ months of shelf life remaining at the time of delivery. Most sealed Korean snacks have a shelf life of 6-12 months.",
  },
  {
    question: "Can I see what's in the box before buying?",
    answer:
      "Part of the fun is the surprise! We show you the types of snacks you'll receive (sweet, savory, spicy, etc.) but the specific items are a curated surprise. Think of it as a taste adventure!",
  },
  {
    question: "Do you accommodate allergies or dietary restrictions?",
    answer:
      "Currently, our boxes may contain common allergens including nuts, soy, wheat, milk, eggs, and shellfish. We're working on offering allergy-friendly options in the future. Please check the included flavor guide for specific allergen information.",
  },
  {
    question: "What if a snack arrives damaged?",
    answer:
      "We carefully package every box, but if something arrives damaged, just email us with a photo and we'll make it right — either with a replacement or refund for that item. Your satisfaction is our priority!",
  },
  {
    question: "Do you ship outside the US?",
    answer:
      "Currently, we ship to all 50 United States (including Hawaii and Alaska) as well as US Territories. We're planning to expand to Canada, UK, and Australia soon. Join our mailing list to be the first to know!",
  },
];

export default function FAQ({ showAll = false }: { showAll?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const displayItems = showAll ? FAQ_ITEMS : FAQ_ITEMS.slice(0, 5);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section bg-white" id="faq-section">
      <div className="section-inner max-w-3xl">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 block">
            FAQ
          </span>
          <h2 className="heading-lg text-dark mb-4">
            Got{" "}
            <span className="gradient-text">Questions?</span>
          </h2>
          <p className="text-text-muted">
            Everything you need to know about our K-Food snack boxes.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {displayItems.map((item, index) => (
            <div
              key={index}
              className={`
                rounded-xl border transition-all duration-200
                ${
                  openIndex === index
                    ? "border-primary/20 bg-primary/[0.02] shadow-sm"
                    : "border-border-light bg-white hover:border-border"
                }
              `}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={openIndex === index}
                id={`faq-question-${index}`}
              >
                <span
                  className="text-base font-semibold text-dark"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {item.question}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`
                    flex-shrink-0 text-text-muted transition-transform duration-300
                    ${openIndex === index ? "rotate-180" : ""}
                  `}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* Answer */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                <p className="px-6 pb-5 text-sm text-text-muted leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link (only on landing page) */}
        {!showAll && (
          <div className="text-center mt-8">
            <a
              href="/faq"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
            >
              View all questions
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
