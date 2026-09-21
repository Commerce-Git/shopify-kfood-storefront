"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/components/CartProvider";
import { isStoreLive } from "@/lib/constants";
import PrelaunchWaitlistCard from "@/app/components/PrelaunchWaitlistCard";

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const pathname = usePathname();

  // Close drawer on navigation
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname, setIsCartOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock background body scroll when drawer is active
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);



  return (
    <>
      {/* Backdrop Dim Scrim */}
      <div
        className={`fixed inset-0 bg-black/45 backdrop-blur-xs z-[80] transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Responsive Drawer: Bottom Sheet on Mobile, Slide-over on Desktop */}
      <aside
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
        className={`
          fixed z-[90] bg-[#FFFFFF] shadow-2xl flex flex-col transition-transform duration-300 ease-out border-t md:border-t-0 md:border-l border-[#E8DFC8]/60
          /* Mobile: Bottom Sheet (Pure Vertical Slide) */
          bottom-0 inset-x-0 max-h-[85vh] rounded-t-3xl translate-x-0
          ${isCartOpen ? "translate-y-0" : "translate-y-full"}
          /* Desktop: Right Slide Panel (Pure Horizontal Slide) */
          md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-full md:w-full md:max-w-[420px] md:rounded-none md:max-h-full md:translate-y-0
          ${isCartOpen ? "md:translate-x-0" : "md:translate-x-full"}
        `}
      >
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div
          className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3 md:hidden shrink-0 cursor-pointer"
          onClick={() => setIsCartOpen(false)}
          title="Tap to close"
        />

        {/* Top Header Row (Etsy Style: Subtotal & Quick Actions) */}
        <div className="px-5 py-3.5 border-b border-[#E8DFC8]/60 flex items-center justify-between shrink-0 bg-[#FAF9F6]">
          <div className="flex items-baseline gap-2">
            <h2
              className="text-base font-extrabold text-[#18181B]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your Bag
            </h2>
            <span className="text-xs font-semibold text-[#71717A]">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer text-sm font-bold"
            aria-label="Close cart drawer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Item List (Strictly Added Items Only, Zero Upsell Noise) */}
        <div className="flex-1 overflow-y-auto px-5 divide-y divide-[#E8DFC8]/40">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">🛒</div>
              <p
                className="text-base font-bold text-[#18181B] mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Your bag is empty
              </p>
              <p className="text-xs text-[#71717A] mb-6">
                Explore curated authentic Korean lifestyle treasures.
              </p>
              <Link
                href="/collections"
                onClick={() => setIsCartOpen(false)}
                className="btn-primary text-xs font-bold py-2.5 px-6 inline-block rounded-full"
              >
                Explore Collections →
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const lineTotal = (parseFloat(item.price) * item.quantity).toFixed(2);

              return (
                <div key={item.variantId} className="py-4 flex gap-3.5 items-center">
                  {/* Thumbnail */}
                  <div className="w-18 h-18 rounded-xl bg-[#FAF9F6] border border-[#E8DFC8]/60 overflow-hidden shrink-0 relative">
                    {item.image?.url && item.image.url.trim() !== "" ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.altText || item.title}
                        fill
                        unoptimized={item.image.url.includes("cdn.shopify.com")}
                        className="object-cover"
                        sizes="72px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.productHandle}`}
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs font-bold text-[#18181B] hover:text-[#C25E38] transition-colors truncate block leading-snug"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.title}
                    </Link>
                    {item.variantTitle && item.variantTitle !== "Default Title" && (
                      <p className="text-[11px] text-[#71717A] truncate mt-0.5">
                        {item.variantTitle}
                      </p>
                    )}
                    <p className="text-xs font-extrabold text-[#18181B] mt-1">
                      ${lineTotal}
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-[#71717A] font-normal ml-1">
                          (${item.price} ea)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Quantity and Delete Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#FAF9F6] border border-[#E8DFC8]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-white border border-[#E8DFC8] flex items-center justify-center hover:border-[#18181B] active:scale-95 transition-all text-xs font-bold text-[#18181B] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold w-5 text-center text-[#18181B]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-white border border-[#E8DFC8] flex items-center justify-center hover:border-[#18181B] active:scale-95 transition-all text-xs font-bold text-[#18181B] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.variantId)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E8DFC8]/60 bg-[#FAF9F6] shrink-0 space-y-3">
            {/* Subtotal & Origin Strip */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#71717A]">Subtotal</span>
              <span className="font-extrabold text-base text-[#18181B]">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <p className="text-[11px] text-[#71717A] text-center flex items-center justify-center gap-1.5">
              <span>🇰🇷</span>
              <span>100% Made in Korea &middot; Direct Dispatch</span>
            </p>

            {/* Primary Action Section */}
            {!isStoreLive() ? (
              <PrelaunchWaitlistCard
                items={items}
                layout="drawer"
                idPrefix="drawer-waitlist"
                onActionClick={() => setIsCartOpen(false)}
              />
            ) : (
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="w-full btn-primary py-3.5 px-4 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-center shadow-sm hover:scale-[1.01] transition-transform"
              >
                <span>View Cart</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}

            {/* Secondary Action Link */}
            {isStoreLive() ? (
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="block w-full text-center text-xs text-[#71717A] hover:text-[#18181B] font-medium underline underline-offset-2 transition-colors pt-0.5 cursor-pointer"
              >
                Continue Shopping
              </button>
            ) : (
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="block text-center text-xs text-[#71717A] hover:text-[#18181B] font-semibold underline underline-offset-2 transition-colors pt-0.5"
              >
                View Full Cart & Details
              </Link>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
