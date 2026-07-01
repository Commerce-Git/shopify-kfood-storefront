"use client";

import { useState } from "react";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      // TODO: Connect to Supabase newsletter table or API
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-24 px-4 bg-dark text-white" id="newsletter">
      <div className="max-w-2xl mx-auto text-center">
        {/* Heading */}
        <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">
          Stay Connected
        </span>
        <h2
          className="text-3xl md:text-4xl font-extrabold mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Be the First to Discover{" "}
          <span className="gradient-text">New Collections</span>
        </h2>
        <p className="text-white/60 mb-8 max-w-lg mx-auto" style={{ fontFamily: "var(--font-body)" }}>
          Get early access to new artisan collaborations, limited drops, and exclusive offers. No spam — just beautiful Korean craftsmanship, delivered to your inbox.
        </p>

        {/* Form */}
        {status === "success" ? (
          <div className="bg-success/10 border border-success/30 rounded-2xl p-6 animate-fade-in">
            <span className="text-3xl mb-2 block">🎉</span>
            <p className="text-success font-semibold text-lg">You&apos;re on the list!</p>
            <p className="text-white/50 text-sm mt-1">We&apos;ll let you know when new collections drop.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 disabled:opacity-50"
              style={{
                fontFamily: "var(--font-heading)",
                background: "var(--color-accent)",
                color: "white",
              }}
            >
              {status === "loading" ? "..." : "Yes, Keep Me Updated!"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-red-400 text-sm mt-3">Something went wrong. Please try again.</p>
        )}

        <p className="text-white/30 text-xs mt-6">
          Unsubscribe anytime. We respect your inbox.
        </p>
      </div>
    </section>
  );
}
