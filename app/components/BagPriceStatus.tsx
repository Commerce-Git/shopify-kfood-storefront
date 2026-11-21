'use client';
import { useCart } from './CartProvider';

export function BagPriceStatus() {
  const { pricing } = useCart();
  if (pricing.checking) return <p role="status">Checking current prices…</p>;
  if (!pricing.error && !Object.keys(pricing.issues).length) return null;
  return <div role="status" className="rounded-lg bg-amber-50 p-3 text-sm">
    {pricing.error || 'Review the marked items before checkout.'}{' '}
    <button type="button" className="underline" onClick={pricing.retry}>Retry prices</button>
  </div>;
}

export function ItemPriceNotice({ id }: { id: string }) {
  const { pricing } = useCart();
  const message = pricing.issues[id] || pricing.changes[id];
  return message ? <p className="text-xs text-amber-800" role="status">{message}</p> : null;
}
