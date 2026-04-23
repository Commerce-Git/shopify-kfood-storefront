"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CartItem } from "@/lib/shopify/types";

interface CheckoutBackup {
  timestamp: string;
  items: CartItem[];
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
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

const CART_STORAGE_KEY = "kfood-cart";
const BACKUP_STORAGE_KEY = "kfood-checkout-backup";
const BACKUP_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount + clean expired backup
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);

    // Auto-clean expired backup
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (raw) {
        const backup: CheckoutBackup = JSON.parse(raw);
        if (Date.now() - new Date(backup.timestamp).getTime() > BACKUP_EXPIRY_MS) {
          localStorage.removeItem(BACKUP_STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(BACKUP_STORAGE_KEY);
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const addToCart = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === newItem.variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === newItem.variantId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.variantId !== variantId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

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
      }

      return remaining;
    });
  }, []);

  // Restore items from backup to cart
  const restoreFromBackup = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (!raw) return;
      const backup: CheckoutBackup = JSON.parse(raw);

      setItems((prev) => {
        let merged = [...prev];
        for (const backupItem of backup.items) {
          const existing = merged.find((i) => i.variantId === backupItem.variantId);
          if (existing) {
            merged = merged.map((i) =>
              i.variantId === backupItem.variantId
                ? { ...i, quantity: i.quantity + backupItem.quantity }
                : i
            );
          } else {
            merged.push(backupItem);
          }
        }
        return merged;
      });

      localStorage.removeItem(BACKUP_STORAGE_KEY);
    } catch {
      localStorage.removeItem(BACKUP_STORAGE_KEY);
    }
  }, []);

  // Dismiss backup without restoring
  const dismissBackup = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(BACKUP_STORAGE_KEY);
    }
  }, []);

  // Get valid (non-expired) checkout backup
  const getCheckoutBackup = useCallback((): CheckoutBackup | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (!raw) return null;
      const backup: CheckoutBackup = JSON.parse(raw);
      if (Date.now() - new Date(backup.timestamp).getTime() > BACKUP_EXPIRY_MS) {
        localStorage.removeItem(BACKUP_STORAGE_KEY);
        return null;
      }
      return backup;
    } catch {
      localStorage.removeItem(BACKUP_STORAGE_KEY);
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
        itemCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
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
