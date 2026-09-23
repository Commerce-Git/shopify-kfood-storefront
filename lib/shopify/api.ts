import { storefrontFetch } from "./storefront.ts";
import { GET_ALL_PRODUCTS, GET_PRODUCT_BY_HANDLE, GET_COLLECTION_BY_HANDLE, GET_ALL_COLLECTIONS } from "./queries.ts";
import type { ShopifyProduct, ShopifyCollection } from "./types.ts";

// ---- API Response Shapes ----

interface ProductsResponse {
  products: {
    pageInfo?: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    edges: {
      cursor?: string;
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

interface CollectionsResponse {
  collections: {
    edges: {
      node: ShopifyCollection;
    }[];
  };
}

// ---- Public API Functions ----

export interface ProductsPageResult {
  products: ShopifyProduct[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export interface FetchCatalogOptions {
  maxItems?: number;
  pageSize?: number;
}

/**
 * Fetch a single page of products from Shopify with cursor pagination info.
 */
export async function getProductsPage(options?: {
  first?: number;
  after?: string | null;
}): Promise<ProductsPageResult> {
  const data = await storefrontFetch<ProductsResponse>(GET_ALL_PRODUCTS, {
    first: options?.first ?? 250,
    after: options?.after || null,
  });
  return {
    products: (data.products?.edges || []).map((edge) => edge.node),
    pageInfo: data.products?.pageInfo || { hasNextPage: false, endCursor: null },
  };
}

/**
 * Robust Cursor Pagination: Fetches all catalog products across multiple pages (Task F).
 * - Enforces safety guards: maxPages, maxItems cap.
 * - Detects stalled cursors to guarantee deadlock/infinite loop prevention.
 * - Suitable for sitemap and catalog building without rate-limit exhaustion.
 */
export async function fetchAllCatalogProducts(
  options: FetchCatalogOptions = {}
): Promise<ShopifyProduct[]> {
  const maxItems = options.maxItems ?? 1000;
  const pageSize = Math.min(options.pageSize ?? 250, 250);
  const maxPages = Math.ceil(maxItems / pageSize) + 2;

  const allProducts: ShopifyProduct[] = [];
  let currentCursor: string | null = null;
  let pageCount = 0;

  while (pageCount < maxPages && allProducts.length < maxItems) {
    pageCount += 1;
    const page = await getProductsPage({
      first: pageSize,
      after: currentCursor,
    });

    if (page.products.length === 0) break;

    allProducts.push(...page.products);

    if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) {
      break;
    }

    // Stalled cursor guard: If Shopify returns an identical cursor, terminate to prevent infinite loop
    if (page.pageInfo.endCursor === currentCursor) {
      console.warn(`[fetchAllCatalogProducts] Stalled cursor detected (${currentCursor}), terminating pagination.`);
      break;
    }

    currentCursor = page.pageInfo.endCursor;
  }

  return allProducts.slice(0, maxItems);
}

/**
 * Fetch products from Shopify (first page).
 * Returns an empty array if no products are found or API is not configured.
 */
export async function getAllProducts(count = 20): Promise<ShopifyProduct[]> {
  try {
    const page = await getProductsPage({ first: count });
    return page.products;
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

/**
 * Fetch all collections
 */
export async function getAllCollections(limit = 20): Promise<ShopifyCollection[]> {
  try {
    const data = await storefrontFetch<CollectionsResponse>(
      GET_ALL_COLLECTIONS,
      { first: limit }
    );
    return data.collections.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("[getAllCollections]", error);
    return [];
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

/**
 * Check if a product is completely sold out across ALL variants.
 * Returns true ONLY if every single variant has availableForSale === false.
 * If at least one variant is available, returns false.
 */
export function isProductSoldOut(product: ShopifyProduct): boolean {
  if (product.variants?.edges && product.variants.edges.length > 0) {
    return !product.variants.edges.some((edge) => edge.node.availableForSale);
  }
  return !product.availableForSale;
}

