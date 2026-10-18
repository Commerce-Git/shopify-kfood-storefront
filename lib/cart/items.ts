import type { CartItem, ShopifyProductVariant } from '../shopify/types.ts';

export function stockLimitForVariant(variant: Pick<ShopifyProductVariant, 'availableForSale' | 'quantityAvailable' | 'currentlyNotInStock'>): number | null {
  if (!variant.availableForSale) return 0;
  // Shopify uses this flag for a purchasable backorder, not a sold-out variant.
  if (variant.currentlyNotInStock) return null;
  return typeof variant.quantityAvailable === 'number' ? Math.max(0, variant.quantityAvailable) : null;
}

export function boundedQuantity(quantity: number, limit?: number | null): number {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return 0;
  return typeof limit === 'number' && Number.isFinite(limit)
    ? Math.max(0, Math.min(quantity, Math.floor(limit))) : quantity;
}

export function parseCart(stored: string | null): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(stored || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== 'object') return false;
      return typeof item.variantId === 'string' && item.variantId.startsWith('gid://shopify/ProductVariant/')
        && typeof item.productHandle === 'string' && typeof item.title === 'string'
        && typeof item.price === 'string' && item.price.trim() !== ''
        && Number.isFinite(Number(item.price)) && Number(item.price) >= 0
        && Number.isSafeInteger(item.quantity) && item.quantity > 0;
    });
  } catch { return []; }
}

/** Latest observed metadata wins; the cart is only an estimate until Shopify checkout. */
export function mergeCartItems(current: CartItem[], incoming: CartItem[]): CartItem[] {
  const result = [...current];
  for (const item of incoming) {
    const index = result.findIndex(existing => existing.variantId === item.variantId);
    const existing = result[index];
    const stockLimit = item.stockLimit === undefined ? existing?.stockLimit : item.stockLimit;
    const quantity = boundedQuantity((existing?.quantity ?? 0) + item.quantity, stockLimit);
    if (!quantity) continue;
    const merged = { ...existing, ...item, stockLimit, quantity };
    if (index < 0) result.push(merged);
    else result[index] = merged;
  }
  return result;
}

export function changeCartVariant(current: CartItem[], oldId: string, variant: Pick<CartItem, 'variantId' | 'variantTitle' | 'price'> & Partial<Pick<CartItem, 'image' | 'stockLimit'>>): CartItem[] {
  const item = current.find(line => line.variantId === oldId);
  if (!item || variant.stockLimit === 0) return current;
  return mergeCartItems(current.filter(line => line.variantId !== oldId), [{
    ...item, ...variant, image: variant.image || item.image,
    stockLimit: variant.stockLimit === undefined && oldId !== variant.variantId ? null : (variant.stockLimit === undefined ? item.stockLimit : variant.stockLimit),
  }]);
}

export function matchingVariant(variants: ShopifyProductVariant[], options: Record<string, string>) {
  return variants.find(variant => variant.selectedOptions.every(option => options[option.name] === option.value));
}
