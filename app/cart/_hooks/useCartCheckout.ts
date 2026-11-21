"use client";

import { useState, useRef, useEffect } from "react";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { useMarket } from "../../components/MarketProvider";
import { fetchBagPrices } from "@/lib/cart/market-prices";
import { CREATE_CART } from "@/lib/shopify/queries";
import type { CartItem } from "@/lib/shopify/types";
import { isStoreLive } from "@/lib/constants";

import { checkoutDestination, checkoutErrorMessage, CheckoutError, type CheckoutResponse } from "@/lib/cart/checkout";

interface UseCartCheckoutProps {
  items: CartItem[];
  appliedCoupon: string | null;
  backupToStorageOnly: (variantIds: string[]) => void;
}

export function useCartCheckout({
  items,
  appliedCoupon,
  backupToStorageOnly,
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
      const quotes = await fetchBagPrices(country, items.map(item => item.variantId), AbortSignal.timeout(15000));
      if (quotes.some((q, i) => !q.amount || q.id !== items[i].variantId || Number(q.amount) !== Number(items[i].price))) {
        throw new CheckoutError('Prices or availability changed. Refresh your bag before continuing.');
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

      const prices = new Map(data.cartCreate.cart!.lines.edges.map(({ node }) => [node.merchandise.id, node.merchandise.price]));
      if (items.some(item => prices.get(item.variantId)?.currencyCode !== 'USD' || Number(prices.get(item.variantId)?.amount) !== Number(item.price))) {
        throw new CheckoutError('Prices changed. Refresh your bag before continuing.');
      }
      // Show redirect overlay before redirecting
      setIsRedirecting(true);

      // Backup to localStorage for abandonment recovery
      backupToStorageOnly(items.map((i) => i.variantId));

      window.location.assign(destination);
      redirected = true;
    } catch (err) {
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
