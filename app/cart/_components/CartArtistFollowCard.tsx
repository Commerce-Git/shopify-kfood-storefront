"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useArtistFollow } from "@/lib/hooks/useArtistFollow";
import type { ArtistToFollow } from "@/app/api/cart-companions/route";

interface CartArtistFollowCardProps {
  artist: ArtistToFollow;
  compact?: boolean;
}

export default function CartArtistFollowCard({
  artist,
  compact = false,
}: CartArtistFollowCardProps) {
  const { isFollowed, followArtist, loadingSlug, userEmail } = useArtistFollow();
  const [emailInput, setEmailInput] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const followed = isFollowed(artist.slug);
  const isLoading = loadingSlug === artist.slug.toLowerCase();

  const handleFollow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback(null);

    const emailToUse = userEmail || emailInput.trim();
    if (!emailToUse) {
      setFeedback({ type: "error", text: "Please enter your email to receive drop alerts." });
      return;
    }

    const result = await followArtist(artist.slug, artist.name, emailToUse);
    if (result.success) {
      setFeedback({ type: "success", text: result.message });
      setEmailInput("");
    } else {
      setFeedback({ type: "error", text: result.error || "Failed to subscribe." });
    }
  };

  // 1. Compact mode or already followed: clean, unobtrusive VIP status badge
  if (followed) {
    return (
      <div className="rounded-xl bg-[#FBF9F5] border border-[#E8DFC8] p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold text-xs shrink-0">
            ✓
          </span>
          <div className="min-w-0">
            <p className="font-bold text-[#18181B] truncate">
              Following {artist.name}
            </p>
            <p className="text-[11px] text-[#71717A] truncate">
              Priority alerts active — you will be notified on the next studio release.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full shrink-0 border border-[#C8E6C9]">
          VIP Collector
        </span>
      </div>
    );
  }

  // 2. Compact banner mode for multi-artist cart sub-slot
  if (compact) {
    return (
      <div className="rounded-xl bg-[#FDF9F3] border border-[#E8DFC8] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-[#18181B]">
            <span>🔔</span>
            <span>Follow {artist.name} for Next Drop</span>
          </div>
          <p className="text-[11px] text-[#71717A] mt-0.5">
            Limited small-batch craft. Unsubscribe anytime. View{" "}
            <Link
              href="/policies/privacy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Privacy Policy (opens in a new tab)"
              className="underline hover:text-stone-700 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {userEmail ? (
          <button
            type="button"
            onClick={() => handleFollow()}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#C25E38] hover:bg-[#A74B28] text-white transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
          >
            {isLoading ? "Joining..." : "✨ 1-Click Follow"}
          </button>
        ) : (
          <form onSubmit={handleFollow} className="flex items-center gap-1.5 shrink-0">
            <input
              type="email"
              placeholder="Your email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E8DFC8] bg-white text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#C25E38] w-40 sm:w-44"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C25E38] hover:bg-[#A74B28] text-white transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
            >
              {isLoading ? "..." : "Notify Me"}
            </button>
          </form>
        )}
      </div>
    );
  }

  // 3. Full Featured Artisan Follow Card (When 0 companion products remain)
  const isBlankSeoul = artist.slug === "blank-seoul";

  return (
    <div className="bg-white border border-[#E8DFC8]/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Studio Avatar + Action Title + Compliance Line */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] overflow-hidden shrink-0 relative flex items-center justify-center shadow-2xs">
            {isBlankSeoul ? (
              <Image
                src="/assets/blank_seoul_symbol.png"
                alt="Blank Seoul Master Studio Seal"
                fill
                className="object-contain p-1"
                sizes="40px"
              />
            ) : (
              <span className="text-lg">🏺</span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-[#18181B] truncate">
              Follow {artist.name} for upcoming drops
            </h3>
            {userEmail ? (
              <p className="text-[11px] text-[#8C827A] mt-0.5 leading-tight flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                  <span>
                    Subscribing as <strong className="text-[#18181B]">{userEmail}</strong>
                  </span>
                </span>
                <span>·</span>
                <span>
                  No spam. Unsubscribe anytime. View{" "}
                  <Link
                    href="/policies/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Privacy Policy (opens in a new tab)"
                    className="underline hover:text-stone-700 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-[#8C827A] mt-0.5 leading-tight">
                No spam. Unsubscribe anytime. View{" "}
                <Link
                  href="/policies/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Privacy Policy (opens in a new tab)"
                  className="underline hover:text-stone-700 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            )}
          </div>
        </div>

        {/* Right: Action Button or Guest Form */}
        <div className="shrink-0 w-full sm:w-auto">
          {userEmail ? (
            <button
              type="button"
              onClick={() => handleFollow()}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-[#C25E38] hover:bg-[#A74B28] text-white transition-all shadow-xs whitespace-nowrap cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Get Drop Alerts</span>
                </>
              )}
            </button>
          ) : (
            <form onSubmit={handleFollow} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter email for drops"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-[#E8DFC8] bg-white text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#C25E38] flex-1 sm:w-52"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C25E38] hover:bg-[#A74B28] text-white transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    <span>...</span>
                  </>
                ) : (
                  <>Get Drop Alerts</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {feedback && (
        <p
          className={`text-[11px] mt-2 font-medium ${
            feedback.type === "success" ? "text-[#2E7D32]" : "text-[#C25E38]"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
