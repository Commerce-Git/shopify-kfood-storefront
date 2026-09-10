"use client";

import React from "react";

interface AccountProfileCardProps {
  displayName: string;
  email?: string;
  avatarUrl?: string;
  activeOrdersCount: number;
  activeCouponsCount: number;
  onSignOut: () => void;
}

export default function AccountProfileCard({
  displayName,
  email,
  avatarUrl,
  activeOrdersCount,
  activeCouponsCount,
  onSignOut,
}: AccountProfileCardProps) {
  return (
    <>
      {/* Profile / Member Header */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            {avatarUrl ? (
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#E8DFC8] p-0.5 bg-stone-50 shadow-xs flex-shrink-0">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#13221C] text-[#FAF8F5] border-2 border-[#E8DFC8] flex items-center justify-center text-xl sm:text-2xl font-bold font-serif shadow-xs flex-shrink-0">
                {displayName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Welcome back, {displayName}!
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#C77B4A]/10 text-[#C77B4A] border border-[#C77B4A]/25">
                  Heritage Collector
                </span>
              </div>
              <p className="text-stone-500 text-xs sm:text-sm mt-1">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={onSignOut}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* 3-Card Quick Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-8">
        {/* Card 1: Active Shipments */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs hover:border-[#C77B4A]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Active Shipments
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#C77B4A]">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl sm:text-3xl font-extrabold text-[#18181B]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {activeOrdersCount}
            </span>
            <span className="text-xs text-stone-500 font-medium">in transit</span>
          </div>
        </div>

        {/* Card 2: Rewards & Coupons */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs hover:border-[#C77B4A]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Available Vouchers
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl sm:text-3xl font-extrabold text-[#18181B]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {activeCouponsCount}
            </span>
            <span className="text-xs text-stone-500 font-medium">ready to use</span>
          </div>
        </div>

        {/* Card 3: Studio Guarantee */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs hover:border-[#C77B4A]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Studio Protection
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl sm:text-3xl font-extrabold text-emerald-600"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              100%
            </span>
            <span className="text-xs text-stone-500 font-medium">verified genuine</span>
          </div>
        </div>
      </div>
    </>
  );
}
