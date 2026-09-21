"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import type { MappedOrder } from "@/lib/shopify/admin";
import type { Coupon } from "@/lib/types/coupon";

import AccountProfileCard from "./_components/AccountProfileCard";
import AccountCouponVault from "./_components/AccountCouponVault";
import AccountOrdersSection from "./_components/AccountOrdersSection";
import AccountCollectorCircle from "./_components/AccountCollectorCircle";

export default function AccountPage() {
  const { user, customer, isLoading, signOut, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<MappedOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const router = useRouter();

  // Coupon vault state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [isLocallySubscribed, setIsLocallySubscribed] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setNewsletterEmail(user.email);
    }
  }, [user]);

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
        setNewsletterMessage(data.message || "Welcome to the Collector Circle. You will receive private studio alerts.");
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

        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ orders: data.orders, timestamp: Date.now() })
          );
        } catch {
          // Storage full — ignore
        }
      } catch {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen bg-[#FAF8F5] text-[#18181B] pt-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C77B4A] mx-auto" />
          <p className="mt-4 text-stone-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#18181B] pt-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C77B4A] mx-auto" />
          <p className="mt-4 text-stone-500 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const rawName =
    customer?.first_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Collector");
  const displayName =
    rawName
      .split(" ")
      .filter(Boolean)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ") || "Collector";

  const activeOrdersCount = orders.filter(
    (o) => o.fulfillmentStatus !== "FULFILLED" && !o.cancelledAt
  ).length;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#18181B] pt-page-offset pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* 1. Profile Card: Customer Details + Inline Shipment Status + Sign Out */}
        <AccountProfileCard
          displayName={displayName}
          email={user?.email}
          avatarUrl={avatarUrl}
          activeOrdersCount={activeOrdersCount}
          onSignOut={signOut}
        />

        {/* 2. Collector Circle: 1-Click VIP Allocation Banner (Auto-hidden for subscribers) */}
        <AccountCollectorCircle
          isLocallySubscribed={isLocallySubscribed}
          newsletterEmail={newsletterEmail}
          onEmailChange={setNewsletterEmail}
          newsletterStatus={newsletterStatus}
          newsletterMessage={newsletterMessage}
          onSubmit={handleNewsletterSubmit}
        />

        {/* 3. Review Reward Coupon Vault (Rendered only when active vouchers exist) */}
        {!couponsLoading && coupons.length > 0 && (
          <AccountCouponVault
            coupons={coupons}
            copiedCode={copiedCode}
            onCopyCode={handleCopyCode}
          />
        )}

        {/* 4. My Orders: Full Parcel & Split Shipment Tracking, Status Bar, Reorder */}
        <AccountOrdersSection
          orders={orders}
          ordersLoading={ordersLoading}
          ordersError={ordersError}
        />
      </div>
    </div>
  );
}
