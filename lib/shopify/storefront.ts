import type { StorefrontResponse } from "./types";

const SHOPIFY_STORE_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_STOREFRONT_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";

const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`;

/**
 * Shopify Storefront API GraphQL client.
 * Uses the public Storefront Access Token (safe to expose in browser).
 */
export async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  // If no token configured, throw a helpful error
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error(
      "[Storefront API] Missing environment variables. " +
        "Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN in .env.local"
    );
  }

  const response = await fetch(STOREFRONT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `[Storefront API] HTTP ${response.status}: ${response.statusText}`
    );
  }

  const json: StorefrontResponse<T> = await response.json();

  if (json.errors) {
    const messages = json.errors.map((e) => e.message).join(", ");
    throw new Error(`[Storefront API] GraphQL errors: ${messages}`);
  }

  return json.data;
}
