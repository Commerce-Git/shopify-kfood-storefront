import test from "node:test";
import assert from "node:assert/strict";
import { errorMessage } from "../../lib/errors.ts";
import { adaptPreviewToShopifyProduct } from "../../lib/shopify/preview-adapter.ts";
import { notifyStorageChanged, readStoredValue, serverStoredValue, subscribeStoredValues } from "../../lib/browser-storage.ts";

test("error handling accepts Error and API objects without trusting arbitrary thrown values", () => {
  assert.equal(errorMessage(new Error("failed")), "failed");
  assert.equal(errorMessage({message:"API error"}), "API error");
  for (const value of [null, undefined, "text", {message:42}, {message:""}]) {
    assert.equal(errorMessage(value, "fallback"), "fallback");
  }
});

test("preview normalizes malformed fields and preserves valid option images", () => {
  const p = adaptPreviewToShopifyProduct({ title_en: 7, material: {}, photos: [null, 3, "https://example.invalid/a.jpg"],
    options: [{ name: "Finish", variants: [null, {name:"Blue", photo:"https://example.invalid/blue.jpg"}] }] });
  assert.equal(p.title, "Korean Traditional Artisan Craft");
  assert.equal(p.images.edges.length, 1);
  assert.equal(p.variants.edges[0].node.title, "Blue");
  assert.equal(p.variants.edges[0].node.image?.url, "https://example.invalid/blue.jpg");
  assert.equal(p.variants.edges[0].node.selectedOptions[0].name, "Finish");
  assert.equal(adaptPreviewToShopifyProduct(null).priceRange.minVariantPrice.amount, "79.00");
});

test("storage subscriptions observe same-tab and cross-tab changes without clearing saved cart on hydration", t => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const events = new EventTarget();
  let saved = '[{"variantId":"v1","quantity":2}]';
  Object.defineProperty(globalThis, "window", {value:events, configurable:true});
  Object.defineProperty(globalThis, "localStorage", {value:{getItem: () => saved}, configurable:true});
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis,"window",previousWindow); else Reflect.deleteProperty(globalThis,"window");
    if (previousStorage) Object.defineProperty(globalThis,"localStorage",previousStorage); else Reflect.deleteProperty(globalThis,"localStorage");
  });
  assert.equal(serverStoredValue(), null);
  assert.equal(readStoredValue("cart"), saved);
  const observed: Array<string | null> = [];
  const unsubscribe = subscribeStoredValues(() => observed.push(readStoredValue("cart")));
  saved = '[]'; notifyStorageChanged();
  saved = '[{"variantId":"v2"}]'; events.dispatchEvent(new Event("storage"));
  assert.deepEqual(observed, ['[]', saved]);
  unsubscribe(); notifyStorageChanged(); assert.equal(observed.length, 2);
  Object.defineProperty(globalThis,"localStorage", {get: () => {throw new Error("blocked");},configurable:true});
  assert.equal(readStoredValue("cart"), null);
});
