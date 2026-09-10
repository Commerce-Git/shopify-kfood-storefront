"use client";

import { useState, useEffect } from "react";
import { UPSELL_CANDIDATES, getContextualUpsells, type UpsellCandidate } from "@/lib/config/cart-upsells";
import type { CartItem } from "@/lib/shopify/types";

interface UseCartUpsellsProps {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
}

export function useCartUpsells({ items, addToCart }: UseCartUpsellsProps) {
  const [addedUpsellId, setAddedUpsellId] = useState<string | null>(null);
  const [upsellStockMap, setUpsellStockMap] = useState<
    Record<string, { quantity: number | null; outOfStock: boolean }>
  >({});

  // Live stock guard for upsell candidates (protected by 15s SWR cache on /api/stock)
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

  // Contextual matching: sorted based on active cart categories
  const contextualCandidates = getContextualUpsells(items);

  // Filter out items already in cart or verified out-of-stock
  const availableUpsells = contextualCandidates.filter(
    (candidate) =>
      !items.some(
        (item) =>
          item.variantId === candidate.variantId ||
          item.productHandle === candidate.productHandle
      ) &&
      upsellStockMap[candidate.variantId]?.outOfStock !== true
  );

  const handleAddUpsell = (upsell: UpsellCandidate) => {
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

  return {
    availableUpsells,
    addedUpsellId,
    handleAddUpsell,
  };
}
