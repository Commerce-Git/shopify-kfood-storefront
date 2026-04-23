/**
 * Shopify Admin API client (2026+ OAuth flow).
 *
 * Since Jan 2026, Shopify no longer issues static shpat_ tokens.
 * Instead, we use Client Credentials Grant to get short-lived tokens.
 * This module handles token acquisition, caching, and auto-refresh.
 *
 * Server-side only — never import this from client components.
 */

const SHOPIFY_STORE_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_CLIENT_ID =
  process.env.SHOPIFY_CLIENT_ID || "";
const SHOPIFY_CLIENT_SECRET =
  process.env.SHOPIFY_CLIENT_SECRET || "";

const ADMIN_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10`;
const TOKEN_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`;

// ---- Token Cache ----

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get a valid Admin API access token using Client Credentials Grant.
 * Tokens are cached and auto-refreshed when expired.
 */
async function getAdminToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 5 * 60 * 1000) {
    return cachedToken;
  }

  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    throw new Error(
      "[Admin API] Missing SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET in environment variables."
    );
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
    }).toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[Admin API] Token error:", response.status, text);
    throw new Error(
      `[Admin API] Failed to get access token: HTTP ${response.status}`
    );
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // expires_in is in seconds, convert to milliseconds
  tokenExpiresAt = Date.now() + (data.expires_in || 86400) * 1000;

  return cachedToken!;
}

// ---- Types (Admin REST API format) ----

interface AdminLineItem {
  title: string;
  quantity: number;
  price: string;
  variant_id: number | null;
}

interface AdminOrder {
  id: number;
  admin_graphql_api_id: string; // "gid://shopify/Order/123456"
  name: string; // "#1001"
  created_at: string;
  processed_at: string;
  fulfillment_status: string | null;
  financial_status: string;
  order_status_url: string;
  total_price: string;
  currency: string;
  line_items: AdminLineItem[];
}

// ---- Mapped types (compatible with existing UI) ----

export interface MappedOrder {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  statusUrl: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        variant: {
          price: { amount: string; currencyCode: string };
          image: { url: string; altText: string | null } | null;
        } | null;
      };
    }[];
  };
}

// ---- API Functions ----

/**
 * Fetch orders by customer email using Shopify Admin REST API.
 * Server-side only — never call this from client components.
 */
export async function getOrdersByEmail(
  email: string
): Promise<MappedOrder[]> {
  const token = await getAdminToken();

  const params = new URLSearchParams({
    email,
    status: "any",
    limit: "20",
    order: "processed_at desc",
  });

  const response = await fetch(
    `${ADMIN_API_URL}/orders.json?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
      // Don't cache — always fetch fresh order data
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("[Admin API] Error:", response.status, text);
    throw new Error(
      `[Admin API] HTTP ${response.status}: ${response.statusText}`
    );
  }

  const json = await response.json();
  const orders: AdminOrder[] = json.orders || [];

  // Map Admin REST format → existing UI format
  return orders.map(mapAdminOrder);
}

/**
 * Map Shopify Admin REST API order to our frontend format.
 * This keeps the existing UI components (OrderStatusBar, etc.) working
 * without any changes.
 */
function mapAdminOrder(order: AdminOrder): MappedOrder {
  return {
    id: order.admin_graphql_api_id,
    name: order.name,
    processedAt: order.processed_at,
    fulfillmentStatus: mapFulfillmentStatus(order.fulfillment_status),
    financialStatus: order.financial_status?.toUpperCase() || "PENDING",
    statusUrl: order.order_status_url,
    totalPrice: {
      amount: order.total_price,
      currencyCode: order.currency,
    },
    lineItems: {
      edges: order.line_items.map((item) => ({
        node: {
          title: item.title,
          quantity: item.quantity,
          variant: {
            price: {
              amount: item.price,
              currencyCode: order.currency,
            },
            image: null,
          },
        },
      })),
    },
  };
}

/**
 * Map Admin REST fulfillment_status to the Storefront API format
 * that our OrderStatusBar expects.
 */
function mapFulfillmentStatus(status: string | null): string {
  switch (status) {
    case "fulfilled":
      return "FULFILLED";
    case "partial":
      return "PARTIALLY_FULFILLED";
    case "restocked":
      return "RESTOCKED";
    case null:
    case "unfulfilled":
    default:
      return "UNFULFILLED";
  }
}
