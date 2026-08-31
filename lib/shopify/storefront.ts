import type { StorefrontResponse } from "./types";

/**
 * Shopify Storefront API GraphQL client.
 * Uses the public Storefront Access Token (safe to expose in browser).
 */
export async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const storeDomain =
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || "";
  const storefrontToken =
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
  const storefrontApiUrl = `https://${storeDomain}/api/2024-01/graphql.json`;

  // If no token configured, throw a helpful error
  if (!storeDomain || !storefrontToken) {
    throw new Error(
      "[Storefront API] Missing environment variables. " +
        "Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN in .env.local"
    );
  }

  const response = await fetch(storefrontApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // ISR: revalidate every 1 minute (60 seconds)
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
