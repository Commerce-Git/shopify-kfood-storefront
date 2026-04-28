"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "invalid"
  >("idle");

  useEffect(() => {
    if (!email || !token) {
      setStatus("invalid");
    }
  }, [email, token]);

  async function handleUnsubscribe() {
    setStatus("loading");

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
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

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
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
            <div className="text-5xl mb-6">📧</div>
            <h1
              className="text-2xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Unsubscribe
            </h1>
            <p className="text-gray-500 mb-2">
              Are you sure you want to stop receiving emails from Seoul Snack
              Box?
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Email: <span className="font-medium text-gray-600">{email}</span>
            </p>
            <button
              onClick={handleUnsubscribe}
              className="bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl
                hover:bg-gray-800 transition-all w-full mb-3"
            >
              Yes, Unsubscribe Me
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
              You&apos;ve Been Unsubscribed
            </h1>
            <p className="text-gray-500 mb-2">
              We&apos;re sorry to see you go! You will no longer receive
              promotional emails from us.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Note: You&apos;ll still receive essential emails related to your
              orders and coupon confirmations.
            </p>
            <Link href="/" className="btn-primary">
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
              className="btn-primary w-full mb-3"
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
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
