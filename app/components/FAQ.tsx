"use client";

import { useState } from "react";
import Link from "next/link";
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
  { id: "crafts", label: "Crafts & Materials", icon: "🎨" },
  { id: "orders", label: "Orders & Cancellation", icon: "⏱️" },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    category: "shipping",
    question: "How long does shipping take and how much does it cost?",
    answer:
      "We provide 100% FREE Tracked Shipping store-wide on all orders! Every piece is dispatched directly from Seoul, South Korea via Korea Post EMS / USPS Priority. Typical delivery time to the United States is 7–14 business days. You will receive an official tracking number as soon as your package leaves our Seoul facility.",
    actionButton: {
      label: "Track Your Order Live →",
      href: "/order-lookup",
    },
  },
  {
    category: "shipping",
    question: "Do I have to pay customs duties or import taxes?",
    answer:
      "For US customers, NO! Under US Customs Section 321 De Minimis rules, personal import orders under $800 USD are 100% exempt from import duties and tariffs. All Blank Seoul artisan pieces are well within this duty-free threshold, so you will never encounter surprise customs fees at checkout or delivery.",
  },
  {
    category: "shipping",
    question: "Do you ship internationally outside the US?",
    answer:
      "Yes! While the United States (all 50 states, US territories, and APO/FPO military addresses) is our primary 100% Free Shipping market, we also dispatch to major international destinations including Canada, the United Kingdom, the European Union, Australia, Japan, and Singapore. If your country is not listed at checkout, simply email our concierge at support@blankseoul.com for custom courier dispatch arrangements.",
    actionButton: {
      label: "View Global Shipping Policy →",
      href: "/policies/shipping",
    },
  },
  {
    category: "guarantee",
    question: "What is your 30-Day Safe Delivery & Protection Guarantee?",
    answer:
      "We want you to hold every artisan craft in absolute love. If your item arrives damaged, defective, or goes missing during international transit, simply email us at support@blankseoul.com with a quick photo within 30 days of delivery. We will immediately issue a 100% full refund or dispatch a free replacement. You will never be required to pay expensive international return shipping back to Korea!",
    actionButton: {
      label: "Read Full Return Policy →",
      href: "/policies/returns",
    },
  },
  {
    category: "orders",
    question: "Can I cancel or modify my order after placing it?",
    answer:
      `Yes! We offer an instant ${CANCEL_WINDOW_HOURS}-Hour Zero-Risk Self-Cancellation window. Simply visit your Account page within ${CANCEL_WINDOW_HOURS} hours of purchase to cancel with 1-click for an immediate 100% automatic refund. After ${CANCEL_WINDOW_HOURS} hours, our Seoul master partner studios begin personalized packaging and international dispatch.`,
    actionButton: {
      label: "Go to My Account (/account) →",
      href: "/account",
    },
  },
  {
    category: "crafts",
    question: "Are the products genuinely handcrafted in Korea?",
    answer:
      "Absolutely. We partner exclusively with verified Korean craft studios, master ateliers, and independent artisans based in Seoul (including Barneulkkot Lalabi, Miyu, Kkamagwi, and Sosimhan Gomson). Each piece is created using authentic traditional Korean techniques, such as traditional embroidery, natural mother-of-pearl (Najeonchilgi) inlay, and artisanal fabric knotting.",
    actionButton: {
      label: "Meet Our Seoul Artisans →",
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
    question: "Do you offer atelier gift packaging?",
    answer:
      "Yes! Most of our artisan pieces arrive in custom atelier packaging, matte protective boxes, or traditional Korean Hanji paper wraps designed by the makers themselves. They are prepared to be gifted immediately upon unboxing.",
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
              Everything you need to know about Seoul craft curation, 7–14 day delivery, and our 30-Day Guarantee.
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
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@blankseoul.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

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
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please email us directly at support@blankseoul.com.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-16 pt-12 border-t border-[#E8DFC8]/70" id="contact">
      {/* Contact Cards Header */}
      <div className="text-center mb-8">
        <span className="text-[#C25E38] text-xs font-bold uppercase tracking-widest mb-2 block">
          24/7 Concierge Support
        </span>
        <h3
          className="text-2xl font-extrabold text-[#18181B] tracking-tight mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Still Have a Question or Request?
        </h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Our Seoul & US concierge team responds to every inquiry within 12–24 business hours (Monday–Friday).
        </p>
      </div>

      {/* Quick Email Direct Card */}
      <div className="bg-[#FAF9F6] border border-[#E8DFC8] rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DFC8] flex items-center justify-center text-lg shadow-2xs">
            ✉️
          </div>
          <div>
            <span className="text-xs font-bold text-[#18181B] block">Direct Priority Email</span>
            <span className="text-xs text-text-muted">support@blankseoul.com</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E8DFC8] text-xs font-bold text-[#18181B] hover:border-[#C25E38] hover:text-[#C25E38] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <span>{copiedEmail ? "Copied! 📋" : "Copy Email 📋"}</span>
          </button>
          <a
            href="mailto:support@blankseoul.com?subject=Inquiry%20from%20Blank%20Seoul%20Storefront"
            className="px-3 py-1.5 rounded-lg bg-[#C25E38] text-white text-xs font-bold hover:bg-[#a84d2c] transition-all shadow-2xs"
          >
            Open Mail ↗
          </a>
        </div>
      </div>

      {/* Web Message Form */}
      {sent ? (
        <div className="p-8 rounded-2xl bg-[#FAF9F6] border border-emerald-200 text-center max-w-lg mx-auto">
          <div className="text-4xl mb-3">💌</div>
          <p className="text-base font-bold text-[#18181B] mb-1">
            Thank you! Your message has been delivered.
          </p>
          <p className="text-xs text-text-muted">
            Our Seoul concierge team will review your inquiry and get back to you shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 max-w-lg mx-auto">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How can we help you today? (Order questions, artisan inquiries, custom requests...)"
            maxLength={5000}
            rows={4}
            required
            className="w-full px-4 py-3 bg-white border border-[#E8DFC8] rounded-xl focus:ring-2 focus:ring-[#C25E38] focus:border-transparent outline-none transition-all text-[#18181B] resize-none text-sm placeholder:text-gray-400 shadow-2xs"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name (Optional)"
              maxLength={200}
              className="flex-1 px-4 py-2.5 bg-white border border-[#E8DFC8] rounded-xl focus:ring-2 focus:ring-[#C25E38] focus:border-transparent outline-none transition-all text-[#18181B] text-sm placeholder:text-gray-400 shadow-2xs"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email (For reply)"
              required
              maxLength={320}
              className="flex-1 px-4 py-2.5 bg-white border border-[#E8DFC8] rounded-xl focus:ring-2 focus:ring-[#C25E38] focus:border-transparent outline-none transition-all text-[#18181B] text-sm placeholder:text-gray-400 shadow-2xs"
            />
          </div>

          {/* Honeypot */}
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
            <p className="text-red-600 text-xs font-medium text-center">{error}</p>
          )}

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="w-full sm:w-auto px-8 py-3 bg-[#C25E38] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#a84d2c] transition-all shadow-sm shadow-[#C25E38]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {sending ? "Sending Message..." : "Send Message to Concierge 💌"}
            </button>
          </div>

          <p className="text-[11px] text-text-muted text-center pt-1">
            🔒 Protected by 256-bit SSL encryption. Operated by Blank Palette LLC (Sheridan, WY, USA).
          </p>
        </form>
      )}
    </div>
  );
}
