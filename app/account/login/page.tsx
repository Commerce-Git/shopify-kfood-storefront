"use client";

import { useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { signInWithEmail, isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Already logged in → redirect
  if (isLoggedIn) {
    router.push("/account");
    return null;
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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Welcome 👋
          </h1>
          <p className="text-gray-600">
            Sign in to track your orders and manage your account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
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
                shadow-lg shadow-orange-500/25"
            >
              {loading ? "Sending..." : "Send Magic Link ✉️"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">
                  No password needed
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              We&apos;ll send a secure login link to your email.
              <br />
              No account? One will be created automatically.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/order-lookup"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Track order without an account →
          </Link>
        </div>
      </div>
    </div>
  );
}
