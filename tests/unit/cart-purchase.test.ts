import assert from 'node:assert/strict';
import test from 'node:test';
import { boundedQuantity, changeCartVariant, matchingVariant, mergeCartItems, parseCart, stockLimitForVariant } from '../../lib/cart/items.ts';
import { checkoutDestination, checkoutErrorMessage, CheckoutError, type CheckoutResponse } from '../../lib/cart/checkout.ts';
import type { CartItem, ShopifyProductVariant } from '../../lib/shopify/types.ts';

const item: CartItem = { variantId: 'gid://shopify/ProductVariant/1', productHandle: 'pouch', title: 'Pouch', variantTitle: 'Blue', price: '33.00', quantity: 2, image: null, stockLimit: 5 };

test('corrupt storage never produces NaN totals or invalid checkout quantities', () => {
  assert.deepEqual(parseCart('{broken'), []);
  for (const override of [{ price: 'oops' }, { price: '-1' }, { price: '' }, { quantity: '2' }, { quantity: 1.2 }, { quantity: -1 }, { variantId: 123 }, { productHandle: null }]) {
    assert.deepEqual(parseCart(JSON.stringify([{ ...item, ...override }])), []);
  }
  assert.deepEqual(parseCart(JSON.stringify([item])), [item]);
});

test('first add, repeated add and bundle/backup merge respect latest limits and price', () => {
  assert.equal(mergeCartItems([], [{ ...item, quantity: 8 }])[0].quantity, 5);
  const result = mergeCartItems([item], [{ ...item, quantity: 4, price: '40', stockLimit: 3 }]);
  assert.equal(result[0].quantity, 3);
  assert.equal(result[0].price, '40');
  assert.equal(result[0].stockLimit, 3);
  assert.equal(mergeCartItems([item], [{ ...item, stockLimit: null, quantity: 8 }])[0].quantity, 10);
  assert.deepEqual(mergeCartItems([], [{ ...item, stockLimit: 0 }]), []);
});

test('switching to a lower-stock option clamps quantity and merging updates target metadata', () => {
  const variant = { variantId: 'gid://shopify/ProductVariant/2', variantTitle: 'Red', price: '42', stockLimit: 1 };
  assert.deepEqual(changeCartVariant([item], item.variantId, variant), [{ ...item, ...variant, quantity: 1 }]);
  const target = { ...item, ...variant, price: '12', quantity: 1, stockLimit: 8 };
  const merged = changeCartVariant([item, target], item.variantId, { ...variant, stockLimit: 2 });
  assert.equal(merged.length, 1);
  assert.equal(merged[0].quantity, 2);
  assert.equal(merged[0].price, '42');
  assert.equal(changeCartVariant([item], item.variantId, { ...variant, stockLimit: null })[0].stockLimit, null);
  assert.deepEqual(changeCartVariant([item], item.variantId, { ...variant, stockLimit: 0 }), [item]);
});

test('quantity and Shopify availability distinguish unavailable, tracked and backorder products', () => {
  assert.equal(boundedQuantity(NaN, 5), 0);
  assert.equal(boundedQuantity(1.2), 0);
  assert.equal(stockLimitForVariant({ availableForSale: false, quantityAvailable: 5 }), 0);
  assert.equal(stockLimitForVariant({ availableForSale: true, quantityAvailable: 0, currentlyNotInStock: true }), null);
  assert.equal(stockLimitForVariant({ availableForSale: true, quantityAvailable: 4 }), 4);
});

test('nonexistent option combinations must never fall back to the first variant', () => {
  const variant = { ...item, id: item.variantId, selectedOptions: [{ name: 'Color', value: 'Blue' }, { name: 'Size', value: 'S' }] } as unknown as ShopifyProductVariant;
  assert.equal(matchingVariant([variant], { Color: 'Red', Size: 'S' }), undefined);
  assert.equal(matchingVariant([variant], { Color: 'Blue', Size: 'S' }), variant);
});

function response(): CheckoutResponse {
  return { cartCreate: { userErrors: [], warnings: [], cart: { id: 'cart', checkoutUrl: 'https://checkout.example.com/c/1', discountCodes: [], lines: { pageInfo: { hasNextPage: false }, edges: [{ node: { quantity: 2, merchandise: { id: item.variantId } } }] } } } };
}

test('checkout redirects only with a complete accepted cart', () => {
  assert.equal(checkoutDestination(response(), [item], null), 'https://checkout.example.com/c/1');
  const partial = response(); partial.cartCreate.cart!.lines.edges[0].node.quantity = 1;
  assert.throws(() => checkoutDestination(partial, [item], null), /Availability has changed/);
  const missing = response(); missing.cartCreate.cart = null;
  assert.throws(() => checkoutDestination(missing, [item], null), /temporarily unavailable/);
  const warnings = response(); warnings.cartCreate.warnings.push({ message: 'Inventory changed' });
  assert.throws(() => checkoutDestination(warnings, [item], null), /Inventory changed/);
  const error = response(); error.cartCreate.userErrors.push({ message: 'Unavailable product' });
  assert.throws(() => checkoutDestination(error, [item], null), /Unavailable product/);
});

test('checkout never silently drops an inapplicable coupon', () => {
  assert.throws(() => checkoutDestination(response(), [item], 'SAVE10'), /coupon cannot/);
  const accepted = response(); accepted.cartCreate.cart!.discountCodes.push({ code: 'save10', applicable: true });
  assert.ok(checkoutDestination(accepted, [item], 'SAVE10').startsWith('https://'));
});


test('checkout connectivity errors are readable without leaking technical response details', () => {
  assert.match(checkoutErrorMessage(new Error('[Storefront API] HTTP 503')), /couldn’t connect/);
  assert.match(checkoutErrorMessage(new DOMException('Timeout', 'TimeoutError')), /taking longer/);
  assert.equal(checkoutErrorMessage(new CheckoutError('Coupon has expired.')), 'Coupon has expired.');
});
