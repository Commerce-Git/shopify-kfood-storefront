"use client";

import { useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Already logged in → show button instead of auto-redirect to prevent loops
  if (isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">👋</div>
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>You are already logged in</h1>
          <Link href="/account" className="inline-block py-3 px-8 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25">
            Go to My Orders →
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signInWithEmail(email);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">✉️</div>
          <h1
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Check Your Email
          </h1>
          <p className="text-gray-600 mb-2">
            We sent a magic link to
          </p>
          <p className="font-semibold text-lg mb-6">{email}</p>
          <p className="text-gray-500 text-sm mb-8">
            Click the link in the email to sign in. It may take a minute to arrive.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] pt-24 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Access Your Snack Box Dashboard
          </h1>
          <p className="text-gray-600">
            View your <span className="font-semibold text-orange-600">coupons</span>, track orders & manage your account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">
                or use your email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                  focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                  outline-none transition-all text-gray-900"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 
                text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-orange-500/25 outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {loading ? "Sending..." : "Yes, Send My Access Link! ✉️"}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">🔒 Secure</span>
              <span className="flex items-center gap-1">⚡ No password needed</span>
              <span className="flex items-center gap-1">✨ Auto-create</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/order-lookup"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Just checking an order? Click here →
          </Link>
        </div>
      </div>
    </div>
  );
}
