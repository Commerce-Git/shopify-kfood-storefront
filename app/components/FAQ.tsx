"use client";

import { useState } from "react";
import Link from "next/link";
import SupportTrigger from "./SupportTrigger";
import { CANCEL_WINDOW_HOURS } from "@/lib/constants";

type FAQCategory = "all" | "shipping" | "guarantee" | "crafts" | "orders";

interface FAQItem {
  category: FAQCategory;
  question: string;
  answer: string;
  actionButton?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
}

const CATEGORIES: { id: FAQCategory; label: string; icon: string }[] = [
  { id: "all", label: "All Questions", icon: "🌟" },
  { id: "shipping", label: "Shipping & Customs", icon: "✈️" },
  { id: "guarantee", label: "30-Day Guarantee", icon: "🛡️" },
  { id: "crafts", label: "Products & Origin", icon: "🇰🇷" },
  { id: "orders", label: "Orders & Cancellation", icon: "⏱️" },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    category: "shipping",
    question: "How long does shipping take and how much does it cost?",
    answer:
      "We provide complimentary tracked shipping store-wide on all orders! Every piece is dispatched directly from Korea via Korea Post EMS / USPS Priority. Typical delivery time to the United States is 7–14 business days. You will receive an official tracking number as soon as your package leaves our Korea facility.",
    actionButton: {
      label: "Track Your Order Live →",
      href: "/order-lookup",
    },
  },
  {
    category: "shipping",
    question: "Do I have to pay customs duties or import taxes?",
    answer:
      "For the vast majority of our orders, NO! Blank Seoul packages dispatched to the United States and Hong Kong arrive with zero surprise customs fees. Orders to Singapore (under S$400) and Australia (under A$1,000) clear destination customs duty-free under standard personal import allowances. Any regional taxes on high-value orders or other countries are assessed by local authorities under standard DDU terms.",
    actionButton: {
      label: "View Shipping & Customs Policy →",
      href: "/policies/shipping",
    },
  },
  {
    category: "shipping",
    question: "Do you ship internationally outside the US?",
    answer:
      "Yes! While the United States (all 50 states, US territories, and APO/FPO military addresses) is our primary free shipping market, we also dispatch to major international destinations including Canada, the United Kingdom, the European Union, Australia, Japan, and Singapore. If your country is not listed at checkout, simply email our concierge at support@blankseoul.com for custom courier dispatch arrangements.",
    actionButton: {
      label: "View Global Shipping Policy →",
      href: "/policies/shipping",
    },
  },
  {
    category: "guarantee",
    question: "What is your 30-Day Safe Delivery & Protection Guarantee?",
    answer:
      "We want you to love every piece you receive from Blank Seoul. If your item arrives damaged, defective, or encounters transit issues, simply email us at support@blankseoul.com with a quick photo within 30 days of delivery. We will immediately issue a full refund or dispatch a free replacement — you will never be required to pay international return shipping back to Korea for damaged or defective items! For standard change-of-mind returns, we accept returns within 30 days of delivery (buyer covers tracked return shipping).",
    actionButton: {
      label: "Read Full Return Policy →",
      href: "/policies/returns",
    },
  },
  {
    category: "orders",
    question: "Can I cancel or modify my order after placing it?",
    answer:
      `Yes! We offer an instant ${CANCEL_WINDOW_HOURS}-Hour Zero-Risk Self-Cancellation window. Simply visit your Account page within ${CANCEL_WINDOW_HOURS} hours of purchase to cancel with 1-click for an immediate automatic refund. After ${CANCEL_WINDOW_HOURS} hours, our master partner studios begin personalized packaging and international dispatch.`,
    actionButton: {
      label: "Go to My Account (/account) →",
      href: "/account",
    },
  },
  {
    category: "crafts",
    question: "Are all products Made in Korea?",
    answer:
      "Absolutely. Every product on Blank Seoul is authentically designed and manufactured in South Korea. We partner exclusively with verified domestic studios, independent designers, and certified makers across Korea (including Barneulkkot Lalabi, Miyu, Kkamagwi, and Sosimhan Gomson). We strictly guarantee authentic South Korean origin with physical inspection at our central Korea hub before international dispatch.",
    actionButton: {
      label: "Meet Verified Korean Studios →",
      href: "/artists",
    },
  },
  {
    category: "crafts",
    question: "How do I care for mother-of-pearl, brass, and traditional fabrics?",
    answer:
      "Natural mother-of-pearl and hand-finished brass should be gently wiped with a clean, dry microfiber cloth. Avoid harsh chemical cleaners or submersion in water. For traditional jacquard fabrics, daenggi keyrings, and pouches, gentle spot-cleaning with cold water and mild detergent is recommended.",
    actionButton: {
      label: "View Terms & Care Guidelines →",
      href: "/policies/terms",
    },
  },
  {
    category: "crafts",
    question: "Do you offer premium gift packaging?",
    answer:
      "Yes! Most of our pieces arrive in custom studio packaging, matte protective boxes, or traditional Korean Hanji paper wraps designed by the makers themselves. They are prepared to be gifted immediately upon unboxing.",
  },
];

