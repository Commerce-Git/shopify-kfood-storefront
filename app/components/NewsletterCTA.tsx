"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGlobal = localStorage.getItem("blank_seoul_subscribed");
      if (savedGlobal === "true") {
        setIsSubscribed(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thank you for joining the Artisan Guild! 🎉");
        setIsSubscribed(true);
        if (typeof window !== "undefined") {
          const lowerEmail = email.trim().toLowerCase();
          localStorage.setItem(`blank_seoul_subscribed_${lowerEmail}`, "true");
          localStorage.setItem("blank_seoul_subscribed", "true");
        }
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection.");
    }
  };

  return (
    <section className="py-20 sm:py-28 px-4 bg-[#FBF9F5]" id="newsletter">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E2D6] shadow-md">
        {/* Micro Badge */}
        <span className="text-[#C25E38] text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFE6] border border-[#E8E2D6]">
          <span>🏛️</span> ARTISAN GUILD JOURNAL
        </span>

        {/* Heading */}
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 text-[#18181B] leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Get Private Access to{" "}
          <span className="text-[#C25E38]">
            Limited Seoul Drops
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mx-auto mb-6 leading-relaxed">
          Be the first to hear when our verified ateliers release new handcrafted collections. Receive an exclusive 10% welcome gift on your first piece.
        </p>

        {/* Form or Subscribed State */}
        {isSubscribed || status === "success" ? (
          <div className="bg-[#F4EFE6] border border-[#E8E2D6] rounded-2xl p-6 animate-fade-in max-w-md mx-auto">
            <span className="text-3xl mb-2 block">🎉</span>
            <p className="text-[#1A2F25] font-bold text-base sm:text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {message || "You're on the Artisan Guild List!"}
            </p>
            <p className="text-[#6B7280] text-xs sm:text-sm mt-1">
              We&apos;ll notify you first when new limited handcrafted collections drop.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={status === "loading"}
              className="flex-1 px-4 py-3 rounded-xl bg-[#FBF9F5] border border-[#E8E2D6] text-[#18181B] placeholder-[#9CA3AF] focus:outline-none focus:border-[#C25E38] focus:ring-1 focus:ring-[#C25E38] transition-all text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 disabled:opacity-50 bg-[#1A2F25] hover:bg-[#112019] text-white shadow-sm hover:shadow-md flex items-center justify-center min-w-[140px]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {status === "loading" ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Join Guild →"
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-red-600 text-xs sm:text-sm mt-3 font-medium">{message}</p>
        )}

        <p className="text-[#9CA3AF] text-xs mt-5">
          * No spam ever. Unsubscribe at any time. View our{" "}
          <Link href="/policies/privacy" className="underline hover:text-[#18181B] transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
