'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const latestRequest = useRef(0);
  // Background refresh and the last check before checkout use the same verified quotes.
  const confirm = useCallback((signal: AbortSignal, expected?: CartItem[]) => {
    const request = ++latestRequest.current;
    const currentRequest = () => !signal.aborted && request === latestRequest.current;
    return fetchBagPrices(country, JSON.parse(ids), signal).then(quotes => {
      if (!currentRequest()) return false;
      const current = load();
      if (JSON.stringify(current.map(item => item.variantId)) !== ids) return false;
      const issues: Record<string, string> = {};
      const notices: Record<string, string> = {};
      const updated = current.map((item, index) => {
        const quote = quotes[index];
        if (!quote.amount) {
          issues[item.variantId] = quote.issue ?? 'Price unavailable.';
          return item;
        }
        if (Number(item.price) === Number(quote.amount)) return item;
        notices[item.variantId] = 'Price updated from $' + Number(item.price).toFixed(2) + ' to $' + Number(quote.amount).toFixed(2) + '.';
        return { ...item, price: quote.amount };
      });
      const changed = Object.keys(notices).length > 0;
      if (changed) {
        save(updated);
        setChanges(previous => ({ ...previous, ...notices }));
      }
      setResult({ key, issues, error: '' });
      return !changed && !Object.keys(issues).length && (!expected || (expected.length === current.length &&
        expected.every((item, index) => item.variantId === current[index].variantId &&
          item.quantity === current[index].quantity && Number(item.price) === Number(current[index].price))));
    }).catch(() => {
      if (request === latestRequest.current && (!signal.aborted || signal.reason?.name === 'TimeoutError')) {
        setResult({ key, issues: {}, error: 'Couldn’t confirm current prices. Please try again.' });
      }
      return false;
    });
  }, [country, ids, key, load, save]);

  useEffect(() => {
    if (!key || ids === '[]') return;
    const controller = new AbortController();
    void confirm(AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]));
    return () => { controller.abort(); latestRequest.current++; };
  }, [confirm, ids, key]);
  useEffect(() => {
    if (!visible) return;
    const resume = () => refresh(v => v + 1);
    window.addEventListener('pageshow', resume);
    window.addEventListener('focus', resume);
    return () => { window.removeEventListener('pageshow', resume); window.removeEventListener('focus', resume); };
  }, [visible]);
  const checking = !!items.length && result.key !== key;
  const issues = checking ? {} : result.issues;
  return { checking, issues, changes, confirm, error: checking ? '' : result.error,
    ready: visible && !checking && !result.error && !Object.keys(issues).length,
    retry: () => refresh(v => v + 1) };
}
