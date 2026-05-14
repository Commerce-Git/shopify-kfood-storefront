"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";

interface WaitlistFormProps {
  size: "lg" | "sm";
  className?: string;
}

// ---- Global Toast State (shared across all WaitlistForm instances) ----
type ToastType = "success" | "info" | "error";
type ToastListener = (msg: string, type: ToastType) => void;

let toastListener: ToastListener | null = null;

function showToast(message: string, type: ToastType = "success") {
  toastListener?.(message, type);
}

// ---- Toast Component (renders once at top of viewport) ----
export function WaitlistToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  } | null>(null);

  useEffect(() => {
    toastListener = (message, type) => {
      setToast({ message, type, visible: true });
    };
    return () => {
      toastListener = null;
    };
  }, []);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!toast?.visible) return;
    const timer = setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, visible: false } : null));
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast?.visible, toast?.message]);

  // Clean up after fade-out animation
  useEffect(() => {
    if (toast && !toast.visible) {
      const timer = setTimeout(() => setToast(null), 300);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const bgColor =
    toast.type === "error"
      ? "from-red-500 to-red-600"
      : toast.type === "info"
      ? "from-blue-500 to-blue-600"
      : "from-green-500 to-emerald-600";

  const icon =
    toast.type === "error" ? "⚠️" : toast.type === "info" ? "ℹ️" : "✅";

  return (
    <div
      className={`
        fixed top-6 left-1/2 -translate-x-1/2 z-[9999]
        transition-all duration-300 ease-out
        ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      <div
        className={`
          bg-gradient-to-r ${bgColor} text-white
          px-6 py-3.5 rounded-2xl shadow-2xl
          flex items-center gap-3
          text-sm font-medium
          min-w-[280px] max-w-[90vw]
        `}
      >
        <span className="text-lg flex-shrink-0">{icon}</span>
        <span>{toast.message}</span>
        <button
          onClick={() =>
            setToast((prev) => (prev ? { ...prev, visible: false } : null))
          }
          className="ml-auto text-white/60 hover:text-white transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ---- WaitlistForm Component ----
export default function WaitlistForm({
  size,
  className = "",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  // Auto-dismiss feedback after 5 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!email.trim() || loading) return;

      setLoading(true);
      setFeedback(null);

      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });

        const data = await res.json();

        if (data.success) {
          setFeedback({
            message: data.message,
            type: data.existing ? "info" : "success",
          });
          setEmail("");
        } else {
          setFeedback({
            message: data.error || "Something went wrong.",
            type: "error",
          });
        }
      } catch {
        setFeedback({ message: "Network error. Please try again.", type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [email, loading]
  );

  // ---- Inline Feedback ----
  const feedbackEl = feedback && (
    <div
      className={`
        flex items-center gap-2.5 mt-3 px-4 py-3 rounded-xl font-medium animate-fade-in
        ${size === "lg" ? "text-sm" : "text-xs"}
        ${
          feedback.type === "error"
            ? size === "sm"
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-red-500/10 text-red-300 border border-red-500/20"
            : feedback.type === "info"
            ? size === "sm"
              ? "bg-blue-50 text-blue-600 border border-blue-200"
              : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
            : size === "sm"
            ? "bg-green-50 text-green-600 border border-green-200"
            : "bg-green-500/10 text-green-300 border border-green-500/20"
        }
      `}
    >
      <span className="text-lg flex-shrink-0">
        {feedback.type === "error" ? "⚠️" : feedback.type === "info" ? "ℹ️" : "✅"}
      </span>
      <span>{feedback.message}</span>
    </div>
  );

  // ---- Small Form (StickyBuyBar) ----
  if (size === "sm") {
    return (
      <div className={className}>
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-40 px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-sm px-4 py-2.5 whitespace-nowrap disabled:opacity-70 disabled:cursor-wait"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </span>
            ) : (
              "Get Access 🔔"
            )}
          </button>
        </form>
        {feedbackEl}
      </div>
    );
  }

  // ---- Large Form (Hero / OfferStack / ProductShowcase) ----
  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg mx-auto lg:mx-0"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address..."
          required
          className="w-full sm:flex-1 px-5 py-4 text-base rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/40 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto btn-primary text-base px-8 py-4 whitespace-nowrap disabled:opacity-70 disabled:cursor-wait"
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Joining...
            </span>
          ) : (
            "Get Early Access 🔔"
          )}
        </button>
      </form>

      {/* Inline feedback message */}
      {feedbackEl}

      {/* Trust line — legal disclosure */}
      {!feedback && (
        <p className="text-xs text-white/60 mt-3 text-center lg:text-left">
          🔒 Get first access &amp; exclusive deals. No spam.{" "}
          <a href="/policies/privacy" className="underline hover:text-white/80 transition-colors">
            Privacy Policy
          </a>
        </p>
      )}
    </div>
  );
}
