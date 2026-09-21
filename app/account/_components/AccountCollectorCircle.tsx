"use client";

import React from "react";
import Link from "next/link";
import EmailConsentNotice from "@/app/components/EmailConsentNotice";

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
    <div className="mb-8 sm:mb-10 bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-xs text-center">
      <div className="max-w-lg mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C77B4A] block mb-1.5">
          STUDIO ALERTS & CURATION
        </span>
        <h2
          className="text-xl sm:text-2xl font-extrabold text-[#18181B] mb-2 tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Join the Collector Circle
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed mb-6 max-w-md mx-auto">
          Receive private drop alerts for studios you follow, plus early access
          <br className="hidden sm:inline" /> to new curated Korean heritage releases.
        </p>

        {newsletterStatus === "success" ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-full py-3 px-6 animate-fade-in flex items-center justify-center gap-2 text-emerald-800 text-xs sm:text-sm font-semibold max-w-md mx-auto">
            <svg
              className="w-4 h-4 text-emerald-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{newsletterMessage || "Welcome to the Collector Circle. You will receive private studio alerts."}</span>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={newsletterStatus === "loading"}
              className="flex-1 w-full sm:w-72 px-5 py-3 rounded-full border border-stone-300 bg-stone-50/70 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#C77B4A] focus:bg-white transition-all text-xs sm:text-sm text-center sm:text-left disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={newsletterStatus === "loading"}
              className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all bg-[#C77B4A] hover:bg-[#b56b3c] active:scale-95 text-white shadow-xs disabled:opacity-50 flex items-center justify-center whitespace-nowrap cursor-pointer shrink-0"
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
          <p className="text-red-600 text-xs mt-2.5 font-medium">{newsletterMessage}</p>
        )}

        <EmailConsentNotice align="center" compact className="mt-4 text-stone-400" />
      </div>
    </div>
  );
}
