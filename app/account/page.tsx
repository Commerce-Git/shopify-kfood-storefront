"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { getOrderStep } from "@/lib/shopify/order-utils";
import type { MappedOrder } from "@/lib/shopify/admin";
import OrderStatusBar from "@/app/components/OrderStatusBar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/CartProvider";

export default function AccountPage() {
  const { user, customer, isLoading, signOut, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<MappedOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  // Coupon vault state
  interface Coupon {
    code: string;
    discountLabel: string;
    expiresAt: string;
    status: "active" | "used" | "expired";
    orderName: string;
  }
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    if (user?.email) {
      setNewsletterEmail(user.email);
    }
  }, [user]);

  const [isLocallySubscribed, setIsLocallySubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && user?.email) {
      const saved = localStorage.getItem(`blank_seoul_subscribed_${user.email.trim().toLowerCase()}`);
      if (saved === "true") {
        setIsLocallySubscribed(true);
      }
    }
  }, [user?.email]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterStatus("loading");
    setNewsletterMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus("success");
        setNewsletterMessage(data.message || "Thank you for subscribing! 🎉");
        if (typeof window !== "undefined" && newsletterEmail) {
          localStorage.setItem(`blank_seoul_subscribed_${newsletterEmail.trim().toLowerCase()}`, "true");
          setIsLocallySubscribed(true);
        }
      } else {
        setNewsletterStatus("error");
        setNewsletterMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setNewsletterStatus("error");
      setNewsletterMessage("Network error. Please check your connection.");
    }
  };

  useEffect(() => {
    async function fetchOrders() {
      const cacheKey = `orders_${user?.email || "anon"}`;

      // 1. Show cached data instantly (stale-while-revalidate)
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { orders: cachedOrders, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          // Use cache if less than 2 minutes old
          if (age < 2 * 60 * 1000 && cachedOrders.length > 0) {
            setOrders(cachedOrders);
            setOrdersLoading(false);
          }
        }
      } catch {
        // localStorage not available or corrupt — ignore
      }

      // 2. Always fetch fresh data in background
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders);

        if (user?.email && typeof window !== "undefined") {
          const key = `blank_seoul_subscribed_${user.email.trim().toLowerCase()}`;
          if (data.isSubscribed) {
            setIsLocallySubscribed(true);
            localStorage.setItem(key, "true");
          } else {
            setIsLocallySubscribed(false);
            localStorage.removeItem(key);
          }
        }

        // Save to localStorage for next visit
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ orders: data.orders, timestamp: Date.now() })
          );
        } catch {
          // Storage full — ignore
        }
      } catch {
        // Only show error if we don't have cached data
        if (orders.length === 0) {
          setOrdersError("Failed to load orders. Please try again.");
        }
      } finally {
        setOrdersLoading(false);
      }
    }

    if (!isLoading && user) {
      fetchOrders();
    }
  }, [isLoading, user]);

  // Fetch coupons
  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch("/api/my-coupons");
        if (res.ok) {
          const data = await res.json();
          setCoupons(data.coupons || []);
        }
      } catch {
        // Silently fail — coupons are supplementary
      } finally {
        setCouponsLoading(false);
      }
    }
    if (!isLoading && user) {
      fetchCoupons();
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/account/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F1A15] via-[#1A2E25] to-[#0A140F] text-white pt-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C77B4A] mx-auto" />
          <p className="mt-4 text-white/60 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F1A15] via-[#1A2E25] to-[#0A140F] text-white pt-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C77B4A] mx-auto" />
          <p className="mt-4 text-white/60 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const rawName =
    customer?.first_name || user?.user_metadata?.full_name || user?.email || "";
  // Capitalize first letter of each word
  const displayName = rawName
    .split(" ")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1A15] via-[#1A2E25] via-[#12221B] to-[#0A140F] text-white pt-36 sm:pt-40 md:pt-44 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#C77B4A]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#C77B4A]/20 border border-[#C77B4A]/40 flex items-center justify-center text-xl font-bold text-[#C77B4A]">
                {displayName.charAt(0)}
              </div>
            )}
            <div>
              <h1
                className="text-2xl sm:text-3xl font-extrabold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Welcome, {displayName}!
              </h1>
              <p className="text-white/60 text-sm mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-xs text-white/50 hover:text-white font-medium underline underline-offset-4 decoration-white/20 hover:decoration-white transition-all"
          >
            Sign Out
          </button>
        </div>

      {/* Coupon Vault — only render after loading completes, and only if coupons exist */}
      {!couponsLoading && coupons.length > 0 && (
        <>
          <h2
            className="text-xl font-bold mb-4 text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            🎫 My Coupons
          </h2>

          <div className="space-y-3 mb-8">
            {coupons.map((coupon) => {
              const isActive = coupon.status === "active";
              const isUsed = coupon.status === "used";
              const expiryDate = new Date(coupon.expiresAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={coupon.code}
                  className={`rounded-3xl border p-5 transition-all ${
                    isActive
                      ? "bg-white/10 backdrop-blur-md border-[#C77B4A]/50 text-white shadow-xl"
                      : "bg-white/5 border-white/10 text-white/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : isUsed
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {isActive ? "Active" : isUsed ? "Used" : "Expired"}
                      </span>
                      <span className="font-bold text-[#C77B4A]">
                        {coupon.discountLabel}
                      </span>
                    </div>
                    <span className="text-xs text-white/40">
                      from {coupon.orderName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <code className="text-lg font-bold tracking-wider text-white">
                        {coupon.code}
                      </code>
                      <p className="text-xs text-white/50 mt-1">
                        {isActive ? `Valid until ${expiryDate}` : isUsed ? "Already redeemed" : `Expired ${expiryDate}`}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            setCopiedCode(coupon.code);
                            setTimeout(() => setCopiedCode(null), 2000);
                          }}
                          className="text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors border border-white/15"
                        >
                          {copiedCode === coupon.code ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={() => router.push("/cart")}
                          className="text-xs font-bold text-white bg-[#C77B4A] hover:bg-[#b56b3c] px-4 py-1.5 rounded-xl transition-all shadow-md"
                        >
                          Use →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Newsletter CTA — Top Position (Hidden if already subscribed) */}
      {!isLocallySubscribed && (
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center border border-white/15 shadow-2xl">
          <p className="font-bold text-lg text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            🏛️ Artisan Guild Journal
          </p>
          
          <div className="text-sm text-white/80 my-4 space-y-2.5 max-w-md mx-auto text-left bg-black/20 p-5 rounded-2xl border border-white/10">
            <div className="flex items-start gap-2.5">
              <span className="text-[#C77B4A] text-base">✨</span>
              <p className="leading-relaxed">
                <strong className="text-white font-semibold">First alerts</strong>{" "}on new masterpiece drops by Korea&apos;s master artisans.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#C77B4A] text-base">📜</span>
              <p className="leading-relaxed">
                <strong className="text-white font-semibold">Exclusive stories</strong>{" "}straight from their private workshops.
              </p>
            </div>
          </div>

          {newsletterStatus === "success" ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 max-w-sm mx-auto animate-fade-in">
              <span className="text-2xl mb-1 block">🎉</span>
              <p className="text-emerald-400 font-semibold text-sm">{newsletterMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={newsletterStatus === "loading"}
                className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#C77B4A] transition-all text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={newsletterStatus === "loading"}
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all bg-[#C77B4A] hover:bg-[#b56b3c] text-white shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {newsletterStatus === "loading" ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Get Early Access 🚀"
                )}
              </button>
            </form>
          )}

          {newsletterStatus === "error" && (
            <p className="text-red-400 text-xs mt-2 font-medium">{newsletterMessage}</p>
          )}

          <p className="text-xs text-white/40 mt-4 leading-none">
            * No spam. Unsubscribe at any time. View our{" "}
            <Link href="/policies/privacy" className="underline hover:text-white transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      )}

      {/* Order History */}
      <h2
        className="text-xl font-bold mb-4 text-white"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        📦 My Orders
      </h2>

      {ordersLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-white/20 rounded" />
                  <div className="h-5 w-48 bg-white/20 rounded" />
                  <div className="h-4 w-20 bg-white/10 rounded" />
                </div>
                <div className="h-4 w-24 bg-white/10 rounded" />
              </div>
              <div className="flex items-center justify-between mt-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex flex-col items-center gap-1">
                    <div className="h-4 w-4 bg-white/20 rounded-full" />
                    <div className="h-3 w-16 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : ordersError ? (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-10 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-white/70 mb-6">{ordersError}</p>
          <Link
            href="/"
            className="inline-block px-7 py-3 bg.C77B4A bg-[#C77B4A] hover:bg-[#b56b3c] 
              text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-orange-500/25"
          >
            Shop Now →
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-10 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-white/70 text-lg mb-6">No orders yet</p>
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-[#C77B4A] hover:bg-[#b56b3c] 
              text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-orange-500/25"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Shop Now →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const { step } = getOrderStep(order.fulfillmentStatus, order.wmsStatus);
            const itemCount = order.lineItems.edges.reduce((acc, { node }) => acc + node.quantity, 0);
            const isCancelled = !!order.cancelledAt || ["CANCELLED", "REFUNDED", "VOIDED"].includes(order.financialStatus);
            const showReorder = isCancelled || order.fulfillmentStatus === "FULFILLED";
            return (
              <Link
                key={order.id}
                href={`/account/orders/${encodeURIComponent(order.id)}`}
                className="block bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-6 
                  hover:border-[#C77B4A]/50 hover:shadow-2xl transition-all text-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white" style={{ fontFamily: "var(--font-heading)" }}>
                      Order {order.name}
                    </h3>
                    <p className="text-white/60 text-sm mt-0.5">
                      {itemCount} item{itemCount > 1 ? "s" : ""} • ${parseFloat(order.totalPrice.amount).toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm text-white/50">
                    {new Date(order.processedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Product Thumbnails Row */}
                <div className="flex items-center gap-2.5 my-4 overflow-x-auto pb-1 scrollbar-none">
                  {order.lineItems.edges.map(({ node: item }, index) => {
                    const imageUrl = item.variant?.image?.url;
                    const altText = item.variant?.image?.altText || item.title;
                    return (
                      <div key={index} className="relative flex-shrink-0 group">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={altText}
                            className="w-12 h-12 rounded-xl object-cover border border-white/20 bg-black/20 group-hover:border-[#C77B4A] transition-all"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-black/20 border border-white/20 flex items-center justify-center text-xl">
                            📦
                          </div>
                        )}
                        {item.quantity > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#C77B4A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white leading-none">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4">
                  {isCancelled ? (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg text-xs font-medium">
                        ❌ Cancelled
                      </span>
                      <span className="text-xs text-white/40">💳 Refund processed</span>
                    </div>
                  ) : (
                    <OrderStatusBar step={step} />
                  )}
                </div>
                {showReorder && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        order.lineItems.edges.forEach(({ node }) => {
                          if (!node.variantId) return;
                          addToCart({
                            variantId: node.variantId,
                            productHandle: "",
                            title: node.title,
                            variantTitle: node.variant?.title || "",
                            price: node.variant?.price.amount || "0",
                            quantity: node.quantity,
                            image: (node.variant?.image as any) || null,
                          });
                        });
                        router.push("/cart");
                      }}
                      className="text-xs text-white font-semibold 
                        bg-[#C77B4A] hover:bg-[#b56b3c] px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                    >
                      🔄 Reorder
                    </button>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  </div>
  );
}
