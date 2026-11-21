'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { countryProductPath } from '@/lib/markets/selection';
import Modal from './Modal';

const MarketContext = createContext({ country: '', countries: [] as string[] });
export const useMarket = () => useContext(MarketContext);

export function MarketProvider({ market, children }: {
  market: { country: string; countries: string[] }; children: ReactNode;
}) {
  useEffect(() => {
    try {
      const position = sessionStorage.getItem('bs-market-scroll');
      if (position) {
        sessionStorage.removeItem('bs-market-scroll');
        const { url, top } = JSON.parse(position);
        if (url === location.pathname + location.search) window.scrollTo({ top, behavior: 'instant' });
      }
    } catch { /* Storage may be unavailable in private browsing. */ }
  }, []);
  return <MarketContext.Provider value={market}>{children}</MarketContext.Provider>;
}

const names = new Intl.DisplayNames(['en'], { type: 'region' });

export function MarketSelector({ ready }: { ready: boolean }) {
  const { country, countries } = useMarket();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function choose(next: string) {
    if (pending) return;
    if (next === country) { setOpen(false); return; }
    setPending(true);
    setError(false);
    try {
      const url = new URL(location.href);
      const match = url.pathname.match(/^(?:\/[a-z]{2})?\/product\/([^/]+)\/?$/);
      if (match && match[1] !== 'preview') {
        url.pathname = countryProductPath(next, decodeURIComponent(match[1]));
        const selected = document.querySelector<HTMLElement>('[data-market-variant]')?.dataset.marketVariant;
        if (selected) url.searchParams.set('variant', selected);
      } else {
        const response = await fetch('/api/market', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country: next }) });
        if (!response.ok) throw new Error();
      }
      try {
        sessionStorage.setItem('bs-market-scroll', JSON.stringify({ url: url.pathname + url.search, top: window.scrollY }));
      } catch { /* The destination can still change without scroll restoration. */ }
      location.assign(url.href);
    } catch {
      setError(true);
      setPending(false);
    }
  }
  return <>
    <button type="button" disabled={!ready} className="shrink-0 px-2 py-1 text-xs font-semibold underline underline-offset-4" aria-haspopup="dialog" onClick={() => setOpen(true)}>Ship to: {names.of(country)} ▾</button>
    {open && <Modal label="Ship to" onClose={() => setOpen(false)}>
      <section className="absolute bottom-0 left-0 w-full rounded-t-2xl bg-white p-4 text-left text-zinc-900 sm:bottom-auto sm:left-auto sm:right-4 sm:top-10 sm:w-64 sm:rounded-xl">
        <h2 className="px-3 py-2 font-semibold">Ship to</h2>
        {countries.map(code => <button key={code} type="button" disabled={pending} aria-pressed={code === country} className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left hover:bg-stone-100" onClick={() => choose(code)}>
          {names.of(code)} {code === country && <span aria-hidden>✓</span>}
        </button>)}
        {error && <p role="alert">Couldn’t change your shipping destination. Please try again.</p>}
      </section>
    </Modal>}
  </>;
}