export default function FAQ({ showAll = false }: { showAll?: boolean }) {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredItems = FAQ_ITEMS.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const displayItems = showAll ? filteredItems : FAQ_ITEMS.slice(0, 5);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section bg-white" id="faq-section">
      <div className="section-inner max-w-3xl">
        {/* Section Header */}
        {!showAll && (
          <div className="text-center mb-12">
            <span className="text-[#C25E38] text-xs font-bold uppercase tracking-widest mb-2.5 block">
              Frequently Asked Questions
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-[#18181B] tracking-tight mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Got <span className="text-[#C25E38]">Questions?</span>
            </h2>
            <p className="text-sm sm:text-base text-text-muted">
              Everything you need to know about our Made in Korea curation, 7–14 day tracked air dispatch, and our 30-Day Guarantee.
            </p>
          </div>
        )}

        {/* Category Filter Pills (Interactive on Full FAQ page) */}
        {showAll && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setOpenIndex(null);
                  }}
                  className={`
                    px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs
                    ${
                      isActive
                        ? "bg-[#C25E38] text-white shadow-sm ring-2 ring-[#C25E38]/20"
                        : "bg-[#FAF9F6] text-[#4A463F] border border-[#E8DFC8] hover:border-[#C25E38]/50 hover:bg-white"
                    }
                  `}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {displayItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`
                  rounded-2xl border transition-all duration-200 overflow-hidden
                  ${
                    isOpen
                      ? "border-[#C25E38]/40 bg-[#FAF9F6] shadow-xs ring-1 ring-[#C25E38]/10"
                      : "border-[#E8DFC8]/80 bg-white hover:border-[#C25E38]/30"
                  }
                `}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                  aria-expanded={isOpen}
                  id={`faq-question-${index}`}
                >
                  <span
                    className="text-base font-bold text-[#18181B] leading-snug"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {item.question}
                  </span>
                  <div
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300
                      ${isOpen ? "rotate-180 bg-[#C25E38] text-white" : "bg-[#FAF9F6] text-[#4A463F] border border-[#E8DFC8]"}
                    `}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {/* Answer Content */}
                <div
                  className={`
                    transition-all duration-300 ease-in-out
                    ${isOpen ? "max-h-[500px] opacity-100 pb-5 px-6" : "max-h-0 opacity-0 overflow-hidden px-6"}
                  `}
                >
                  <p className="text-sm text-[#5C574F] leading-relaxed mb-3.5">
                    {item.answer}
                  </p>

                  {/* 1-Click Direct Resolution Action Button */}
                  {item.actionButton && (
                    <div className="pt-2">
                      <Link
                        href={item.actionButton.href}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-[#E8DFC8] text-xs font-bold text-[#C25E38] hover:bg-[#C25E38] hover:text-white hover:border-transparent transition-all shadow-2xs"
                      >
                        <span>{item.actionButton.label}</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link (only on home landing page) */}
        {!showAll && (
          <div className="text-center mt-10">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FAF9F6] border border-[#E8DFC8] text-xs font-bold text-[#18181B] hover:border-[#C25E38] hover:text-[#C25E38] transition-all shadow-2xs"
            >
              <span>Explore All FAQs & Help Center</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Unified 24/7 Contact & Support Section (#contact) */}
        <ContactSupportSection />
      </div>
    </section>
  );
}

// ---- Unified Contact & Feedback Section ----

function ContactSupportSection() {
  return (
    <div className="mt-16 pt-12 border-t border-[#E8DFC8]/70 text-center" id="contact">
      <h3 className="text-2xl font-bold mb-3">How can we help?</h3>
      <p className="text-sm text-text-muted max-w-lg mx-auto mb-5">
        Contact Blank Seoul Customer Support about a product, an order, or a delivery.
        Our team will check with the maker when needed and reply in your conversation.
      </p>
      <SupportTrigger className="inline-block rounded-xl bg-[#18181B] text-white px-6 py-3 text-sm font-semibold">
        Contact customer support
      </SupportTrigger>
      <p className="text-xs text-text-muted mt-4">
        If you cannot use the support window, email <a className="underline" href="mailto:support@blankseoul.com">support@blankseoul.com</a>.
      </p>
    </div>
  );
}
