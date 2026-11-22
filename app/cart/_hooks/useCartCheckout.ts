"use client";

import { useState, useRef, useEffect } from "react";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { useMarket } from "../../components/MarketProvider";
import { CREATE_CART } from "@/lib/shopify/queries";
import type { CartItem } from "@/lib/shopify/types";
import { isStoreLive } from "@/lib/constants";

import { checkoutDestination, checkoutErrorMessage, CartChangedError, CheckoutError, type CheckoutResponse } from "@/lib/cart/checkout";

interface UseCartCheckoutProps {
  items: CartItem[];
  appliedCoupon: string | null;
  confirmPrices: (signal: AbortSignal, expected: CartItem[]) => Promise<boolean>;
  refreshPrices: () => void;
  backupToStorageOnly: (variantIds: string[]) => void;
}

export function useCartCheckout({
  items,
  appliedCoupon,
  backupToStorageOnly, confirmPrices, refreshPrices,
}: UseCartCheckoutProps) {
  const { country } = useMarket();
  const inFlight = useRef(false);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resume = () => { inFlight.current = false; setLoading(false); setIsRedirecting(false); };
    window.addEventListener('pageshow', resume);
    return () => window.removeEventListener('pageshow', resume);
  }, []);

  const handleCheckout = async () => {
    if (!isStoreLive() || items.length === 0 || inFlight.current) return;
    inFlight.current = true;
    let redirected = false;

    setLoading(true);
    setError(null);

    try {
      if (!await confirmPrices(AbortSignal.timeout(15000), items)) {
        throw new CheckoutError('Review your bag before continuing to checkout.');
      }
      const lines = items.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      }));

      const data = await storefrontFetch<CheckoutResponse>(CREATE_CART, {
        lines, country,
        discountCodes: appliedCoupon ? [appliedCoupon] : undefined,
      }, { cache: "no-store", signal: AbortSignal.timeout(20000) });

      const destination = checkoutDestination(data, items, appliedCoupon);
      // Show redirect overlay before redirecting
      setIsRedirecting(true);

      // Backup to localStorage for abandonment recovery
      backupToStorageOnly(items.map((i) => i.variantId));

      window.location.assign(destination);
      redirected = true;
    } catch (err) {
      if (err instanceof CartChangedError) refreshPrices();
      setError(checkoutErrorMessage(err));
      setIsRedirecting(false);
    } finally {
      if (!redirected) { inFlight.current = false; setLoading(false); }
    }
  };

  return {
    loading,
    isRedirecting,
    error,
    setError,
    handleCheckout,
  };
}
