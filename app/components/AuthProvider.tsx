"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { StorefrontCustomer } from "@/lib/supabase/types";
import dynamic from "next/dynamic";

const CrispChat = dynamic(() => import("./CrispChat"), { ssr: false });

interface AuthContextType {
  user: User | null;
  customer: StorefrontCustomer | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  customer: null,
  isLoggedIn: false,
  isLoading: true,
  signInWithEmail: async () => ({ error: null }),
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<StorefrontCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  // Fetch customer profile from storefront_customers
  const fetchCustomer = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("storefront_customers")
        .select("*")
        .eq("id", userId)
        .single();
      setCustomer(data);
    },
    [supabase]
  );

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          await fetchCustomer(user.id);
        }
      } catch (error) {
        console.error("Auth session error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        const currentUser = session?.user ?? null;
        
        // Only update if the user ID actually changed to prevent infinite loops on token refresh
        setUser((prevUser) => {
          if (prevUser?.id !== currentUser?.id) {
            if (currentUser) {
              fetchCustomer(currentUser.id);
            } else {
              setCustomer(null);
            }
          }
          return currentUser;
        });

      } finally {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchCustomer]);

  const signInWithEmail = async (
    email: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCustomer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        isLoggedIn: !!user,
        isLoading,
        signInWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
      <CrispChat />
    </AuthContext.Provider>
  );
}
