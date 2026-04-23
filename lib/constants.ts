// App-wide constants

/** Cancel window in hours. Configurable via NEXT_PUBLIC_CANCEL_WINDOW_HOURS env var. */
export const CANCEL_WINDOW_HOURS =
  Number(process.env.NEXT_PUBLIC_CANCEL_WINDOW_HOURS) || 12;

/** Check if an order is still within the cancellation window */
export function isCancelable(orderProcessedAt: string): boolean {
  const orderDate = new Date(orderProcessedAt);
  const deadline = new Date(
    orderDate.getTime() + CANCEL_WINDOW_HOURS * 60 * 60 * 1000
  );
  return new Date() < deadline;
}

/** Get remaining minutes until cancel deadline */
export function getCancelMinutesRemaining(orderProcessedAt: string): number {
  const orderDate = new Date(orderProcessedAt);
  const deadline = new Date(
    orderDate.getTime() + CANCEL_WINDOW_HOURS * 60 * 60 * 1000
  );
  const remaining = deadline.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(remaining / (60 * 1000)));
}
