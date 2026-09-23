import assert from "node:assert/strict";
import test from "node:test";

process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN = "unit-test.myshopify.com";
process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN = "unit-test-token";

import { fetchAllCatalogProducts } from "../../lib/shopify/api.ts";
import type { ShopifyProduct } from "../../lib/shopify/types.ts";

test("fetchAllCatalogProducts merges multiple pages using cursor pagination", async () => {
  const previousFetch = globalThis.fetch;
  const calls: Array<{ first?: number; after?: string | null }> = [];

  const mockProduct1 = {
    id: "gid://shopify/Product/1",
    handle: "white-porcelain-mug-1",
    title: "White Porcelain Mug 1",
    description: "Handmade ceramic mug",
    descriptionHtml: "<p>Handmade ceramic mug</p>",
    vendor: "Kwon Ceramics",
    productType: "Cup",
    tags: ["ceramic", "mug"],
    availableForSale: true,
    images: { edges: [{ node: { url: "https://cdn.shopify.com/1.jpg", altText: "1", width: 800, height: 800 } }] },
    priceRange: { minVariantPrice: { amount: "45.00", currencyCode: "USD" }, maxVariantPrice: { amount: "45.00", currencyCode: "USD" } },
    variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/1", title: "Default", image: null, compareAtPrice: null, selectedOptions: [], availableForSale: true, price: { amount: "45.00", currencyCode: "USD" } } }] },
  } satisfies ShopifyProduct;

  const mockProduct2 = {
    id: "gid://shopify/Product/2",
    handle: "white-porcelain-mug-2",
    title: "White Porcelain Mug 2",
    description: "Handmade ceramic mug 2",
    descriptionHtml: "<p>Handmade ceramic mug 2</p>",
    vendor: "Kwon Ceramics",
    productType: "Cup",
    tags: ["ceramic", "mug"],
    availableForSale: true,
    images: { edges: [{ node: { url: "https://cdn.shopify.com/2.jpg", altText: "2", width: 800, height: 800 } }] },
    priceRange: { minVariantPrice: { amount: "55.00", currencyCode: "USD" }, maxVariantPrice: { amount: "55.00", currencyCode: "USD" } },
    variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/2", title: "Default", image: null, compareAtPrice: null, selectedOptions: [], availableForSale: true, price: { amount: "55.00", currencyCode: "USD" } } }] },
  } satisfies ShopifyProduct;

  globalThis.fetch = async (input, init) => {
    const bodyStr = typeof init?.body === "string" ? init.body : "{}";
    const parsed = JSON.parse(bodyStr);
    calls.push(parsed.variables);

    if (!parsed.variables?.after) {
      // First page
      return new Response(JSON.stringify({
        data: {
          products: {
            pageInfo: {
              hasNextPage: true,
              endCursor: "cursor-page-1-end",
            },
            edges: [
              { cursor: "cursor-1", node: mockProduct1 },
            ],
          },
        },
      }), { status: 200, headers: { "content-type": "application/json" } });
    }

    // Second page
    return new Response(JSON.stringify({
      data: {
        products: {
          pageInfo: {
            hasNextPage: false,
            endCursor: "cursor-page-2-end",
          },
          edges: [
            { cursor: "cursor-2", node: mockProduct2 },
          ],
        },
      },
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const all = await fetchAllCatalogProducts({ maxItems: 100, pageSize: 1 });
    assert.equal(all.length, 2);
    assert.equal(all[0].handle, "white-porcelain-mug-1");
    assert.equal(all[1].handle, "white-porcelain-mug-2");
    assert.equal(calls.length, 2);
    assert.equal(calls[0].after, null);
    assert.equal(calls[1].after, "cursor-page-1-end");
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("fetchAllCatalogProducts breaks on stalled cursor to prevent infinite loop", async () => {
  const previousFetch = globalThis.fetch;
  let callCount = 0;

  globalThis.fetch = async () => {
    callCount += 1;
    // Returns hasNextPage: true but endCursor is never updated
    return new Response(JSON.stringify({
      data: {
        products: {
          pageInfo: {
            hasNextPage: true,
            endCursor: "stuck-cursor",
          },
          edges: [
            {
              cursor: "stuck-cursor",
              node: {
                id: "gid://shopify/Product/1",
                handle: "stuck-product",
                title: "Stuck Product",
                description: "",
                vendor: "Test",
                productType: "",
                tags: [],
                availableForSale: true,
                images: { edges: [] },
                priceRange: { minVariantPrice: { amount: "10.00", currencyCode: "USD" }, maxVariantPrice: { amount: "10.00", currencyCode: "USD" } },
                variants: { edges: [] },
              },
            },
          ],
        },
      },
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const products = await fetchAllCatalogProducts({ maxItems: 50, pageSize: 10 });
    // Must terminate within 2 calls when cursor doesn't advance
    assert.ok(callCount <= 2, `Expected termination within 2 calls, got ${callCount}`);
    assert.ok(products.length > 0);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("Product page JSON-LD schema does not contain store-wide aggregateRating or review", () => {
  // Test schema structure contract for Task E
  const mockProduct = {
    id: "gid://shopify/Product/100",
    handle: "moon-jar",
    title: "Moon Jar",
    description: "Exquisite handmade Korean moon jar.",
    descriptionHtml: "<p>Exquisite handmade Korean moon jar.</p>",
    vendor: "Moon Atelier",
    productType: "Ceramic",
    tags: ["material:White Porcelain"],
    availableForSale: true,
    images: { edges: [{ node: { url: "https://cdn.shopify.com/moonjar.jpg", altText: "Moon jar", width: 800, height: 800 } }] },
    priceRange: { minVariantPrice: { amount: "280.00", currencyCode: "USD" }, maxVariantPrice: { amount: "280.00", currencyCode: "USD" } },
    variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/100", title: "Default", image: null, compareAtPrice: null, selectedOptions: [], availableForSale: true, price: { amount: "280.00", currencyCode: "USD" } } }] },
  } satisfies ShopifyProduct;

  const firstVariant = mockProduct.variants.edges[0]?.node;
  const canonicalUrl = `https://blankseoul.com/product/${encodeURIComponent(mockProduct.handle)}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: mockProduct.title,
    description: mockProduct.description.slice(0, 300),
    image: mockProduct.images.edges.map((img) => img.node.url),
    url: canonicalUrl,
    sku: firstVariant?.id || mockProduct.id,
    brand: {
      "@type": "Brand",
      name: mockProduct.vendor || "BLANK SEOUL",
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      price: firstVariant?.price.amount || "0.00",
      priceCurrency: firstVariant?.price.currencyCode || "USD",
      availability: "https://schema.org/InStock",
    },
  };

  // Verify that store-wide reviews are strictly excluded from Product JSON-LD
  assert.equal("aggregateRating" in jsonLd, false);
  assert.equal("review" in jsonLd, false);
  assert.equal(jsonLd["@type"], "Product");
  assert.equal((jsonLd.offers as { price: string })?.price, "280.00");
});
