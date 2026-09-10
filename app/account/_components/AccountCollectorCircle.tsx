"use client";

import React from "react";
import Link from "next/link";

interface AccountCollectorCircleProps {
  isLocallySubscribed: boolean;
  newsletterEmail: string;
  onEmailChange: (val: string) => void;
  newsletterStatus: "idle" | "loading" | "success" | "error";
  newsletterMessage: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AccountCollectorCircle({
  isLocallySubscribed,
  newsletterEmail,
  onEmailChange,
  newsletterStatus,
  newsletterMessage,
  onSubmit,
}: AccountCollectorCircleProps) {
  if (isLocallySubscribed) return null;

  return (
    <div className="mt-14 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs text-center">
      <div className="max-w-md mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C77B4A] block mb-1">
          Artisan Guild Journal
        </span>
        <h3
          className="text-xl font-bold text-[#18181B] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Join the Collector Circle
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed mb-5">
          Receive early private alerts when Korean master artisans drop limited edition heritage works.
        </p>

        {newsletterStatus === "success" ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 animate-fade-in flex items-center justify-center gap-2 text-emerald-800 text-sm font-semibold">
            <svg
              className="w-4 h-4 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{newsletterMessage}</span>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={newsletterStatus === "loading"}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#C77B4A] focus:bg-white transition-all text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={newsletterStatus === "loading"}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all bg-[#C77B4A] hover:bg-[#b56b3c] text-white shadow-xs disabled:opacity-50 flex items-center justify-center whitespace-nowrap cursor-pointer"
            >
              {newsletterStatus === "loading" ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Join Circle →"
              )}
            </button>
          </form>
        )}

        {newsletterStatus === "error" && (
          <p className="text-red-600 text-xs mt-2 font-medium">{newsletterMessage}</p>
        )}

        <p className="text-[11px] text-stone-400 mt-3 leading-none">
          No spam. Unsubscribe anytime. View our{" "}
          <Link href="/policies/privacy" className="underline hover:text-stone-700 transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
