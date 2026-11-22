'use client';

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
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

function countryFlag(code: string) {
  const regionalIndicatorA = 0x1f1e6;
  return Array.from(code, letter =>
    String.fromCodePoint(regionalIndicatorA + letter.charCodeAt(0) - 65)
  ).join('');
}

export function MarketSelector({ ready }: { ready: boolean }) {
  const { country, countries } = useMarket();
  const [view, setView] = useState<'popover' | 'sheet' | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const currentOption = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  function closeAndFocusTrigger() {
    setView(null);
    trigger.current?.focus();
  }

  useEffect(() => {
    if (!view) return;
    const desktop = window.matchMedia('(min-width: 768px)');
    desktop.addEventListener('change', closeAndFocusTrigger);
    function dismissOutside(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setView(null);
    }
    if (view === 'popover') {
      currentOption.current?.focus({ preventScroll: true });
      document.addEventListener('pointerdown', dismissOutside);
    }
    return () => {
      desktop.removeEventListener('change', closeAndFocusTrigger);
      document.removeEventListener('pointerdown', dismissOutside);
    };
  }, [view]);

  async function choose(next: string) {
    if (pending) return;
    if (next === country) { closeAndFocusTrigger(); return; }
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
  const choices = (
    <>
      <div className="flex items-center justify-between px-3">
        <h2 className="py-2 text-sm font-semibold">Ship to</h2>
        {view === 'sheet' && <button type="button" aria-label="Close shipping destinations" onClick={closeAndFocusTrigger}
          className="min-h-11 min-w-11 rounded-full text-xl text-stone-600">×</button>}
      </div>
      {countries.map(code => (
        <button key={code} type="button" ref={code === country ? currentOption : undefined}
          disabled={pending} aria-pressed={code === country} onClick={() => choose(code)}
          className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-inset aria-pressed:bg-stone-100 aria-pressed:font-semibold">
          <span className="inline-flex items-center gap-2.5">
            <span aria-hidden="true" className="w-6 shrink-0 text-center text-lg leading-none">{countryFlag(code)}</span>
            {names.of(code)}
          </span>
          {code === country && <span aria-hidden="true">✓</span>}
        </button>
      ))}
      {error && <p role="alert" className="p-2 text-sm text-red-700">Couldn’t change your shipping destination. Please try again.</p>}
    </>
  );
  return <div ref={container} className="relative shrink-0"
    onBlur={event => {
      if (view === 'popover' && !event.currentTarget.contains(event.relatedTarget)) setView(null);
    }}
    onKeyDown={event => {
      if (view === 'popover' && event.key === 'Escape') {
        event.preventDefault();
        closeAndFocusTrigger();
      }
    }}>
    <button ref={trigger} type="button" disabled={!ready} aria-label={`Ship to: ${names.of(country)}`}
      aria-haspopup="dialog" aria-expanded={view !== null} aria-controls={view ? panelId : undefined}
      onClick={() => {
        setError(false);
        setView(view ? null : window.matchMedia('(min-width: 768px)').matches ? 'popover' : 'sheet');
      }}
      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-[#18181B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C25E38]">
      <span className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-full border border-stone-300 bg-stone-50 px-1 py-1.5 hover:border-stone-400 hover:bg-stone-100 min-[360px]:gap-1.5 min-[360px]:px-2 lg:px-3">
        <span className="hidden text-xs text-stone-600 lg:inline">Ship to:</span>
        <span aria-hidden="true" className="text-sm leading-none min-[360px]:text-base">{countryFlag(country)}</span>
        <span className="text-xs font-semibold lg:hidden">{country}</span>
        <span className="hidden text-sm font-semibold lg:inline">{names.of(country)}</span>
        <svg aria-hidden="true" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-2.5">
          <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
        </svg>
      </span>
    </button>
    {view === 'popover' && (
      <div id={panelId} role="dialog" aria-label="Ship to"
        className="absolute right-0 top-full z-50 mt-1 max-h-[70dvh] w-56 overflow-y-auto rounded-xl border border-stone-200 bg-white p-2 text-zinc-900 shadow-lg">
        {choices}
      </div>
    )}
    {view === 'sheet' && <Modal label="Ship to" onClose={closeAndFocusTrigger}>
      <section id={panelId} className="absolute bottom-0 w-full max-h-[80dvh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-zinc-900">
        {choices}
      </section>
    </Modal>}
  </div>;
}
