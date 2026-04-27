"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SNACK_OPTIONS,
  CATEGORY_OPTIONS,
  STAR_LABELS,
} from "@/lib/feedback-options";

// ---- Component ----

export default function FeedbackPage() {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [favoriteSnacks, setFavoriteSnacks] = useState<string[]>([]);
  const [leastFavoriteSnacks, setLeastFavoriteSnacks] = useState<string[]>([]);
  const [wantNext, setWantNext] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Magic Link: Auto-fill email if passed in URL
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      
      // Clean up the URL to hide the email from the address bar (Privacy)
      if (window.history.replaceState) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, [searchParams]);

  const totalSteps = 5;

  const toggleSelection = (
    id: string,
    list: string[],
    setter: (v: string[]) => void
  ) => {
    setter(
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating.");
      setStep(1);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          favoriteSnacks,
          leastFavoriteSnacks,
          wantNext,
          comment: comment.trim() || null,
          email: email.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Thank You Screen ----
  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6 animate-bounce">🎉</div>
          <h1
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Thank You!
          </h1>
          <p className="text-gray-600 mb-8">
            Your feedback helps us make every box better.
            <br />
            We truly appreciate it! 💛
          </p>

          {/* Coupon */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 mb-6 border border-orange-200">
            <p className="text-sm text-gray-600 mb-2">
              Here&apos;s <span className="font-bold">$5 off</span> your next
              box:
            </p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-2xl font-bold tracking-wider text-orange-600 bg-white px-4 py-2 rounded-xl border-2 border-dashed border-orange-300">
                THANKYOU5
              </code>
              <button
                onClick={() => navigator.clipboard.writeText("THANKYOU5")}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium 
                  bg-white px-3 py-2 rounded-lg border border-orange-200 
                  hover:bg-orange-50 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 
              text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 
              transition-all shadow-lg shadow-orange-500/25"
          >
            Shop Seoul Snack Box →
          </Link>
        </div>
      </div>
    );
  }

  // ---- Main Form ----
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📝</div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Rate Your Box
          </h1>
          <p className="text-gray-500">
            Help us make your next box even better!
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8 px-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < step
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Step 1: Rating */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                How was your Seoul Snack Box?
              </h2>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setRating(star);
                      setError(null);
                      // Auto-advance after a short delay for better UX
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

          {/* Step 2: Favorite snacks */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
                Which snacks did you love?
              </h2>
              <p className="text-sm text-gray-400 text-center mb-6">
                Select all that apply
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SNACK_OPTIONS.map((snack) => (
                  <button
                    key={snack.id}
                    onClick={() =>
                      toggleSelection(snack.id, favoriteSnacks, setFavoriteSnacks)
                    }
                    className={`flex flex-col items-center justify-center gap-1.5 px-3 py-4 rounded-xl border text-sm font-medium
                      transition-all relative
                      ${
                        favoriteSnacks.includes(snack.id)
                          ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md transform scale-[1.02]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {favoriteSnacks.includes(snack.id) && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm">
                        ✓
                      </div>
                    )}
                    <span className="text-2xl">{snack.emoji}</span>
                    <span className="text-center leading-tight truncate w-full">{snack.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Least favorite snacks */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
                Was there anything you didn&apos;t enjoy?
              </h2>
              <p className="text-sm text-gray-400 text-center mb-6">
                Be honest! We use this to remove bad items.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SNACK_OPTIONS.map((snack) => (
                  <button
                    key={snack.id}
                    onClick={() =>
                      toggleSelection(snack.id, leastFavoriteSnacks, setLeastFavoriteSnacks)
                    }
                    className={`flex flex-col items-center justify-center gap-1.5 px-3 py-4 rounded-xl border text-sm font-medium
                      transition-all relative
                      ${
                        leastFavoriteSnacks.includes(snack.id)
                          ? "border-red-500 bg-red-50 text-red-700 shadow-md transform scale-[1.02]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {leastFavoriteSnacks.includes(snack.id) && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                        ✕
                      </div>
                    )}
                    <span className="text-2xl">{snack.emoji}</span>
                    <span className="text-center leading-tight truncate w-full">{snack.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Want next */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
                Build your dream box!
              </h2>
              <p className="text-sm text-gray-400 text-center mb-6">
                What should we focus on for our next release?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      toggleSelection(cat.id, wantNext, setWantNext)
                    }
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-sm font-medium
                      transition-all
                      ${
                        wantNext.includes(cat.id)
                          ? "border-orange-400 bg-orange-50 text-orange-700 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Comment + Email */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
                  Anything else?
                </h2>
                <p className="text-sm text-gray-400 text-center mb-4">
                  Optional — but we read every response!
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="I'd love to see more spicy ramen varieties..."
                  maxLength={1000}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                    focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    outline-none transition-all text-gray-900 resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="feedback-email"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Where should we send your $5 coupon? <span className="text-orange-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  (We&apos;ll also send you a sneak peek of our next box)
                </p>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                    focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    outline-none transition-all text-gray-900"
                />
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

            {step < totalSteps ? (
              <button
                onClick={() => {
                  if (step === 1 && rating === 0) {
                    setError("Please select a rating.");
                    return;
                  }
                  setError(null);
                  setStep(step + 1);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 
                  text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 
                  transition-all shadow-md shadow-orange-500/25 text-sm"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 
                  text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 
                  transition-all shadow-md shadow-orange-500/25 text-sm
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Submit Feedback 🎉"
                )}
              </button>
            )}
          </div>

          {/* Skip link for steps 2-4 */}
          {(step >= 2 && step <= 4) && (
            <div className="text-center mt-4">
              <button
                onClick={() => setStep(step + 1)}
                className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                No strong preference →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
