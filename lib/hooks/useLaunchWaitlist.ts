"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/app/components/AuthProvider";

export const LAUNCH_WAITLIST_STORAGE_KEYS = {
  REGISTERED: "blank_seoul_waitlist_registered",
  EMAIL: "blank_seoul_waitlist_email",
} as const;

const STORAGE_KEY_REGISTERED = LAUNCH_WAITLIST_STORAGE_KEYS.REGISTERED;
const STORAGE_KEY_EMAIL = LAUNCH_WAITLIST_STORAGE_KEYS.EMAIL;

export interface WaitlistItem {
  title: string;
  variantTitle?: string;
  price?: string;
}

export function useLaunchWaitlist() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const isManualEditRef = useRef(false);

  // Sync state from localStorage and user auth
  const syncFromStorage = useCallback(() => {
    try {
      const storedRegistered = localStorage.getItem(STORAGE_KEY_REGISTERED);
      const storedEmail = localStorage.getItem(STORAGE_KEY_EMAIL);

      if (storedRegistered === "true" && storedEmail) {
        setIsRegistered(true);
        setRegisteredEmail(storedEmail);
        setEmail(storedEmail);
      } else if (user?.email) {
        setEmail(user.email);
      } else if (storedEmail) {
        setEmail(storedEmail);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [user?.email]);

  useEffect(() => {
    syncFromStorage();

    // Listen for storage events across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_REGISTERED || e.key === STORAGE_KEY_EMAIL) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [syncFromStorage]);

  // Check if logged-in user is already subscribed on Shopify/DB
  useEffect(() => {
    const targetEmail = user?.email?.trim()?.toLowerCase();
    if (!targetEmail) return;

    if (isManualEditRef.current) return;

    const storedRegistered = localStorage.getItem(STORAGE_KEY_REGISTERED);
    const storedEmail = localStorage.getItem(STORAGE_KEY_EMAIL)?.trim()?.toLowerCase();

    if (storedRegistered === "true" && storedEmail === targetEmail) {
      return;
    }

    let isMounted = true;
    fetch(`/api/launch-waitlist?email=${encodeURIComponent(targetEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || isManualEditRef.current) return;
        if (data.registered) {
          setIsRegistered(true);
          setRegisteredEmail(targetEmail);
          setEmail(targetEmail);
          try {
            localStorage.setItem(STORAGE_KEY_REGISTERED, "true");
            localStorage.setItem(STORAGE_KEY_EMAIL, targetEmail);
            window.dispatchEvent(new Event("blank_seoul_waitlist_updated"));
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const submitWaitlist = useCallback(
    async (items: WaitlistItem[], emailOverride?: string) => {
      const targetEmail = (emailOverride || email || user?.email || "").trim().toLowerCase();

      if (!targetEmail || !targetEmail.includes("@")) {
        setError("Please enter a valid email address.");
        return { success: false, error: "Please enter a valid email address." };
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/launch-waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: targetEmail,
            items: items.map((i) => ({
              title: i.title,
              variantTitle: i.variantTitle,
              price: i.price,
            })),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to reserve priority access.");
        }

        setIsSuccess(true);
        setIsRegistered(true);
        setRegisteredEmail(targetEmail);
        setEmail(targetEmail);

        try {
          localStorage.setItem(STORAGE_KEY_REGISTERED, "true");
          localStorage.setItem(STORAGE_KEY_EMAIL, targetEmail);
          // Dispatch custom event for intra-window synchronization
          window.dispatchEvent(new Event("blank_seoul_waitlist_updated"));
        } catch {}

        isManualEditRef.current = false;
        return { success: true };
      } catch (err: any) {
        const msg = err.message || "Something went wrong. Please try again.";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [email, user?.email]
  );

  // Intra-window event listener
  useEffect(() => {
    const handleCustomUpdate = () => {
      syncFromStorage();
    };

    window.addEventListener("blank_seoul_waitlist_updated", handleCustomUpdate);
    return () => window.removeEventListener("blank_seoul_waitlist_updated", handleCustomUpdate);
  }, [syncFromStorage]);

  const editEmail = useCallback(() => {
    isManualEditRef.current = true;
    setIsRegistered(false);
    setIsSuccess(false);
    try {
      localStorage.removeItem(STORAGE_KEY_REGISTERED);
      window.dispatchEvent(new Event("blank_seoul_waitlist_updated"));
    } catch {}
  }, []);

  return {
    email,
    setEmail,
    isRegistered,
    registeredEmail,
    isLoading,
    isSuccess,
    error,
    isLoggedIn: !!user?.email,
    userEmail: user?.email || null,
    submitWaitlist,
    editEmail,
  };
}
