"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import { useAccountOrders } from "@/lib/orders/useAccountOrders";
import { readStoredValue, writeStoredValue } from "@/lib/browser-storage";
import type { Coupon } from "@/lib/types/coupon";

import AccountProfileCard from "./_components/AccountProfileCard";
import AccountCouponVault from "./_components/AccountCouponVault";
import AccountOrdersSection from "./_components/AccountOrdersSection";
import AccountCollectorCircle from "./_components/AccountCollectorCircle";

function AccountContent() {
  const { user, customer, isLoading, signOut, isLoggedIn } = useAuth();
  const { orders, loading: ordersLoading, error: ordersError, subscribed, retry } = useAccountOrders();
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
      const saved = readStoredValue(`blank_seoul_subscribed_${user.email.trim().toLowerCase()}`);
      setIsLocallySubscribed(saved === "true");
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
          writeStoredValue(`blank_seoul_subscribed_${newsletterEmail.trim().toLowerCase()}`, "true");
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

  useEffect(() => { setIsLocallySubscribed(subscribed); }, [subscribed, user?.id]);

  // Fetch coupons
  useEffect(() => {
    const controller = new AbortController();
    setCoupons([]);
    setCouponsLoading(true);
    async function fetchCoupons() {
      try {
        const res = await fetch("/api/my-coupons", { signal: controller.signal, cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!controller.signal.aborted) setCoupons(data.coupons || []);
        }
      } catch {
        // Silently fail — coupons are supplementary
      } finally {
        if (!controller.signal.aborted) setCouponsLoading(false);
      }
    }
    if (!isLoading && user) {
      fetchCoupons();
    }
    return () => controller.abort();
  }, [isLoading, user?.id]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/account/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#FAF8F5] text-[#18181B] flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C77B4A] mx-auto" />
          <p className="mt-4 text-stone-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex-1 bg-[#FAF8F5] text-[#18181B] flex items-center justify-center py-20">
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
    <div className="flex-1 bg-[#FAF8F5] text-[#18181B] pb-24 px-4 sm:px-6">
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
          onRetry={retry}
        />
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user } = useAuth();
  return <AccountContent key={`${user?.id}:${user?.email}`} />;
}
