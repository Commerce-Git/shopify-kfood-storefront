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
    <section className="py-20 sm:py-24 px-4 bg-transparent text-white" id="newsletter">
      <div className="max-w-2xl mx-auto text-center bg-white/5 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
        {/* Micro Badge */}
        <span className="text-accent text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
          <span>🏛️</span> ARTISAN GUILD JOURNAL
        </span>

        {/* Heading */}
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 leading-snug"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Get Private Access to{" "}
          <span className="bg-gradient-to-r from-[#F5D0A9] via-[#E8AA70] to-[#C77B4A] bg-clip-text text-transparent">
            Limited Artisan Drops
          </span>
        </h2>

        {/* 2 Core Value Bullet Points */}
        <div className="text-sm sm:text-base text-white/80 my-6 space-y-2.5 max-w-md mx-auto text-left bg-black/20 p-5 rounded-2xl border border-white/10">
          <div className="flex items-start gap-2.5">
            <span className="text-accent text-base">✨</span>
            <p className="leading-relaxed">
              <strong className="text-white font-semibold">First alerts</strong>{" "}on new masterpiece drops by Korea&apos;s master artisans.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-accent text-base">📜</span>
            <p className="leading-relaxed">
              <strong className="text-white font-semibold">Exclusive stories</strong>{" "}straight from their private workshops.
            </p>
          </div>
        </div>

        {/* Form or Subscribed State */}
        {isSubscribed || status === "success" ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 animate-fade-in max-w-md mx-auto">
            <span className="text-3xl mb-2 block">🎉</span>
            <p className="text-emerald-400 font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {message || "You're on the Artisan Guild List!"}
            </p>
            <p className="text-white/60 text-xs sm:text-sm mt-1">
              We&apos;ll notify you first when new limited handcrafted collections drop.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={status === "loading"}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-7 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 disabled:opacity-50 bg-[#C77B4A] hover:bg-[#b56b3c] text-white shadow-lg hover:shadow-orange-500/25 flex items-center justify-center min-w-[150px]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {status === "loading" ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Get Early Access 🚀"
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-red-400 text-xs sm:text-sm mt-3 font-medium">{message}</p>
        )}

        <p className="text-white/40 text-xs mt-6">
          * No spam. Unsubscribe at any time. View our{" "}
          <Link href="/policies/privacy" className="underline hover:text-white transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
