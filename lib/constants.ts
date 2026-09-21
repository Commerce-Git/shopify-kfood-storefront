// App-wide constants

/**
 * Global Store Launch Status
 * - "preview": Logistics contract pending. Purchasing disabled. Collects launch waitlist emails with zero discount promises.
 * - "live": Official international express logistics active. Standard Add to Cart & Shopify Checkout.
 */
export const STORE_LAUNCH_STATUS: "preview" | "live" =
  (process.env.NEXT_PUBLIC_STORE_LAUNCH_STATUS as "preview" | "live") || "preview";

export function isStoreLive(): boolean {
  return STORE_LAUNCH_STATUS === "live";
}

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
