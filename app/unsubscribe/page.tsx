"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getArtistBySlug } from "@/lib/artists";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const artistSlug = searchParams.get("artist") || "";

  const artistName = artistSlug ? getArtistBySlug(artistSlug).name : "";

  const [requestStatus, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "invalid"
  >("idle");
  const [undoStatus, setUndoStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const status = !email || !token ? "invalid" : requestStatus;

  async function handleUnsubscribe() {
    setStatus("loading");

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          artist: artistSlug || undefined,
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        console.error("Unsubscribe error:", data.error);
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  async function handleUndoRefollow() {
    if (!artistSlug || !email) return;
    setUndoStatus("loading");
    try {
      const res = await fetch("/api/artists/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          artistSlug,
          artistName,
          action: "follow",
        }),
      });

      if (res.ok) {
        setUndoStatus("done");
      } else {
        setUndoStatus("error");
      }
    } catch {
      setUndoStatus("error");
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="max-w-md mx-auto text-center px-6">
        {/* Invalid link */}
        {status === "invalid" && (
          <>
            <div className="text-5xl mb-6">⚠️</div>
            <h1
              className="text-2xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Invalid Link
            </h1>
            <p className="text-gray-500 mb-8">
              This unsubscribe link is invalid or expired. If you need help,
              please contact us.
            </p>
            <Link href="/" className="btn-primary">
              Go to Homepage
            </Link>
          </>
        )}

        {/* Confirm unsubscribe */}
        {status === "idle" && (
          <>
            <div className="text-5xl mb-6">{artistSlug ? "🏺" : "📧"}</div>
            <h1
              className="text-2xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {artistSlug
                ? `Unfollow ${artistName}`
                : "Unsubscribe"}
            </h1>
            <p className="text-gray-500 mb-2">
              {artistSlug
                ? `Are you sure you want to stop receiving drop alerts for ${artistName}?`
                : "Are you sure you want to stop receiving promotional emails from Blank Seoul?"}
            </p>
            {artistSlug && (
              <p className="text-xs text-[#71717A] mb-4">
                Note: You will still remain subscribed to other Korean artisan drops and Blank Seoul news.
              </p>
            )}
            <p className="text-sm text-gray-400 mb-8">
              Email: <span className="font-medium text-gray-600">{email}</span>
            </p>
            <button
              onClick={handleUnsubscribe}
              className="bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl
                hover:bg-gray-800 transition-all w-full mb-3 cursor-pointer"
            >
              {artistSlug ? `Yes, Unfollow ${artistName}` : "Yes, Unsubscribe Me"}
            </button>
            <Link
              href="/"
              className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Never mind, take me back
            </Link>
          </>
        )}

        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-500">Processing...</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="text-5xl mb-6">✅</div>
            <h1
              className="text-2xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {artistSlug
                ? `Unfollowed ${artistName}`
                : "You\u2019ve Been Unsubscribed"}
            </h1>
            <p className="text-gray-500 mb-2">
              {artistSlug
                ? `You will no longer receive release alerts for ${artistName}.`
                : "We\u2019re sorry to see you go! You will no longer receive promotional emails from us."}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {artistSlug
                ? "Your subscription to other studios and essential order notifications remains active."
                : "Note: You\u2019ll still receive essential emails related to your orders and customer service."}
            </p>

            {/* Accidental click / Undo Option */}
            {artistSlug && (
              <div className="mb-6 p-4 rounded-xl bg-[#FDF9F3] border border-[#E8DFC8] text-xs">
                {undoStatus === "done" ? (
                  <p className="text-emerald-700 font-bold">
                    ✓ You have successfully re-followed {artistName}!
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span className="text-[#71717A]">Accidentally clicked?</span>
                    <button
                      type="button"
                      onClick={handleUndoRefollow}
                      disabled={undoStatus === "loading"}
                      className="font-bold text-[#C25E38] hover:text-[#A74B28] underline cursor-pointer"
                    >
                      {undoStatus === "loading" ? "Restoring..." : `Re-follow ${artistName} (Undo)`}
                    </button>
                  </div>
                )}
              </div>
            )}

            <Link href="/" className="btn-primary inline-block">
              Back to Homepage
            </Link>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="text-5xl mb-6">😕</div>
            <h1
              className="text-2xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Something Went Wrong
            </h1>
            <p className="text-gray-500 mb-8">
              We couldn&apos;t process your request. Please try again or contact
              us for help.
            </p>
            <button
              onClick={handleUnsubscribe}
              className="btn-primary w-full mb-3 cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Go to Homepage
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
