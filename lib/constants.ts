// App-wide constants

/** Cancel window in hours. Configurable via NEXT_PUBLIC_CANCEL_WINDOW_HOURS env var. */
export const CANCEL_WINDOW_HOURS =
  Number(process.env.NEXT_PUBLIC_CANCEL_WINDOW_HOURS) || 3;

/** Calculate absolute cancellation deadline Date object */
export function getCancelDeadline(orderProcessedAt: string): Date {
  const orderDate = new Date(orderProcessedAt);
  return new Date(orderDate.getTime() + CANCEL_WINDOW_HOURS * 60 * 60 * 1000);
}

/** Check if an order is still within the cancellation window */
export function isCancelable(orderProcessedAt: string): boolean {
  return new Date() < getCancelDeadline(orderProcessedAt);
}

/** Get remaining minutes until cancel deadline */
export function getCancelMinutesRemaining(orderProcessedAt: string): number {
  const remaining = getCancelDeadline(orderProcessedAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / (60 * 1000)));
}
