'use client';
import { useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Signals are hints only. Every synchronization still uses the authorized HTTP API. */
export function useInquirySignals(endpoint: string | null, refresh: () => void | Promise<unknown>, headers?: Record<string,string>) {
  const [ready, setReady] = useState(false);
  const refreshRef = useRef(refresh); refreshRef.current = refresh;
  const headersRef = useRef(headers); headersRef.current = headers;
  useEffect(() => {
    if (!endpoint) return;
    let stopped = false, disabled = false, generation = 0, failures = 0;
    let client: SupabaseClient | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hintTimer: ReturnType<typeof setTimeout> | undefined;
    let request: AbortController | undefined;
    let refreshing = false, refreshPending = false;
    const synchronize = async () => {
      if (!available()) return;
      if (refreshing) { refreshPending = true; return; }
      refreshing = true;
      try { await refreshRef.current(); } catch { /* Authenticated reads own error presentation. */ }
      finally {
        refreshing = false;
        if (refreshPending && available()) { refreshPending = false; void synchronize(); }
      }
    };
    const available = () => !stopped && !disabled && navigator.onLine && document.visibilityState === 'visible';
    const disconnect = () => {
      generation++;
      clearTimeout(timer); clearTimeout(hintTimer);
      request?.abort(); request = undefined;
      const previous = client; client = undefined;
      if (previous) void previous.removeAllChannels().then(() => previous.realtime.disconnect()).catch(() => previous.realtime.disconnect());
      if (!stopped) setReady(false);
    };
    const hint = () => {
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => { if (available()) void synchronize(); }, 250);
    };
    const retry = () => {
      disconnect();
      if (available()) timer = setTimeout(connect, Math.min(120_000, 15_000 * 2 ** Math.min(++failures, 3)) + Math.random()*1000);
    };
    const connect = async () => {
      disconnect();
      if (!available()) return;
      const current = generation;
      request = new AbortController();
      try {
        const response = await fetch(endpoint, { method: 'POST', headers: headersRef.current,
          signal: AbortSignal.any([request.signal, AbortSignal.timeout(15000)]), cache: 'no-store' });
        if (current !== generation || !available()) return;
        if (!response.ok) { retry(); return; }
        const lease = await response.json();
        if (current !== generation || !available()) return;
        if (!lease.enabled) { disabled = true; return; }
        const lifetime = Date.parse(lease.expiresAt) - Date.now();
        if (!Number.isFinite(lifetime) || !/^inqsignal:[a-f0-9]{64}$/.test(lease.topic) || lifetime < 30_000 || lifetime > 330_000) { retry(); return; }
        const { createClient } = await import('@supabase/supabase-js');
        if (current !== generation || !available()) return;
        // Separate client: do not replace the customer's normal Supabase login session.
        client = createClient(lease.url, lease.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
        client.channel(lease.topic, { config: { private: true } })
          .on('broadcast', { event: 'changed' }, hint)
          .subscribe(status => {
            if (current !== generation || !available()) return;
            if (status === 'SUBSCRIBED') {
              failures = 0; setReady(true);
              void synchronize(); // Repairs subscribe/reconnect gaps and missed hints.
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') retry();
          });
        timer = setTimeout(connect, Math.max(15_000,lifetime-30_000));
      } catch { if (current === generation && available()) retry(); }
    };
    const changed = () => { if (available()) void connect(); else disconnect(); };
    document.addEventListener('visibilitychange', changed);
    window.addEventListener('online', changed); window.addEventListener('offline', changed);
    void connect();
    return () => {
      stopped = true; disconnect();
      document.removeEventListener('visibilitychange', changed);
      window.removeEventListener('online', changed); window.removeEventListener('offline', changed);
    };
  }, [endpoint]);
  return !!endpoint && ready;
}
