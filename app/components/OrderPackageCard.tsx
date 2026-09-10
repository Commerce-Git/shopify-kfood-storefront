"use client";

import { useState } from "react";
import Link from "next/link";
import type { OrderPackage, OrderPackageItem } from "@/lib/shopify/admin";
import OrderStatusBar from "@/app/components/OrderStatusBar";

interface OrderPackageCardProps {
  pkg: OrderPackage;
  packageIndex?: number;
  totalPackages?: number;
  theme?: "dark" | "light";
}

export function PartialDeliveryNotice({
  packages,
  theme = "light",
}: {
  packages?: OrderPackage[];
  theme?: "dark" | "light";
}) {
  if (!packages || packages.length <= 1) return null;

  const delivered = packages.filter((p) => p.wmsStatus === "delivered" || p.step >= 4);
  const pending = packages.filter((p) => p.wmsStatus !== "delivered" && p.step < 4);

  if (delivered.length === 0 || pending.length === 0) return null;

  const deliveredNames = delivered.map((p) => p.vendor.replace(/^Atelier\s+/i, "")).join(", ");
  const pendingNames = pending.map((p) => p.vendor.replace(/^Atelier\s+/i, "")).join(", ");
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 mb-5 border transition-all animate-fade-in flex items-start gap-3.5 ${
        isDark
          ? "bg-amber-950/25 border-amber-500/30 text-white"
          : "bg-amber-50/90 border-amber-200/80 text-amber-950 shadow-sm"
      }`}
    >
      <svg
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-amber-400" : "text-amber-700"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <div className="flex-1 text-sm leading-relaxed">
        <p className={`font-bold text-sm mb-0.5 ${isDark ? "text-amber-300" : "text-amber-900"}`}>
          Partial Delivery Notice
        </p>
        <p className={isDark ? "text-white/80 text-xs sm:text-sm" : "text-amber-900/90 text-xs sm:text-sm"}>
          Your package from <strong>{deliveredNames}</strong> has arrived! Your remaining piece from{" "}
          <strong>{pendingNames}</strong> is safely on its way.
        </p>
      </div>
    </div>
  );
}

export default function OrderPackageCard({
  pkg,
  packageIndex = 1,
  totalPackages = 1,
  theme = "light",
}: OrderPackageCardProps) {
  const [copied, setCopied] = useState(false);
  const isDark = theme === "dark";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDelivered = pkg.wmsStatus === "delivered" || pkg.step >= 4;
  const cleanVendorName = pkg.vendor.replace(/^Atelier\s+/i, "");
  const avatarUrl = pkg.artistAvatar || "/assets/blank_seoul_symbol.png";

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${
        isDark
          ? "bg-white/[0.04] border border-white/10 hover:border-white/20 text-white"
          : "bg-white border border-gray-200/80 shadow-sm hover:border-gray-300 text-gray-900"
      } p-5 sm:p-6 mb-4 last:mb-0`}
    >
      {/* Studio / Package Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
        <div className="flex items-center gap-2.5">
          {/* Circular Artist Profile Avatar */}
          <Link
            href={`/artists/${pkg.vendorSlug}`}
            className="relative flex-shrink-0 group/avatar block"
            title={`View ${cleanVendorName} Profile`}
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 transition-all duration-300 flex items-center justify-center p-0.5 ${
                isDark
                  ? "border-white/20 bg-white/5 group-hover/avatar:border-[#C77B4A] group-hover/avatar:ring-2 group-hover/avatar:ring-[#C77B4A]/30"
                  : "border-stone-200 bg-white group-hover/avatar:border-[#C77B4A] group-hover/avatar:ring-2 group-hover/avatar:ring-[#C77B4A]/20 shadow-xs"
              }`}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden bg-stone-100 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={cleanVendorName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-110"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("blank_seoul_symbol")) {
                        target.src = "/assets/blank_seoul_symbol.png";
                      }
                    }}
                  />
                ) : (
                  <span className={`text-xs font-bold uppercase ${isDark ? "text-white/80" : "text-[#C77B4A]"}`}>
                    {cleanVendorName.charAt(0)}
                  </span>
                )}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/artists/${pkg.vendorSlug}`}
              className={`font-bold text-base hover:underline transition-colors ${
                isDark ? "text-white hover:text-[#C77B4A]" : "text-gray-900 hover:text-orange-600"
              }`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {cleanVendorName}
            </Link>
            <Link
              href={`/artists/${pkg.vendorSlug}`}
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors ${
                isDark
                  ? "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200"
              }`}
            >
              Profile ↗
            </Link>
          </div>
        </div>

        {/* Multi-package badge — only shown when order has >1 packages */}
        {totalPackages > 1 && (
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isDark
                ? "bg-white/10 text-white/80 border border-white/15"
                : "bg-stone-100 text-stone-700 border border-stone-200"
            }`}
          >
            Package {packageIndex} of {totalPackages}
          </span>
        )}
      </div>

      {/* Package Items Row */}
      <div className="py-4 space-y-3">
        {pkg.items.map((item: OrderPackageItem, idx: number) => {
          const imageUrl = item.image?.url;
          const altText = item.image?.altText || item.title;

          return (
            <div key={idx} className="flex items-center gap-3.5">
              <div className="relative flex-shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={altText}
                    className={`w-14 h-14 rounded-xl object-cover border ${
                      isDark ? "border-white/15 bg-black/20" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                ) : (
                  <div
                    className={`w-14 h-14 rounded-xl border flex items-center justify-center ${
                      isDark ? "border-white/15 bg-black/20 text-white/40" : "border-gray-200 bg-gray-50 text-gray-400"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                {item.quantity > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C77B4A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white leading-none shadow-sm">
                    x{item.quantity}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                  {item.title}
                </p>
                {item.variantTitle && item.variantTitle !== "Default Title" && (
                  <p className={`text-xs truncate mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                    {item.variantTitle}
                  </p>
                )}
                <p className={`text-xs mt-0.5 font-medium ${isDark ? "text-white/60" : "text-gray-500"}`}>
                  Qty: {item.quantity}
                </p>
              </div>

              {item.price?.amount && (
                <span className={`text-sm font-semibold flex-shrink-0 ${isDark ? "text-white/90" : "text-gray-800"}`}>
                  ${parseFloat(item.price.amount).toFixed(2)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 5-Stage Live Crafting & Delivery Timeline */}
      <div className={`pt-4 pb-2 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}>
        <OrderStatusBar step={pkg.step} theme={theme} />
      </div>

      {/* Tracking / Delivery Footer */}
      {(pkg.tracking || isDelivered) && (
        <div
          className={`mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? "border-white/10" : "border-gray-100"
          }`}
        >
          {/* Delivered state */}
          {isDelivered ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>
                Delivered{pkg.deliveredAt ? ` on ${new Date(pkg.deliveredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : " safely to recipient"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">Carrier:</span>
              <span className={`text-xs font-semibold ${isDark ? "text-white/80" : "text-gray-700"}`}>
                {pkg.tracking?.company || "Korea Post EMS"}
              </span>
            </div>
          )}

          {/* Tracking Number & Action Button */}
          {pkg.tracking?.number && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (pkg.tracking?.number) {
                    handleCopy(pkg.tracking.number);
                  }
                }}
                title="Copy tracking number"
                className={`text-xs font-mono font-medium px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  isDark
                    ? "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span>{pkg.tracking.number}</span>
                {copied ? (
                  <span className="text-emerald-400 text-[11px] font-semibold">✓ Copied</span>
                ) : (
                  <svg className="w-3.5 h-3.5 opacity-60 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {pkg.tracking.url && (
                <a
                  href={pkg.tracking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold px-3 py-1 rounded-lg transition-all shadow-sm bg-[#C77B4A] hover:bg-[#b56b3c] text-white flex items-center gap-1"
                >
                  Track Package ↗
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
