"use client";

import React from "react";
import Link from "next/link";
import { useLaunchWaitlist } from "@/lib/hooks/useLaunchWaitlist";
import EmailConsentNotice from "@/app/components/EmailConsentNotice";

export interface PrelaunchWaitlistCardProps {
  items?: Array<{ title: string; variantTitle?: string; price: string }>;
  layout?: "drawer" | "summary";
  idPrefix?: string;
  onSuccess?: (email: string) => void;
  onActionClick?: () => void;
  className?: string;
}

export default function PrelaunchWaitlistCard({
  items = [],
  layout = "drawer",
  idPrefix = "waitlist",
  onSuccess,
  onActionClick,
  className = "",
}: PrelaunchWaitlistCardProps) {
  const {
    email: waitlistEmail,
    setEmail: setWaitlistEmail,
    isRegistered: waitlistRegistered,
    registeredEmail: waitlistRegisteredEmail,
    isLoading: waitlistLoading,
    isSuccess: waitlistSuccess,
    error: waitlistError,
    submitWaitlist,
    editEmail: handleEditEmail,
  } = useLaunchWaitlist();

  const cardId = `${idPrefix}-card`;
  const inputId = `${idPrefix}-email-input`;
  const isSummary = layout === "summary";
  const isSubscribedState = waitlistRegistered || waitlistSuccess;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await submitWaitlist(items);
    if (res.success && onSuccess) {
      onSuccess(waitlistEmail || "");
    }
  };

  return (
    <div
      id={cardId}
      className={`rounded-2xl bg-[#FDF9F3] border border-[#E8DFC8] ${
        isSummary ? "p-4 sm:p-5 space-y-3" : "p-4 space-y-2.5"
      } ${className}`}
    >
      {/* 1. Header Badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
            isSubscribedState ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
          }`}
        />
        <span
          className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase ${
            isSubscribedState ? "text-emerald-700" : "text-[#C25E38]"
          }`}
        >
          {isSubscribedState ? "Pre-Launch · Box Reserved" : "Pre-Launch · Opening Soon"}
        </span>
      </div>

      {/* 2. Headline & Narrative */}
      <div>
        <h3
          className={`${
            isSummary ? "text-sm sm:text-base" : "text-xs font-bold leading-snug"
          } font-bold text-[#18181B] leading-snug`}
          style={{ fontFamily: isSummary ? "var(--font-heading)" : undefined }}
        >
          {isSubscribedState ? "Opening Soon — Your Box is Reserved." : "We're Opening Soon."}
        </h3>
        <p
          className={`${
            isSummary ? "text-xs mt-1" : "text-[11px] mt-0.5"
          } text-[#71717A] leading-relaxed`}
        >
          {isSubscribedState
            ? "We'll email you an instant VIP order link the moment we officially launch."
            : "Leave your email to receive an instant VIP order link the moment we officially launch."}
        </p>
      </div>

      {/* 3. Dynamic Interactive State */}
      {isSubscribedState ? (
        <div className="space-y-2 pt-1">
          <Link
            href="/collections"
            onClick={onActionClick}
            className={`btn-primary w-full ${
              isSummary ? "py-3.5 text-xs sm:text-sm" : "py-2.5 text-xs"
            } rounded-full font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:scale-[1.01] transition-transform text-center`}
          >
            <span>Continue Exploring Curations</span>
            <span aria-hidden="true">→</span>
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#71717A]">
            <span className="truncate max-w-[200px]">
              Launch alert active for {waitlistRegisteredEmail || waitlistEmail}
            </span>
            <span>&middot;</span>
            <button
              type="button"
              onClick={handleEditEmail}
              className="font-bold underline hover:text-[#C25E38] cursor-pointer shrink-0"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={handleFormSubmit} className="space-y-2">
            <div className={`flex ${isSummary ? "flex-col sm:flex-row" : ""} gap-2`}>
              <input
                id={inputId}
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address for launch notification"
                required
                disabled={waitlistLoading}
                className={`flex-1 min-w-0 ${
                  isSummary ? "px-3.5 py-3 text-xs sm:text-sm" : "px-3 py-2 text-xs"
                } rounded-xl bg-white border border-[#E8DFC8] text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#C25E38] shadow-2xs`}
              />
              <button
                type="submit"
                disabled={waitlistLoading}
                className={`btn-primary ${
                  isSummary ? "px-5 py-3 text-xs sm:text-sm" : "px-3.5 py-2 text-xs"
                } rounded-xl font-bold whitespace-nowrap cursor-pointer shrink-0`}
              >
                {waitlistLoading ? "Saving..." : "Notify Me →"}
              </button>
            </div>
            {waitlistError && (
              <p className="text-[11px] text-red-500 font-medium">{waitlistError}</p>
            )}
          </form>

          {/* 4. CAN-SPAM / CCPA / GDPR Standardized Notice */}
          <EmailConsentNotice compact align="center" className="pt-0.5" />
        </>
      )}
    </div>
  );
}
