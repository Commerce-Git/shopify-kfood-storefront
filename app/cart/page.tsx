"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../components/CartProvider";
import { useAuth } from "../components/AuthProvider";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { CREATE_CART, GET_PRODUCT_BY_HANDLE } from "@/lib/shopify/queries";
import { CANCEL_WINDOW_HOURS } from "@/lib/constants";
import type { CartItem } from "@/lib/shopify/types";

interface CartResponse {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    };
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
}

// 2026 Curated In-Cart Companion Order Bumps (100% Real Live Shopify Products)
const UPSELL_CANDIDATES = [
  {
    variantId: "gid://shopify/ProductVariant/52855941595448",
    productHandle: "gat-mother-of-pearl-keyring",
    title: "Gat Mother-of-Pearl Keyring",
    variantTitle: "Default Title",
    price: "38.00",
    image: {
      url: "https://cdn.shopify.com/s/files/1/0989/8927/7496/files/fffa8bfa008f4a06b22b52fdbbf8d0e4_512.jpg?v=1787474869",
      altText: "Gat Mother-of-Pearl Keyring",
      width: 500,
      height: 500,
    },
    pitch: "Traditional Joseon Gat hat adorned with shimmering mother-of-pearl",
    emoji: "✨",
  },
  {
    variantId: "gid://shopify/ProductVariant/52838545883448",
    productHandle: "dancheong-tassel-keyring",
    title: "Dancheong Tassel Keyring",
    variantTitle: "Default Title",
    price: "32.00",
    image: {
      url: "https://cdn.shopify.com/s/files/1/0989/8927/7496/files/1787475577145.jpg?v=1787475728",
      altText: "Dancheong Tassel Keyring",
      width: 500,
      height: 500,
    },
    pitch: "Vibrant palace Dancheong pattern with a silk tassel accent",
    emoji: "🏮",
  },
  {
    variantId: "gid://shopify/ProductVariant/52849149477176",
    productHandle: "chrysanthemum-knot-daenggi-keyring",
    title: "Chrysanthemum Knot Daenggi Keyring",
    variantTitle: "Default Title",
    price: "49.00",
    image: {
      url: "https://cdn.shopify.com/s/files/1/0989/8927/7496/files/cf1fc98f78814ae4ade57230a1b18037_512.jpg?v=1787647748",
      altText: "Chrysanthemum Knot Daenggi Keyring",
      width: 500,
      height: 500,
    },
    pitch: "Joseon ribbon charm woven with traditional chrysanthemum knots",
    emoji: "🎀",
  },
  {
    variantId: "gid://shopify/ProductVariant/52834203173176",
    productHandle: "joseon-peony-pattern-card-wallet",
    title: "Joseon Peony Pattern Card Wallet",
    variantTitle: "Default Title",
    price: "32.00",
    image: {
      url: "https://cdn.shopify.com/s/files/1/0989/8927/7496/files/6b2fa81621ab40238edfecff6fbba7b4_512.jpg?v=1787293514",
      altText: "Joseon Peony Pattern Card Wallet",
      width: 500,
      height: 500,
    },
    pitch: "Blue porcelain peony pattern card wallet with dedicated key loop",
    emoji: "🌸",
  },
];

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemVariant,
    backupToStorageOnly,
    restoreFromBackup,
    dismissBackup,
    getCheckoutBackup,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedUpsellId, setAddedUpsellId] = useState<string | null>(null);
  const [upsellStockMap, setUpsellStockMap] = useState<Record<string, { quantity: number | null; outOfStock: boolean }>>({});
  
  interface ProductVariantOption {
    id: string;
    title: string;
    price: string;
    availableForSale: boolean;
    image?: {
      url: string;
      altText?: string | null;
    } | null;
  }
  const [productVariantsMap, setProductVariantsMap] = useState<Record<string, ProductVariantOption[]>>({});
  const { user } = useAuth();
  const [backup, setBackup] = useState<any>(null);

  // Initialize backup safely on client mount to prevent hydration mismatch
  useEffect(() => {
    if (itemCount === 0) {
      setBackup(getCheckoutBackup());
    }
  }, [itemCount, getCheckoutBackup]);

  // Non-blocking background live stock guard for upsell candidates
  useEffect(() => {
    UPSELL_CANDIDATES.forEach((candidate) => {
      fetch(`/api/stock?variantId=${encodeURIComponent(candidate.variantId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const outOfStock = data.currentlyNotInStock === true || data.quantityAvailable === 0;
            setUpsellStockMap((prev) => ({
              ...prev,
              [candidate.variantId]: {
                quantity: data.quantityAvailable ?? null,
                outOfStock,
              },
            }));
          }
        })
        .catch(() => {});
    });
  }, []);

  const handleDismissBackup = () => {
    dismissBackup();
    setBackup(null);
  };

  // Coupon state
  interface AvailableCoupon {
    code: string;
    discountLabel: string;
    expiresAt: string;
  }
  const [availableCoupon, setAvailableCoupon] = useState<AvailableCoupon | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Fetch available coupons for logged-in users
  useEffect(() => {
    if (!user?.email) return;
    setCouponLoading(true);
    fetch("/api/my-coupons")
      .then((res) => res.json())
      .then((data) => {
        const active = data.coupons?.find(
          (c: AvailableCoupon & { status: string }) => c.status === "active"
        );
        if (active) setAvailableCoupon(active);
      })
      .catch(() => {})
      .finally(() => setCouponLoading(false));
  }, [user?.email]);

  // Fetch product variants for multi-variant items in cart
  useEffect(() => {
    const multiVariantHandles = Array.from(
      new Set(
        items
          .filter((item) => item.variantTitle && item.variantTitle !== "Default Title")
          .map((item) => item.productHandle)
      )
    );

    multiVariantHandles.forEach((handle) => {
      if (productVariantsMap[handle]) return;

      storefrontFetch<{
        product?: {
          variants?: {
            edges: Array<{
              node: {
                id: string;
                title: string;
                availableForSale: boolean;
                price: { amount: string };
                image?: { url: string; altText?: string } | null;
              };
            }>;
          };
        };
      }>(GET_PRODUCT_BY_HANDLE, { handle })
        .then((res) => {
          const variantNodes =
            res.product?.variants?.edges?.map((e) => ({
              id: e.node.id,
              title: e.node.title,
              price: parseFloat(e.node.price.amount).toFixed(2),
              availableForSale: e.node.availableForSale,
              image: e.node.image,
            })) || [];

          if (variantNodes.length > 0) {
            setProductVariantsMap((prev) => ({
              ...prev,
              [handle]: variantNodes,
            }));
          }
        })
        .catch(() => {});
    });
  }, [items, productVariantsMap]);

  const handleOptionChange = (item: CartItem, newVariantId: string) => {
    const variants = productVariantsMap[item.productHandle];
    const targetVariant = variants?.find((v) => v.id === newVariantId);
    if (!targetVariant || !targetVariant.availableForSale) return;

    updateItemVariant(item.variantId, {
      variantId: targetVariant.id,
      variantTitle: targetVariant.title,
      price: targetVariant.price,
      image: targetVariant.image
        ? {
            url: targetVariant.image.url,
            altText: targetVariant.image.altText || item.title,
            width: 500,
            height: 500,
          }
        : item.image,
    });
  };

  async function handleCheckout() {
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const lines = items.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      }));

      const data = await storefrontFetch<CartResponse>(CREATE_CART, {
        lines,
        discountCodes: appliedCoupon ? [appliedCoupon] : undefined,
      });

      const { cart, userErrors } = data.cartCreate;

      if (userErrors.length > 0) {
        setError(userErrors[0].message);
        return;
      }

      // Show redirect overlay BEFORE touching storage
      setIsRedirecting(true);

      // Backup to localStorage only (no React re-render = no flash)
      backupToStorageOnly(items.map((i) => i.variantId));

      window.location.href = cart.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsRedirecting(false);
    } finally {
      setLoading(false);
    }
  }

  // Dynamic Contextual Matching: Sort candidates based on current cart items
  const hasBagInCart = items.some(
    (i) =>
      i.productHandle.includes("bag") ||
      i.productHandle.includes("pouch") ||
      i.productHandle.includes("tote")
  );
  const hasWalletInCart = items.some(
    (i) =>
      i.productHandle.includes("wallet") ||
      i.productHandle.includes("case") ||
      i.productHandle.includes("hopae")
  );
  const hasFabricInCart = items.some(
    (i) =>
      i.productHandle.includes("fabric") ||
      i.productHandle.includes("knot") ||
      i.productHandle.includes("coaster")
  );

  const contextualCandidates = [...UPSELL_CANDIDATES].sort((a, b) => {
    if (hasBagInCart) {
      if (a.productHandle === "dancheong-tassel-keyring") return -1;
      if (b.productHandle === "dancheong-tassel-keyring") return 1;
      if (a.productHandle === "chrysanthemum-knot-daenggi-keyring") return -1;
      if (b.productHandle === "chrysanthemum-knot-daenggi-keyring") return 1;
    } else if (hasWalletInCart) {
      if (a.productHandle === "gat-mother-of-pearl-keyring") return -1;
      if (b.productHandle === "gat-mother-of-pearl-keyring") return 1;
      if (a.productHandle === "dancheong-tassel-keyring") return -1;
      if (b.productHandle === "dancheong-tassel-keyring") return 1;
    } else if (hasFabricInCart) {
      if (a.productHandle === "gat-mother-of-pearl-keyring") return -1;
      if (b.productHandle === "gat-mother-of-pearl-keyring") return 1;
      if (a.productHandle === "joseon-peony-pattern-card-wallet") return -1;
      if (b.productHandle === "joseon-peony-pattern-card-wallet") return 1;
    }
    return 0;
  });

  // Filter out upsells already present in the cart AND out-of-stock items (Live Guard)
  const availableUpsells = contextualCandidates.filter(
    (candidate) =>
      !items.some(
        (item) =>
          item.variantId === candidate.variantId ||
          item.productHandle === candidate.productHandle
      ) &&
      upsellStockMap[candidate.variantId]?.outOfStock !== true
  );

  const handleAddUpsell = (upsell: (typeof UPSELL_CANDIDATES)[0]) => {
    if (addedUpsellId) return; // Prevent double-click debounce
    setAddedUpsellId(upsell.variantId);

    const liveStockLimit = upsellStockMap[upsell.variantId]?.quantity ?? undefined;

    addToCart({
      variantId: upsell.variantId,
      productHandle: upsell.productHandle,
      title: upsell.title,
      variantTitle: upsell.variantTitle,
      price: upsell.price,
      quantity: 1,
      image: upsell.image,
      stockLimit: liveStockLimit,
    });

    setTimeout(() => {
      setAddedUpsellId(null);
    }, 800);
  };

  // Full-screen redirect overlay
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Redirecting to Secure Checkout
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please wait while we connect you to our encrypted payment gateway...
          </p>
          <div className="w-8 h-8 border-3 border-[#C25E38] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Empty cart state
  if (itemCount === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center px-4 max-w-md mx-auto">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18181B] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Your Blank Seoul Box is Waiting!
          </h1>
          <p className="text-sm text-[#71717A] mb-8 leading-relaxed">
            Looks like you haven&apos;t added any authentic Korean treasures to your collection yet.
          </p>

          {/* Checkout restore banner */}
          {backup && (
            <div className="bg-[#FDF9F3] border border-[#E8DFC8] rounded-2xl p-5 mb-8 text-left shadow-xs">
              <p className="text-sm font-bold text-[#18181B] mb-1">
                Didn&apos;t complete your purchase?
              </p>
              <p className="text-xs text-[#71717A] mb-4">
                Your previous cart ({backup.items.length} {backup.items.length === 1 ? "item" : "items"}) is saved.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={restoreFromBackup}
                  className="flex-1 text-xs font-bold bg-[#C25E38] text-white px-4 py-2.5 rounded-xl hover:bg-[#A74B28] transition-all shadow-xs"
                >
                  Restore My Cart ⚡
                </button>
                <button
                  type="button"
                  onClick={handleDismissBackup}
                  className="text-xs font-medium text-[#71717A] hover:text-[#18181B] px-4 py-2.5 rounded-xl border border-[#E8DFC8] hover:bg-white transition-all"
                >
                  No Thanks
                </button>
              </div>
            </div>
          )}

          <Link href="/" className="btn-primary inline-flex items-center gap-2 text-sm font-bold py-3.5 px-8">
            Yes, Build My Blank Seoul Box! →
          </Link>
        </div>
      </div>
    );
  }

  // Calculate discount when coupon is applied
  let discountAmount = 0;
  if (appliedCoupon && availableCoupon) {
    const match = availableCoupon.discountLabel.match(/(\d+)%/);
    if (match) {
      discountAmount = subtotal * (parseInt(match[1]) / 100);
    }
  }
  const finalTotal = subtotal - discountAmount;

  return (
    <div className="min-h-screen pb-24 md:pb-16 bg-[#FAF9F6]">
      {/* Walled Garden Layout CSS override */}
      <style dangerouslySetInnerHTML={{ __html: `
        header, footer {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
          background-color: #FAF9F6 !important;
        }
      `}} />

      {/* ── 1. Walled Garden Minimalist Header ── */}
      <div className="bg-white border-b border-[#E8DFC8]/60 py-4 mb-6 sm:mb-8 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 grid grid-cols-3 items-center">
          {/* Col 1: Left Back Link */}
          <div className="justify-self-start">
            <Link
              href="/"
              className="text-xs font-bold text-[#71717A] hover:text-[#C25E38] transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back to Shop
            </Link>
          </div>

          {/* Col 2: Centered Brand Logo */}
          <div className="justify-self-center">
            <Link href="/" className="flex items-center gap-1">
              <span
                className="text-xl sm:text-2xl font-extrabold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span className="gradient-text">Blank</span>
                <span className="text-[#18181B]"> Seoul</span>
              </span>
            </Link>
          </div>

          {/* Col 3: Right Secure Badge */}
          <div className="justify-self-end">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9]">
              <span>🔒</span> Secure Checkout
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. 3-Step Checkout Stepper ── */}
      <div className="max-w-4xl mx-auto px-4 mb-6 sm:mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-[#71717A] select-none">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#C25E38] font-bold">
            <span className="w-5 h-5 rounded-full bg-[#C25E38] text-white flex items-center justify-center text-[10px]">1</span>
            <span className="hidden sm:inline">Review Cart</span>
          </div>
          <div className="flex-1 h-[2px] bg-[#E8DFC8]/70 mx-2 sm:mx-4" />
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#A1A1AA]">
            <span className="w-5 h-5 rounded-full bg-[#F4EFE6] text-[#71717A] flex items-center justify-center text-[10px] border border-[#E8DFC8]">2</span>
            <span className="hidden sm:inline">Shipping Info</span>
          </div>
          <div className="flex-1 h-[2px] bg-[#E8DFC8]/70 mx-2 sm:mx-4" />
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#A1A1AA]">
            <span className="w-5 h-5 rounded-full bg-[#F4EFE6] text-[#71717A] flex items-center justify-center text-[10px] border border-[#E8DFC8]">3</span>
            <span className="hidden sm:inline">Secure Payment</span>
          </div>
        </div>
      </div>

      {/* ── 3. Main 2-Column Responsive Layout ── */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ════════ LEFT COLUMN: Cart Items & In-Cart Upsells (7 Cols) ════════ */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">

            {/* Cart Items Card Container */}
            <div className="bg-white border border-[#E8DFC8]/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-[#E8DFC8]/50">
                <h1 className="text-lg sm:text-xl font-extrabold text-[#18181B]" style={{ fontFamily: "var(--font-heading)" }}>
                  Your Selected Treasures
                </h1>
                <span className="text-xs font-semibold text-[#71717A]">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#E8DFC8]/40">
                {items.map((item) => {
                  const lineTotal = (parseFloat(item.price) * item.quantity).toFixed(2);

                  return (
                    <div key={item.variantId} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                      {/* Product Thumbnail */}
                      <div className="w-20 h-20 rounded-xl bg-[#FAF9F6] border border-[#E8DFC8]/60 overflow-hidden shrink-0 relative">
                        {item.image?.url && item.image.url.trim() !== "" ? (
                          <Image
                            src={item.image.url}
                            alt={item.image.altText || item.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.productHandle}`}
                          className="text-sm font-bold text-[#18181B] hover:text-[#C25E38] transition-colors truncate block"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {item.title}
                        </Link>
                        {item.variantTitle && item.variantTitle !== "Default Title" && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-[#71717A]">
                            <span className="shrink-0 font-medium">Option:</span>
                            {productVariantsMap[item.productHandle] && productVariantsMap[item.productHandle].length > 1 ? (
                              <select
                                value={item.variantId}
                                onChange={(e) => handleOptionChange(item, e.target.value)}
                                className="text-xs font-semibold text-[#18181B] bg-[#FAF9F6] border border-[#E8DFC8] rounded-lg px-2 py-0.5 hover:border-[#18181B] focus:border-[#18181B] transition-colors cursor-pointer outline-none shadow-2xs max-w-[200px] truncate"
                                aria-label="Change variant option"
                              >
                                {productVariantsMap[item.productHandle].map((v) => (
                                  <option key={v.id} value={v.id} disabled={!v.availableForSale}>
                                    {v.title} (${v.price}) {!v.availableForSale ? "— Sold Out" : ""}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="font-semibold text-[#3F3F46]">
                                {item.variantTitle}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-sm font-extrabold text-[#18181B] mt-1">
                          ${lineTotal}
                          {item.quantity > 1 && (
                            <span className="text-xs text-[#71717A] font-normal ml-1.5">
                              (${item.price} each)
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF9F6] border border-[#E8DFC8]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-[#E8DFC8] flex items-center justify-center hover:border-[#18181B] transition-colors text-xs font-bold text-[#18181B] shadow-2xs"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="text-xs font-bold w-6 text-center text-[#18181B]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.stockLimit !== undefined && item.stockLimit !== null && item.quantity >= item.stockLimit}
                            className="w-7 h-7 rounded-lg bg-white border border-[#E8DFC8] flex items-center justify-center hover:border-[#18181B] transition-colors text-xs font-bold text-[#18181B] shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        {item.stockLimit !== undefined && item.stockLimit !== null && item.quantity >= item.stockLimit && (
                          <span className="text-[9px] text-amber-600 font-semibold mt-1 select-none whitespace-nowrap">
                            Max stock ({item.stockLimit} left)
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-[#A1A1AA] hover:text-red-500 transition-colors p-1 shrink-0"
                        aria-label="Remove item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 4. 1-Click In-Cart Order Bump (Smart Filtered) ── */}
            {availableUpsells.length > 0 && (
              <div className="bg-white border border-[#E8DFC8]/80 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[#E8DFC8]/50">
                  <span className="text-base">✨</span>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-[#18181B] uppercase tracking-wider">
                      Complete Your Seoul Box
                    </h2>
                    <p className="text-[11px] text-[#71717A]">
                      Popular companion treasures handcrafted in Seoul — 1-click addition.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableUpsells.slice(0, 2).map((upsell) => (
                    <div
                      key={upsell.variantId}
                      className="p-3 rounded-xl bg-[#FDF9F3]/60 border border-[#E8DFC8] flex items-center justify-between gap-3 hover:bg-[#FDF9F3] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-white border border-[#E8DFC8] overflow-hidden shrink-0 relative">
                          <Image
                            src={upsell.image.url}
                            alt={upsell.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#18181B] truncate">
                            {upsell.title}
                          </p>
                          <p className="text-xs font-extrabold text-[#C25E38] mt-0.5">
                            ${upsell.price}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddUpsell(upsell)}
                        disabled={Boolean(addedUpsellId)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer ${
                          addedUpsellId === upsell.variantId
                            ? "bg-[#2E7D32] text-white border border-[#2E7D32] scale-105"
                            : "bg-white border border-[#C25E38] text-[#C25E38] hover:bg-[#C25E38] hover:text-white"
                        }`}
                      >
                        {addedUpsellId === upsell.variantId ? "✓ Added!" : "+ Add"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 5. Coupon Section ── */}
            {!couponLoading && availableCoupon && !appliedCoupon && (
              <div className="bg-[#FDF9F3] border border-[#E8DFC8] rounded-2xl p-4 sm:p-5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎫</span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#18181B]">
                        You have a {availableCoupon.discountLabel} discount coupon!
                      </p>
                      <p className="text-[11px] text-[#71717A]">
                        Code: <code className="font-bold text-[#C25E38]">{availableCoupon.code}</code>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(availableCoupon.code)}
                    className="text-xs font-bold text-white bg-[#C25E38] hover:bg-[#A74B28] px-4 py-2 rounded-xl transition-all shadow-xs"
                  >
                    Apply Coupon 🎉
                  </button>
                </div>
              </div>
            )}

            {appliedCoupon && (
              <div className="bg-[#E8F5E9]/80 border border-[#C8E6C9] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">✅</span>
                  <div>
                    <span className="text-xs font-bold text-[#1B5E20]">
                      {availableCoupon?.discountLabel} coupon applied!
                    </span>
                    <span className="text-[10px] font-bold text-[#2E7D32] bg-white px-2 py-0.5 rounded border border-[#C8E6C9] ml-2">
                      {appliedCoupon}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs text-[#71717A] hover:text-red-500 font-bold transition-colors"
                >
                  Remove
                </button>
              </div>
            )}

          </div>

          {/* ════════ RIGHT COLUMN: Sticky Order Summary & Checkout (5 Cols) ════════ */}
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-[#E8DFC8]/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-[#18181B] pb-3 border-b border-[#E8DFC8]/50" style={{ fontFamily: "var(--font-heading)" }}>
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-[#52525B]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#18181B]">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  <span className="font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded text-[11px]">
                    FREE
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#2E7D32]">
                    <span className="font-medium">🎫 {availableCoupon?.discountLabel} Discount</span>
                    <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Final Total */}
              <div className="border-t border-[#E8DFC8]/60 pt-3.5 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-[#18181B]" style={{ fontFamily: "var(--font-heading)" }}>
                    Total (USD)
                  </span>
                  <p className="text-[10px] text-[#71717A]">Taxes and shipping included</p>
                </div>
                <div className="text-right">
                  {discountAmount > 0 && (
                    <span className="text-xs text-[#71717A] line-through mr-2">
                      ${subtotal.toFixed(2)}
                    </span>
                  )}
                  <span className="text-2xl font-black text-[#18181B]" style={{ fontFamily: "var(--font-heading)" }}>
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* ── ⚡ Zero Risk, Guaranteed Gold Card (Russell Brunson CRO Hero) ── */}
              <div className="p-3.5 rounded-xl bg-[#FDF9F3] border border-[#E8DFC8] flex items-start gap-2.5 text-xs shadow-2xs">
                <span className="text-base shrink-0 mt-0.5">⚡</span>
                <div className="leading-relaxed">
                  <p className="font-bold text-[#18181B]">Zero Risk, Guaranteed</p>
                  <p className="text-[#71717A] text-[11px] mt-0.5">
                    Not 100% sure? Cancel yourself in 1 click within {CANCEL_WINDOW_HOURS} hours directly from your order page.
                  </p>
                </div>
              </div>

              {/* Main Checkout CTA Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className={`btn-primary w-full text-sm sm:text-base font-bold py-4 shadow-md transition-all cursor-pointer ${
                  loading ? "opacity-70 cursor-wait" : "hover:shadow-lg hover:scale-[1.01]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connecting to Checkout...
                  </span>
                ) : (
                  "Yes! Send Me The Blank Seoul Box! 🚀"
                )}
              </button>

              {error && (
                <p className="text-xs text-red-500 text-center font-medium bg-red-50 p-2 rounded-lg border border-red-200">
                  {error}
                </p>
              )}

              {/* ── 1-Line Micro Trust Bar ── */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] text-[#71717A] font-medium border-t border-[#E8DFC8]/40">
                <span className="flex items-center gap-1">🔒 256-Bit SSL</span>
                <span>•</span>
                <span className="flex items-center gap-1">✈️ Tracked Express</span>
                <span>•</span>
                <span className="flex items-center gap-1">🛡️ 30-Day Returns</span>
                <span>•</span>
                <span className="flex items-center gap-1">🇰🇷 Made in Korea</span>
              </div>
            </div>

            {/* Continue Shopping Link */}
            <div className="text-center pt-1">
              <Link
                href="/"
                className="text-xs font-bold text-[#71717A] hover:text-[#C25E38] transition-colors inline-flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Continue Exploring Curations
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile Fixed Floating Checkout Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8DFC8] p-3.5 sm:p-4 lg:hidden z-40 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">Total</p>
            <p className="text-lg font-black text-[#18181B]" style={{ fontFamily: "var(--font-heading)" }}>
              ${finalTotal.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className={`btn-primary flex-1 py-3 text-sm font-bold shadow-md cursor-pointer ${
              loading ? "opacity-70 cursor-wait" : ""
            }`}
          >
            {loading ? "Processing..." : "Send My Box 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
