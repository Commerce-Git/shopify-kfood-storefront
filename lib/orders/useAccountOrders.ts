'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import type { MappedOrder } from '@/lib/shopify/admin';

type OrderState = { owner: string; orders: MappedOrder[]; subscribed: boolean; loading: boolean; error: string | null };
const empty: OrderState = { owner: '', orders: [], subscribed: false, loading: true, error: null };

// No persistent order/status URLs in shared-browser storage. Responses belong to one account.
export function useAccountOrders() {
  const { user, isLoading } = useAuth();
  const owner = user ? `${user.id}:${user.email}` : '';
  const [state, setState] = useState<OrderState>(empty);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (isLoading || !owner) return;
    const controller = new AbortController();
    setState({ ...empty, owner });
    (async () => {
      try {
        const response = await fetch('/api/orders', { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]) });
        if (!response.ok) throw new Error('Could not load your orders. Please try again.');
        const data = await response.json();
        if (!Array.isArray(data.orders)) throw new Error('Invalid order response. Please try again.');
        if (!controller.signal.aborted) setState({ owner, orders: data.orders, subscribed: data.isSubscribed === true, loading: false, error: null });
      } catch (error) {
        if (!controller.signal.aborted) setState({ ...empty, owner, loading: false, error: error instanceof Error ? error.message : 'Could not load your orders.' });
      }
    })();
    return () => controller.abort();
  }, [owner, isLoading, attempt]);
  return { ...(owner && state.owner === owner ? state : empty), retry: () => setAttempt(n => n + 1) };
}
