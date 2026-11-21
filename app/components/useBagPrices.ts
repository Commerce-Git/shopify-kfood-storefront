'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetchBagPrices } from '@/lib/cart/market-prices';
import type { CartItem } from '@/lib/shopify/types';

export function useBagPrices(country: string, items: CartItem[], drawerOpen: boolean, load: () => CartItem[], save: (items: CartItem[]) => void) {
  const pathname = usePathname();
  const [revision, refresh] = useState(0);
  const ids = JSON.stringify(items.map(i => i.variantId));
  const visible = drawerOpen || pathname === '/cart';
  const key = visible ? JSON.stringify([country, ids, revision, pathname, drawerOpen]) : '';
  const [result, setResult] = useState({ key: '', issues: {} as Record<string, string>, error: '' });
  const [changes, setChanges] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!key || ids === '[]') return;
    const controller = new AbortController();
    fetchBagPrices(country, JSON.parse(ids), AbortSignal.any([controller.signal, AbortSignal.timeout(15000)])).then(quotes => {
      if (controller.signal.aborted) return;
      const byId = new Map(quotes.map(q => [q.id, q]));
      const issues: Record<string, string> = {};
      const notices: Record<string, string> = {};
      const current = load();
      if (JSON.stringify(current.map(v => v.variantId)) !== ids) return;
      const updated = current.map(item => {
        const quote = byId.get(item.variantId);
        if (!quote?.amount) {
          issues[item.variantId] = quote?.issue ?? 'Price unavailable.';
          return item;
        }
        if (Number(item.price) === Number(quote.amount)) return item;
        notices[item.variantId] = 'Price updated from $' + Number(item.price).toFixed(2) + ' to $' + Number(quote.amount).toFixed(2) + '.';
        return { ...item, price: quote.amount };
      });
      if (Object.keys(notices).length) {
        save(updated);
        setChanges(previous => ({ ...previous, ...notices }));
      }
      setResult({ key, issues, error: '' });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ key, issues: {}, error: 'Couldn’t confirm current prices. Please try again.' });
    });
    return () => controller.abort();
  }, [country, ids, key, load, save]);
  useEffect(() => {
    if (!visible) return;
    const resume = () => refresh(v => v + 1);
    window.addEventListener('pageshow', resume);
    window.addEventListener('focus', resume);
    return () => { window.removeEventListener('pageshow', resume); window.removeEventListener('focus', resume); };
  }, [visible]);
  const checking = !!items.length && result.key !== key;
  const issues = checking ? {} : result.issues;
  return { checking, issues, changes, error: checking ? '' : result.error,
    ready: visible && !checking && !result.error && !Object.keys(issues).length,
    retry: () => refresh(v => v + 1) };
}
