import { storefrontFetch } from "./storefront";
import { GET_ALL_PRODUCTS, GET_PRODUCT_BY_HANDLE, GET_COLLECTION_BY_HANDLE } from "./queries";
import type { ShopifyProduct, ShopifyCollection } from "./types";

// ---- API Response Shapes ----

interface ProductsResponse {
  products: {
    edges: {
      node: ShopifyProduct;
    }[];
  };
}

interface ProductByHandleResponse {
  product: ShopifyProduct | null;
}

interface CollectionByHandleResponse {
  collection: ShopifyCollection | null;
}

// ---- Public API Functions ----

/**
 * Fetch all products from Shopify.
 * Returns an empty array if no products are found or API is not configured.
 */
export async function getAllProducts(count = 20): Promise<ShopifyProduct[]> {
  try {
    const data = await storefrontFetch<ProductsResponse>(GET_ALL_PRODUCTS, {
      first: count,
    });
    return data.products.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("[getAllProducts]", error);
    return [];
  }
}

/**
 * Fetch a single product by its URL handle (slug).
 * Returns null if not found.
 */
export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  try {
    const data = await storefrontFetch<ProductByHandleResponse>(
      GET_PRODUCT_BY_HANDLE,
      { handle }
    );
    return data.product;
  } catch (error) {
    console.error("[getProductByHandle]", error);
    return null;
  }
}

/**
 * Fetch a single collection by its URL handle (slug).
 * Returns null if not found.
 */
export async function getCollectionByHandle(
  handle: string
): Promise<ShopifyCollection | null> {
  try {
    const data = await storefrontFetch<CollectionByHandleResponse>(
      GET_COLLECTION_BY_HANDLE,
      { handle }
    );
    return data.collection;
  } catch (error) {
    console.error("[getCollectionByHandle]", error);
    return null;
  }
}

// ---- Helper Utilities ----

/** Extract the first image URL from a product, or return a fallback */
export function getProductImage(product: ShopifyProduct): string {
  return product.images.edges[0]?.node.url || "/assets/blank_seoul_symbol.png";
}

/** Extract the first image alt text */
export function getProductImageAlt(product: ShopifyProduct): string {
  return product.images.edges[0]?.node.altText || product.title;
}

/** Get all product images */
export function getProductImages(
  product: ShopifyProduct
): { url: string; alt: string }[] {
  return product.images.edges.map((edge) => ({
    url: edge.node.url,
    alt: edge.node.altText || product.title,
  }));
}

/** Format a price string (e.g., "39.99" → "$39.99") */
export function formatPrice(amount: string, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(parseFloat(amount));
}

/** Get the first variant ID (needed for checkout) */
export function getFirstVariantId(product: ShopifyProduct): string {
  return product.variants.edges[0]?.node.id || "";
}

/** Get price and compare-at-price */
export function getProductPricing(product: ShopifyProduct) {
  const variant = product.variants.edges[0]?.node;
  return {
    price: variant?.price.amount || "0",
    compareAtPrice: variant?.compareAtPrice?.amount || null,
    currency: variant?.price.currencyCode || "USD",
  };
}
