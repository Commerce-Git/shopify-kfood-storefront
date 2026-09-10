"use client";

import { useState } from "react";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { CREATE_CART } from "@/lib/shopify/queries";
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
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
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

      // Show redirect overlay before redirecting
      setIsRedirecting(true);

      // Backup to localStorage for abandonment recovery
      backupToStorageOnly(items.map((i) => i.variantId));

      window.location.href = cart.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsRedirecting(false);
    } finally {
      setLoading(false);
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
