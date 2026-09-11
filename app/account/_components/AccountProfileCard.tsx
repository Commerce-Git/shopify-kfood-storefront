"use client";

import React from "react";

interface AccountProfileCardProps {
  displayName: string;
  email?: string;
  avatarUrl?: string;
  activeOrdersCount: number;
  onSignOut: () => void;
}

export default function AccountProfileCard({
  displayName,
  email,
  avatarUrl,
  activeOrdersCount,
  onSignOut,
}: AccountProfileCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5">
          {avatarUrl ? (
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#E8DFC8] p-0.5 bg-stone-50 shadow-xs flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#13221C] text-[#FAF8F5] border-2 border-[#E8DFC8] flex items-center justify-center text-xl sm:text-2xl font-bold font-serif shadow-xs flex-shrink-0">
              {displayName ? displayName.charAt(0).toUpperCase() : "C"}
            </div>
          )}
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Welcome back, {displayName}!
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-stone-500 text-xs sm:text-sm mt-1">
              <span>{email}</span>
              {activeOrdersCount > 0 && (
                <>
                  <span className="text-stone-300 hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-xs font-medium border border-orange-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C77B4A] animate-pulse" />
                    {activeOrdersCount} in transit
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Utility Action: Sign Out */}
        <div className="flex items-center self-start sm:self-auto pt-2 sm:pt-0 border-t border-stone-100 sm:border-t-0 w-full sm:w-auto justify-end">
          <button
            onClick={onSignOut}
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
  );
}
