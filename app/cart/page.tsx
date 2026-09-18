"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/app/components/CartProvider";
import { useAuth } from "@/app/components/AuthProvider";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { GET_PRODUCT_BY_HANDLE } from "@/lib/shopify/queries";
import type { CartItem } from "@/lib/shopify/types";
import type { AvailableCoupon } from "@/lib/types/coupon";
import { useCartCheckout } from "./_hooks/useCartCheckout";
import { useCartUpsells } from "./_hooks/useCartUpsells";
import CartItemList, { type ProductVariantOption } from "./_components/CartItemList";
import CartUpsellShelf from "./_components/CartUpsellShelf";
import CartCouponDrawer from "./_components/CartCouponDrawer";
import CartBackupModal from "./_components/CartBackupModal";
import CartOrderSummary from "./_components/CartOrderSummary";

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

  const { user } = useAuth();
  const [backup, setBackup] = useState(getCheckoutBackup());
  const [productVariantsMap, setProductVariantsMap] = useState<Record<string, ProductVariantOption[]>>({});
  const [availableCoupon, setAvailableCoupon] = useState<AvailableCoupon | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Initialize backup safely on client mount
  useEffect(() => {
    if (itemCount === 0) {
      setBackup(getCheckoutBackup());
    }
  }, [itemCount, getCheckoutBackup]);

  // Hook 1: Checkout execution & redirection
  const { loading, isRedirecting, error, handleCheckout } = useCartCheckout({
    items,
    appliedCoupon,
    backupToStorageOnly,
  });

  // Hook 2: Contextual upsells & live stock checking
  const {
    companions,
    artistsToFollow,
    isLoading: isUpsellLoading,
    addedUpsellId,
    handleAddUpsell,
  } = useCartUpsells({
    items,
    addToCart,
  });

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
        product: {
          variants: {
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#C25E38]" />
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
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#18181B] mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Your Blank Seoul Box is Waiting!
          </h1>
          <p className="text-sm text-[#71717A] mb-8 leading-relaxed">
            Looks like you haven&apos;t added any authentic Korean treasures to your collection yet.
          </p>

          {backup && (
            <CartBackupModal
              backup={backup}
              onRestore={restoreFromBackup}
              onDismiss={() => {
                dismissBackup();
                setBackup(null);
              }}
            />
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
    <div className="pt-24 sm:pt-28 pb-32 lg:pb-24 min-h-screen bg-[#FAF9F6]">
      {/* 1. Header Bar */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-3 items-center py-2">
          <div>
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
          <div className="justify-self-end">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9]">
              <span>🔒</span> Secure Checkout
            </div>
          </div>
        </div>
      </div>

      {/* 2. 3-Step Checkout Stepper */}
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

      {/* 3. Main 2-Column Responsive Layout */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Items, Upsells, and Coupons */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            <CartItemList
              items={items}
              productVariantsMap={productVariantsMap}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              onOptionChange={handleOptionChange}
            />

            <CartUpsellShelf
              companions={companions}
              artistsToFollow={artistsToFollow}
              isLoading={isUpsellLoading}
              addedUpsellId={addedUpsellId}
              onAddUpsell={handleAddUpsell}
            />

            <CartCouponDrawer
              availableCoupon={availableCoupon}
              appliedCoupon={appliedCoupon}
              couponLoading={couponLoading}
              onApplyCoupon={(code) => setAppliedCoupon(code)}
              onRemoveCoupon={() => setAppliedCoupon(null)}
            />
          </div>

          {/* Right Column: Order Summary */}
          <CartOrderSummary
            subtotal={subtotal}
            discountAmount={discountAmount}
            finalTotal={finalTotal}
            discountLabel={availableCoupon?.discountLabel}
            loading={loading}
            error={error}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
