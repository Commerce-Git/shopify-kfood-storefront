/** One inquiry read at a time; visible, online pages only. No Realtime connection. */
interface InquiryPollerOptions {
  read: (signal: AbortSignal) => Promise<boolean>;
  isVisible: () => boolean;
  isOnline: () => boolean;
  initialOpen?: boolean;
  schedule?: (callback: () => void, delayMs: number) => () => void;
}

export function createInquiryPoller(options: InquiryPollerOptions) {
  const schedule = options.schedule ?? ((callback, delayMs) => {
    const timer = setTimeout(callback, delayMs);
    return () => clearTimeout(timer);
  });
  let open = options.initialOpen ?? false;
  let failures = 0;
  let stopped = false;
  let running = false;
  let pendingRefresh = false;
  let controller: AbortController | undefined;
  let cancelTimer: (() => void) | undefined;

  const available = () => !stopped && options.isVisible() && options.isOnline();
  const clearTimer = () => {
    cancelTimer?.();
    cancelTimer = undefined;
  };
  const queueNext = () => {
    clearTimer();
    if (!available() || running) return;
    const base = open ? 10_000 : 60_000;
    const delay = Math.min(120_000, base * 2 ** Math.min(failures, 4));
    cancelTimer = schedule(() => {
      cancelTimer = undefined;
      void run();
    }, delay);
  };
  const run = async () => {
    if (!available() || running) return;
    running = true;
    const request = new AbortController();
    controller = request;
    try {
      const ok = await options.read(request.signal);
      if (!request.signal.aborted) failures = ok ? 0 : failures + 1;
    } catch {
      if (!request.signal.aborted) failures++;
    } finally {
      controller = undefined;
      running = false;
      if (!stopped && pendingRefresh && available()) {
        pendingRefresh = false;
        void run();
      } else if (!stopped) {
        pendingRefresh = false;
        queueNext();
      }
    }
  };
  const refresh = () => {
    clearTimer();
    if (!available()) return;
    if (running) {
      pendingRefresh = true;
      return;
    }
    void run();
  };
  return {
    start: refresh,
    refresh,
    setOpen(next: boolean) {
      if (open === next) return;
      open = next;
      if (open) refresh();
      else queueNext();
    },
    pause() {
      clearTimer();
      pendingRefresh = false;
      controller?.abort();
    },
    stop() {
      stopped = true;
      clearTimer();
      pendingRefresh = false;
      controller?.abort();
    },
  };
}
