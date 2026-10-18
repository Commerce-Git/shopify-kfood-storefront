"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { StorefrontCustomer } from "@/lib/supabase/types";
import dynamic from "next/dynamic";
import { prepareAccountStorage } from "@/lib/security/account-storage";
import { syncWishlistWithSupabase } from "@/lib/wishlist";
import { syncFollowedArtistsWithSupabase } from "@/lib/followed-artists";

const ConciergeChat = dynamic(() => import("./ConciergeChat"), { ssr: false });

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

  const authVersion = useRef(0);
  const profileOwner = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const apply = (current: User | null) => {
      if (!active) return;
      authVersion.current++;
      if (profileOwner.current !== (current?.id || null)) {
        profileOwner.current = current?.id || null;
        setCustomer(null);
      }
      try { prepareAccountStorage(localStorage, current?.id || null); } catch { /* Storage blocked. */ }
      window.dispatchEvent(new Event('storage'));
      setUser(current);
      setIsLoading(false);
    };
    const initialVersion = authVersion.current;
    // Callback only updates local state; profile requests run outside Supabase's auth lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user || null));
    supabase.auth.getUser().then(({ data }) => {
      if (authVersion.current === initialVersion) apply(data.user);
    }).catch(() => { if (authVersion.current === initialVersion) apply(null); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [supabase]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    const id = user.id;
    const isCurrent = () => active && profileOwner.current === id;
    supabase.from('storefront_customers').select('*').eq('id', id).single()
      .then(({ data }) => { if (isCurrent()) setCustomer(data); }, () => { if (isCurrent()) setCustomer(null); });
    syncWishlistWithSupabase(id, isCurrent).catch(() => {});
    syncFollowedArtistsWithSupabase(id, isCurrent).catch(() => {});
    return () => { active = false; };
  }, [supabase, user?.id]);

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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    authVersion.current++;
    profileOwner.current = null;
    try { prepareAccountStorage(localStorage, null); } catch { /* Storage blocked. */ }
    window.dispatchEvent(new Event("storage"));
    setUser(null);
    setCustomer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer: customer?.id === user?.id ? customer : null,
        isLoggedIn: !!user,
        isLoading,
        signInWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
      <ConciergeChat />
    </AuthContext.Provider>
  );
}
