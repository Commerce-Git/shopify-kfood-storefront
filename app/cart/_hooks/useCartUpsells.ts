"use client";

import { useState, useEffect } from "react";
import type { CartItem } from "@/lib/shopify/types";
import type { CompanionProduct, ArtistToFollow } from "@/app/api/cart-companions/route";

interface UseCartUpsellsProps {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
}

// Module-level in-memory cache to prevent redundant fetches when quantity changes
const companionCache = new Map<string, { companions: CompanionProduct[]; artistsToFollow: ArtistToFollow[] }>();

export function useCartUpsells({ items, addToCart }: UseCartUpsellsProps) {
  const [companions, setCompanions] = useState<CompanionProduct[]>([]);
  const [artistsToFollow, setArtistsToFollow] = useState<ArtistToFollow[]>([]);
  const [fetchedKey, setFetchedKey] = useState<string>("");
  const [addedUpsellId, setAddedUpsellId] = useState<string | null>(null);

  // Derive unique sorted handles key so quantity updates (1 -> 2) don't trigger refetch
  const handlesKey = Array.from(new Set(items.map((i) => i.productHandle.toLowerCase())))
    .sort()
    .join(",");

  useEffect(() => {
    // If no items in cart or already cached, skip effect (derived state handles render directly)
    if (!handlesKey || companionCache.has(handlesKey)) return;

    let isMounted = true;

    fetch(`/api/cart-companions?handles=${encodeURIComponent(handlesKey)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          const comp = data.companions || [];
          const artists = data.artistsToFollow || [];
          companionCache.set(handlesKey, { companions: comp, artistsToFollow: artists });
          setCompanions(comp);
          setArtistsToFollow(artists);
        } else {
          setCompanions([]);
          setArtistsToFollow([]);
        }
        setFetchedKey(handlesKey);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[useCartUpsells Error]:", err);
        setCompanions([]);
        setArtistsToFollow([]);
        setFetchedKey(handlesKey);
      });

    return () => {
      isMounted = false;
    };
  }, [handlesKey]);

  const handleAddUpsell = (upsell: CompanionProduct) => {
    setAddedUpsellId(upsell.variantId);

    addToCart({
      variantId: upsell.variantId,
      productHandle: upsell.productHandle,
      title: upsell.title,
      variantTitle: upsell.variantTitle,
      price: upsell.price,
      quantity: 1,
      image: upsell.image,
    });

    setTimeout(() => {
      setAddedUpsellId(null);
    }, 800);
  };

  // React 19 Derived State: calculate during render to avoid cascading renders in useEffect
  const cachedData = handlesKey ? companionCache.get(handlesKey) : null;
  const activeCompanions = handlesKey ? (cachedData?.companions ?? companions) : [];
  const activeArtistsToFollow = handlesKey ? (cachedData?.artistsToFollow ?? artistsToFollow) : [];
  const activeIsLoading = Boolean(handlesKey && !cachedData && fetchedKey !== handlesKey);

  return {
    companions: activeCompanions,
    artistsToFollow: activeArtistsToFollow,
    isLoading: activeIsLoading,
    addedUpsellId,
    handleAddUpsell,
  };
}
