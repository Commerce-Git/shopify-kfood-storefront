"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductInteractive from "@/app/components/ProductInteractive";
import Reviews from "@/app/components/Reviews";
import { adaptPreviewToShopifyProduct } from "@/lib/shopify/preview-adapter";

export default function StorePreviewPage() {
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Validate origin domain if needed
      const allowedOrigins = [
        "https://blank-seoul-admin.vercel.app",
        "https://shopify-git.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://blankseoul.com",
      ];

      // Match payload type
      if (event.data?.type === "BLANK_SEOUL_PREVIEW_UPDATE") {
        const originOk =
          !event.origin ||
          allowedOrigins.some((o) => event.origin.startsWith(o)) ||
          event.origin.includes("localhost") ||
          event.origin.includes("vercel.app");

        if (originOk && event.data.payload) {
          setPreviewData(event.data.payload);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Notify parent window or opener that preview listener is ready
    try {
      if (window.opener) {
        window.opener.postMessage({ type: "BLANK_SEOUL_PREVIEW_READY" }, "*");
      }
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "BLANK_SEOUL_PREVIEW_READY" }, "*");
      }
    } catch {
      // Ignore cross-origin parent postMessage errors
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!previewData) {
    return (
      <div className="min-h-screen bg-sand-light flex flex-col items-center justify-center p-6 text-center">
        <meta name="robots" content="noindex, nofollow" />
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-dark mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Connecting to Blank Seoul Live Store Template...
        </h2>
        <p className="text-sm text-text-muted max-w-md">
          Waiting for real-time item specs from Admin Portal...
        </p>
      </div>
    );
  }

  // Convert raw preview payload to fully compliant ShopifyProduct object
  const shopifyProduct = adaptPreviewToShopifyProduct(previewData);

  return (
    <div className="pt-20 bg-white min-h-screen">
      {/* SEO Safeguard: Block Search Engine Indexing */}
      <meta name="robots" content="noindex, nofollow" />

      {/* Live Preview Mode Floating Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white py-2.5 px-4 text-center text-xs font-semibold tracking-wide shadow-md flex items-center justify-center gap-2 sticky top-16 z-40">
        <span>📱</span>
        <span>BLANK SEOUL Live Storefront Preview (100% Real Time Sync)</span>
        <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono uppercase">Live View</span>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-text-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-primary font-medium">{shopifyProduct.vendor}</span>
          <span>/</span>
          <span className="text-dark font-medium">{shopifyProduct.title}</span>
        </nav>
      </div>

      {/* Product Section — Uses Actual Live Interactive Detail Component */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
        <ProductInteractive product={shopifyProduct} isPreview={true} />
      </section>

      {/* Social Proof & Reviews */}
      <Reviews />
    </div>
  );
}
