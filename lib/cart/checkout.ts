import type { CartItem } from '../shopify/types.ts';

export interface CheckoutResponse {
  cartCreate: {
    cart: null | {
      id: string;
      checkoutUrl: string;
      discountCodes: { code: string; applicable: boolean }[];
      lines: { pageInfo: { hasNextPage: boolean }; edges: { node: { quantity: number; merchandise: { id: string } } }[] };
    };
    userErrors: { message: string }[];
    warnings: { message: string }[];
  };
}

export class CheckoutError extends Error {}

export function checkoutErrorMessage(error: unknown): string {
  if (error instanceof CheckoutError) return error.message;
  if (error instanceof Error && error.name === 'TimeoutError') {
    return 'Checkout is taking longer than expected. Please try again. Your bag has been kept.';
  }
  return 'We couldn’t connect to checkout. Please try again. Your bag has been kept.';
}

/** Never discard local items when Shopify accepted only part of the requested cart. */
export function checkoutDestination(data: CheckoutResponse, items: CartItem[], coupon: string | null): string {
  const { cart, userErrors, warnings } = data.cartCreate;
  if (userErrors.length) throw new CheckoutError(userErrors[0].message);
  if (!cart?.checkoutUrl) throw new CheckoutError('Checkout is temporarily unavailable. Please try again.');
  if (warnings?.length) throw new CheckoutError(warnings.map(warning => warning.message).join(' '));
  const quantities = new Map<string, number>();
  for (const { node } of cart.lines.edges) quantities.set(node.merchandise.id, (quantities.get(node.merchandise.id) ?? 0) + node.quantity);
  if (cart.lines.pageInfo.hasNextPage || quantities.size !== items.length || items.some(item => quantities.get(item.variantId) !== item.quantity)) {
    throw new CheckoutError('Availability has changed. Review your items and quantities before trying again. Your bag has been kept.');
  }
  if (coupon && !cart.discountCodes.some(discount => discount.code.toLowerCase() === coupon.toLowerCase() && discount.applicable)) {
    throw new CheckoutError('This coupon cannot be applied to your bag. Remove it or choose another coupon.');
  }
  const url = new URL(cart.checkoutUrl);
  if (url.protocol !== 'https:') throw new CheckoutError('Checkout is temporarily unavailable. Please try again.');
  return url.href;
}
