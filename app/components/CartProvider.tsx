"use client";

import { useBagPrices } from "./useBagPrices";
import { useMarket } from "./MarketProvider";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useStoredValue, notifyStorageChanged } from "@/lib/hooks/useStoredValue";
import { parseCart, mergeCartItems, changeCartVariant, boundedQuantity } from "@/lib/cart/items";
import type { CartItem } from "@/lib/shopify/types";

export interface CheckoutBackup {
  timestamp: string;
  items: CartItem[];
}

interface CartContextType {
  pricing: ReturnType<typeof useBagPrices>;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (item: CartItem) => void;
  addBundleToCart: (items: CartItem[]) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  updateItemVariant: (
    oldVariantId: string,
    newVariant: {
      variantId: string;
      variantTitle: string;
      price: string;
      image?: CartItem["image"];
      stockLimit?: number | null;
    }
  ) => void;
  clearCart: () => void;
  checkoutAndBackup: (variantIds: string[]) => void;
  backupToStorageOnly: (variantIds: string[]) => void;
  restoreFromBackup: () => void;
  dismissBackup: () => void;
  getCheckoutBackup: () => CheckoutBackup | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "blank-seoul-cart";
const BACKUP_STORAGE_KEY = "blank-seoul-checkout-backup";
const BACKUP_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return parseCart(localStorage.getItem(CART_STORAGE_KEY)); } catch { return []; }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  notifyStorageChanged();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const storedCart = useStoredValue(CART_STORAGE_KEY);
  const items = useMemo(() => parseCart(storedCart), [storedCart]);
  const setItems = useCallback((update: React.SetStateAction<CartItem[]>) => {
    saveCart(typeof update === "function" ? update(loadCart()) : update);
  }, []);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { country } = useMarket();
  const pricing = useBagPrices(country, items, isCartOpen, loadCart, saveCart);

  // Clean expired backups; cart hydration is handled by the external store.
  useEffect(() => {
    // Auto-clean expired backup
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (raw) {
        const backup: CheckoutBackup = JSON.parse(raw);
        if (!Number.isFinite(Date.parse(backup.timestamp)) || Date.now() - Date.parse(backup.timestamp) > BACKUP_EXPIRY_MS) {
          localStorage.removeItem(BACKUP_STORAGE_KEY);
          notifyStorageChanged();
        }
      }
    } catch {
      localStorage.removeItem(BACKUP_STORAGE_KEY);
      notifyStorageChanged();
    }
  }, []);

  const addToCart = useCallback((newItem: CartItem) => {
    setItems(prev => mergeCartItems(prev, [newItem]));
  }, [setItems]);

  const addBundleToCart = useCallback((bundleItems: CartItem[]) => {
    setItems(prev => mergeCartItems(prev, bundleItems));
    setIsCartOpen(true);
  }, [setItems]);

  const removeFromCart = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  }, [setItems]);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity)) return;
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.variantId !== variantId));
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.variantId === variantId) {
          const newQty = boundedQuantity(quantity, item.stockLimit);
          if (!newQty) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }, [setItems]);

  const updateItemVariant = useCallback(
    (
      oldVariantId: string,
      newVariant: {
        variantId: string;
        variantTitle: string;
        price: string;
        image?: CartItem["image"];
        stockLimit?: number | null;
      }
    ) => {
      setItems(prev => changeCartVariant(prev, oldVariantId, newVariant));
    },
    [setItems]
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);

  // Backup checkout items and remove them from cart
  const checkoutAndBackup = useCallback((variantIds: string[]) => {
    setItems((prev) => {
      const backupItems = prev.filter((item) => variantIds.includes(item.variantId));
      const remaining = prev.filter((item) => !variantIds.includes(item.variantId));

      // Save backup
      if (typeof window !== "undefined" && backupItems.length > 0) {
        const backup: CheckoutBackup = {
          timestamp: new Date().toISOString(),
          items: backupItems,
        };
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backup));
        notifyStorageChanged();
      }

      return remaining;
    });
  }, [setItems]);

  // Restore items from backup to cart
  const restoreFromBackup = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (!raw) return;
      const backup: CheckoutBackup = JSON.parse(raw);

      if (!Number.isFinite(Date.parse(backup.timestamp)) || Date.now() - Date.parse(backup.timestamp) > BACKUP_EXPIRY_MS) return;
      setItems(prev => mergeCartItems(prev, parseCart(JSON.stringify(backup.items))));

      localStorage.removeItem(BACKUP_STORAGE_KEY);
      notifyStorageChanged();
    } catch {
      localStorage.removeItem(BACKUP_STORAGE_KEY);
      notifyStorageChanged();
    }
  }, [setItems]);

  // Dismiss backup without restoring
  const dismissBackup = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(BACKUP_STORAGE_KEY);
      notifyStorageChanged();
    }
  }, []);

  // Get valid (non-expired) checkout backup
  const getCheckoutBackup = useCallback((): CheckoutBackup | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (!raw) return null;
      const backup: CheckoutBackup = JSON.parse(raw);
      if (!Number.isFinite(Date.parse(backup.timestamp)) || Date.now() - Date.parse(backup.timestamp) > BACKUP_EXPIRY_MS) {
        return null;
      }
      const validItems = parseCart(JSON.stringify(backup.items));
      return validItems.length ? { ...backup, items: validItems } : null;
    } catch {
      return null;
    }
  }, []);

  // Backup to localStorage only (no React state change) — for redirect scenarios
  const backupToStorageOnly = useCallback((variantIds: string[]) => {
    if (typeof window === "undefined") return;
    try {
      const currentCart = loadCart();
      const backupItems = currentCart.filter((item) => variantIds.includes(item.variantId));
      const remaining = currentCart.filter((item) => !variantIds.includes(item.variantId));

      if (backupItems.length > 0) {
        const backup: CheckoutBackup = {
          timestamp: new Date().toISOString(),
          items: backupItems,
        };
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backup));
        notifyStorageChanged();
      }

      // Update localStorage directly (no React re-render)
      saveCart(remaining);
    } catch {
      // Silently fail — redirect will proceed regardless
    }
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount, pricing,
        subtotal,
        addToCart,
        addBundleToCart,
        removeFromCart,
        updateQuantity,
        updateItemVariant,
        clearCart,
        checkoutAndBackup,
        backupToStorageOnly,
        restoreFromBackup,
        dismissBackup,
        getCheckoutBackup,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return context;
}
