"use client";

import { useState } from "react";
import Link from "next/link";

interface CategoryWaitlistCardProps {
  collectionTitle: string;
  categoryHandle: string;
}

export default function CategoryWaitlistCard({
  collectionTitle,
  categoryHandle,
}: CategoryWaitlistCardProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          category: categoryHandle,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage(
          data.message ||
            "You're on the list! We will notify you the moment this collection is released."
        );
      } else {
        setStatus("error");
        setMessage(data.error || "Unable to join at this time. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("A network error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#E8DFC8] p-8 sm:p-10 shadow-sm text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] text-[10px] font-bold uppercase tracking-widest text-[#C77B4A] mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C77B4A]" />
        <span>Studio Batch Release</span>
      </div>

      <h2
        className="text-xl sm:text-2xl font-black text-[#18181B] mb-2.5"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Next Batch in Production
      </h2>

      <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed mb-6 max-w-md mx-auto">
        Each piece in our <strong className="text-[#18181B]">{collectionTitle}</strong> collection is
        handcrafted in verified Korean studios in strictly limited runs. Join the Collector Circle to
        be notified first the moment new pieces arrive.
      </p>

      {status === "success" ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold leading-relaxed mb-6">
          <div className="flex items-center justify-center gap-1.5 font-bold text-sm mb-1 text-emerald-900">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Priority Notification Set</span>
          </div>
          <p>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for arrival alerts..."
              required
              disabled={status === "loading"}
              className="flex-1 px-4 py-3 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] text-xs sm:text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-none focus:border-[#C77B4A] transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 rounded-full bg-[#18181B] hover:bg-[#C77B4A] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {status === "loading" ? "Saving..." : "Get Notified First →"}
            </button>
          </div>

          {status === "error" && (
            <p className="text-xs text-red-600 font-medium">{message}</p>
          )}

          <p className="text-[11px] text-stone-400 mt-2.5 text-center leading-normal">
            No spam. Unsubscribe anytime. View our{" "}
            <Link href="/policies/privacy" className="underline hover:text-stone-700 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      )}

      {/* Alternative Navigation Links */}
      <div className="pt-5 border-t border-[#F2ECE1] flex items-center justify-center gap-3 flex-wrap">
        <Link
          href="/collections"
          className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-[#E8DFC8] hover:border-[#18181B] text-[#18181B] text-xs font-bold transition-colors bg-[#FAF8F5]"
        >
          Explore In-Stock Collections &rsaquo;
        </Link>
        <Link
          href="/artists"
          className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-[#E8DFC8] hover:border-[#18181B] text-[#18181B] text-xs font-bold transition-colors bg-[#FAF8F5]"
        >
          Explore Korean Studios &rsaquo;
        </Link>
      </div>
    </div>
  );
}
