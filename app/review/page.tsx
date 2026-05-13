"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { STAR_LABELS } from "@/lib/snack-options";

// ---- Review Form Component ----

function ReviewForm() {
  const [step, setStep] = useState(0); // 0 = loading/validating token
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [body, setBody] = useState("");
  const [photoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Token & result states
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponExpiresAt, setCouponExpiresAt] = useState<string | null>(null);
  const [discountLabel, setDiscountLabel] = useState<string>("");

  const searchParams = useSearchParams();
  const totalSteps = 2;
  const initialized = useRef(false);

  // Token validation on mount
  useEffect(() => {
    if (initialized.current) return;

    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setTokenError("No review token provided. Please use the link from your email.");
      return;
    }

    initialized.current = true;
    setToken(tokenParam);

    // Clean URL (remove token from address bar for security)
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, "/review");
    }

    // Check if this token was already used (re-visit scenario)
    fetch(`/api/review?token=${tokenParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "submitted" && data.couponCode) {
          // Already submitted → show coupon immediately
          setCouponCode(data.couponCode);
          setCouponExpiresAt(data.couponExpiresAt);
          setDiscountLabel(data.discountLabel);
          setStep(totalSteps + 1);
        } else if (data.status === "not_found") {
          setTokenError("Review link not found or expired.");
        } else {
          // Pending → show review form
          setStep(1);
        }
      })
      .catch(() => {
        // API error → still show form (will validate on submit)
        setStep(1);
      });
  }, [searchParams]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating.");
      setStep(1);
      return;
    }
    if (!body.trim()) {
      setError("Please write a short review.");
      setStep(2);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          title: null,
          body: body.trim(),
          photoUrls,
          favoriteSnacks: [],
          leastFavoriteSnacks: [],
          wantNext: [],
          privateComment: null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.couponCode) {
          // Already submitted — show existing coupon
          setCouponCode(data.couponCode);
          setStep(totalSteps + 1);
          return;
        }
        setError(data.error || "Something went wrong.");
        return;
      }

      setCouponCode(data.couponCode);
      setCouponExpiresAt(data.couponExpiresAt);
      setDiscountLabel(data.discountLabel);
      setStep(totalSteps + 1); // Thank you screen
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Error Screen (invalid/expired token) ----
  if (tokenError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">😔</div>
          <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            {tokenError.includes("expired") ? "Review Link Expired" : "Invalid Link"}
          </h1>
          <p className="text-gray-600 mb-8">{tokenError}</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            Visit Blank Seoul →
          </Link>
        </div>
      </div>
    );
  }

  // ---- Loading ----
  if (step === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // ---- Thank You + Coupon Screen ----
  if (step === totalSteps + 1) {
    const expiryDate = couponExpiresAt
      ? new Date(couponExpiresAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Thank You!
          </h1>
          <p className="text-gray-600 mb-8">
            Your review helps us make every box better.
            <br />
            We truly appreciate it! 💛
          </p>

          {/* Coupon */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 mb-6 border border-orange-200">
            <p className="text-sm text-gray-600 mb-2">
              Here&apos;s your exclusive{" "}
              <span className="font-bold">{discountLabel || "15% OFF"}</span>{" "}
              coupon:
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <code className="text-2xl font-bold tracking-wider text-orange-600 bg-white px-4 py-2 rounded-xl border-2 border-dashed border-orange-300">
                {couponCode}
              </code>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(couponCode || "")
                }
                className="text-sm text-orange-600 hover:text-orange-700 font-medium bg-white px-3 py-2 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
              >
                Copy
              </button>
            </div>
            {expiryDate && (
              <p className="text-xs text-gray-500">
                Valid until {expiryDate}
              </p>
            )}
          </div>

          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25"
          >
            Shop Blank Seoul →
          </Link>
        </div>
      </div>
    );
  }

  // ---- Main Form (2 steps) ----
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎫</div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Claim Your 15% OFF Coupon!
          </h1>
          <p className="text-gray-500">
            Tell us about your Blank Seoul Box to instantly unlock your next discount.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Step 1: Rating */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                How was your Blank Seoul Box?
              </h2>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setRating(star);
                      setError(null);
                      setTimeout(() => setStep(2), 400);
                    }}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="text-4xl transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                  >
                    {star <= (hoveredStar || rating) ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-400 h-5">
                {STAR_LABELS[hoveredStar || rating] || "Tap a star to rate"}
              </p>
            </div>
          )}

          {/* Step 2: Review text + Photo + Submit */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Show selected rating */}
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-xl">
                    {star <= rating ? "⭐" : "☆"}
                  </span>
                ))}
                <span className="text-sm text-gray-400 ml-2">
                  {STAR_LABELS[rating]}
                </span>
              </div>

              <h2 className="text-lg font-bold text-gray-900 text-center">
                Tell others about your experience
              </h2>
              <p className="text-sm text-gray-400 text-center">
                This will be shown on our product page 🌟
              </p>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What did you love about your Blank Seoul Box? Any favorites?"
                maxLength={2000}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 resize-none"
              />

              {/* Photo upload placeholder */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-400 text-sm">
                  📷 Photo upload coming soon!
                  <br />
                  <span className="text-xs">(Optional)</span>
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step === 2 && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-md shadow-orange-500/25 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Yes, Give Me My Coupon! 🎁"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-gray-500">
          Loading review form...
        </div>
      }
    >
      <ReviewForm />
    </Suspense>
  );
}
