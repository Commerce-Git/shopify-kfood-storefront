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
      "In most cases, no! Packages under $800 in value are exempt from customs duties for personal imports to the US. Our boxes are well under this threshold. On rare occasions, there may be a small processing fee from the carrier.",
  },
  {
    question: "Are the snacks safe & FDA compliant?",
    answer:
      "Yes! All snacks in our boxes are properly declared with the US FDA through Prior Notice submissions. We only source from established Korean manufacturers with proper food safety certifications.",
  },
  {
    question: "What's the shelf life of the snacks?",
    answer:
      "We carefully curate each box to ensure all items have at least 3+ months of shelf life remaining at the time of delivery. Most sealed Korean products have a shelf life of 6-12 months.",
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
            Everything you need to know about Blank Seoul.
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

        {/* Contact / Feedback Form */}
        <FeedbackForm />
      </div>
    </section>
  );
}

// ---- Feedback Form (integrated into FAQ) ----

function FeedbackForm() {
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          _hp: honeypot || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-12 pt-10 border-t border-border-light text-center">
        <div className="text-4xl mb-3">🙏</div>
        <p className="text-base font-semibold text-dark mb-1">
          Thank you for your message!
        </p>
        <p className="text-sm text-text-muted">
          We read every message and truly appreciate your feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-10 border-t border-border-light">
      <div className="text-center mb-6">
        <h3
          className="text-lg font-bold text-dark mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Still have a question or idea?
        </h3>
        <p className="text-sm text-text-muted">
          We&apos;d love to hear from you — questions, ideas, requests, anything!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-lg mx-auto">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ask us anything — questions, ideas, requests..."
          maxLength={5000}
          rows={3}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 resize-none text-sm"
        />

        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={200}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 text-sm"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email — only if you want a reply"
            maxLength={320}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 text-sm"
          />
        </div>

        {/* Honeypot — invisible to humans, bots fill this */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{ position: "absolute", left: "-9999px", opacity: 0 }}
          aria-hidden="true"
        />

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="text-center">
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-md shadow-orange-500/25 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send My Message 💌"}
          </button>
        </div>
      </form>
    </div>
  );
}
