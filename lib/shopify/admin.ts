/**
 * Shopify Admin API client (2026+ OAuth flow).
 *
 * Since Jan 2026, Shopify no longer issues static shpat_ tokens.
 * Instead, we use Client Credentials Grant to get short-lived tokens.
 * This module handles token acquisition, caching (in-memory + Supabase),
 * and auto-refresh.
 *
 * Server-side only — never import this from client components.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

const SHOPIFY_STORE_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_CLIENT_ID =
  process.env.SHOPIFY_CLIENT_ID || "";
const SHOPIFY_CLIENT_SECRET =
  process.env.SHOPIFY_CLIENT_SECRET || "";

const ADMIN_API_VERSION = "2025-10";
const ADMIN_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}`;
const TOKEN_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`;

// ---- Token Cache (in-memory for same-process reuse) ----

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get a valid Admin API access token.
 * Priority: in-memory cache → Supabase cache → fresh OAuth.
 */
export async function getAdminToken(): Promise<string> {
  // 1. In-memory cache (same serverless instance)
  if (cachedToken && Date.now() < tokenExpiresAt - 5 * 60 * 1000) {
    return cachedToken;
  }

  // 2. Supabase cache (shared across all instances)
  try {
    const { data: cached } = await supabaseAdmin
      .from("shopify_token_cache")
      .select("access_token, expires_at")
      .eq("id", "admin_token")
      .single();

    if (cached && new Date(cached.expires_at).getTime() > Date.now() + 5 * 60 * 1000) {
      // Valid token found in Supabase — save to in-memory too
      cachedToken = cached.access_token;
      tokenExpiresAt = new Date(cached.expires_at).getTime();
      return cachedToken!;
    }
  } catch {
    // Supabase cache miss or table doesn't exist — continue to OAuth
  }

  // 3. Fresh OAuth token
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
  tokenExpiresAt = Date.now() + (data.expires_in || 86400) * 1000;

  // Save to Supabase for other instances (fire-and-forget)
  supabaseAdmin
    .from("shopify_token_cache")
    .upsert({
      id: "admin_token",
      access_token: cachedToken,
      expires_at: new Date(tokenExpiresAt).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .then(({ error }) => {
      if (error) console.warn("[Admin API] Failed to cache token:", error.message);
    });

  return cachedToken!;
}

/**
 * Wrapper around fetch for Shopify Admin API calls.
 * Handles 429 rate limiting with automatic retry + exponential backoff.
 */
async function adminFetch(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, options);

    if (response.status === 429 && attempt < retries - 1) {
      const retryAfter = parseFloat(response.headers.get("Retry-After") || "2");
      const waitMs = retryAfter * 1000 * (attempt + 1); // exponential backoff
      console.warn(`[Admin API] Rate limited. Retrying in ${waitMs}ms (attempt ${attempt + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    return response;
  }

  // Should never reach here, but TypeScript needs it
  throw new Error("[Admin API] Max retries exceeded");
}

/**
 * Execute a GraphQL query against the Shopify Admin API.
 * Handles token acquisition, rate limiting, and retries automatically.
 * Use this for all Admin GraphQL operations (discounts, tags, orders, etc.).
 */
export async function adminGraphQL(
  query: string,
  variables?: Record<string, unknown>
) {
  const token = await getAdminToken();

  const response = await adminFetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[Admin GraphQL] HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

// ---- Types (Admin REST API format) ----

interface AdminLineItem {
  title: string;
  quantity: number;
  price: string;
  variant_id: number | null;
  variant_title?: string | null;
}

interface AdminFulfillment {
  id: number;
  status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  tracking_company: string | null;
}

interface AdminOrder {
  id: number;
  admin_graphql_api_id: string;
  name: string;
  created_at: string;
  processed_at: string;
  cancelled_at: string | null;
  fulfillment_status: string | null;
  financial_status: string;
  order_status_url: string;
  total_price: string;
  currency: string;
  line_items: AdminLineItem[];
  fulfillments: AdminFulfillment[];
}

// ---- Mapped types (compatible with existing UI) ----

export interface MappedOrder {
  id: string;
  name: string;
  processedAt: string;
  cancelledAt: string | null;
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
        variantId: string | null;
        variant: {
          title: string | null;
          price: { amount: string; currencyCode: string };
          image: { url: string; altText: string | null } | null;
        } | null;
      };
    }[];
  };
  tracking: {
    number: string | null;
    url: string | null;
    company: string | null;
  } | null;
  wmsStatus?: "placed" | "crafting" | "packaging" | "shipped" | "delivered";
  deliveredAt?: string | null;
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

  const response = await adminFetch(
    `${ADMIN_API_URL}/orders.json?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
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
  const fulfillment = order.fulfillments?.[0] || null;

  return {
    id: order.admin_graphql_api_id,
    name: order.name,
    processedAt: order.processed_at,
    cancelledAt: order.cancelled_at || null,
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
          variantId: item.variant_id
            ? `gid://shopify/ProductVariant/${item.variant_id}`
            : null,
          variant: {
            title: item.variant_title || "",
            price: {
              amount: item.price,
               currencyCode: order.currency,
            },
            image: null,
          },
        },
      })),
    },
    tracking: fulfillment
      ? {
        number: fulfillment.tracking_number,
        url: fulfillment.tracking_url,
        company: fulfillment.tracking_company,
      }
      : null,
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

// ---- Order Cancellation + Full Refund ----

/**
 * Extract numeric order ID from Shopify GraphQL ID.
 * "gid://shopify/Order/6218047701302" → "6218047701302"
 */
function extractNumericId(gid: string): string {
  const match = gid.match(/\/(\d+)$/);
  if (!match) throw new Error(`Invalid Shopify GID: ${gid}`);
  return match[1];
}

/**
 * Cancel an order AND issue a full refund via Shopify Admin REST API.
 * Flow: calculate refund → execute refund → cancel order.
 * Server-side only.
 */
export async function cancelOrder(
  shopifyOrderGid: string,
  reason: string = "customer"
): Promise<{ success: boolean; refundAmount?: string; error?: string }> {
  try {
    const token = await getAdminToken();
    const numericId = extractNumericId(shopifyOrderGid);
    const headers = {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    };

    // ---- Step 0: Get order details (need line_items for refund) ----
    const orderRes = await adminFetch(
      `${ADMIN_API_URL}/orders/${numericId}.json?fields=id,line_items,total_price,currency`,
      { method: "GET", headers }
    );

    if (!orderRes.ok) {
      const text = await orderRes.text();
      return { success: false, error: `Failed to fetch order: HTTP ${orderRes.status}: ${text}` };
    }

    const { order } = await orderRes.json();

    // ---- Step 1: Calculate refund (Shopify computes exact amounts) ----
    const calcBody = {
      refund: {
        shipping: { full_refund: true },
        refund_line_items: order.line_items.map((item: { id: number; quantity: number }) => ({
          line_item_id: item.id,
          quantity: item.quantity,
          restock_type: "cancel",
        })),
      },
    };

    const calcRes = await adminFetch(
      `${ADMIN_API_URL}/orders/${numericId}/refunds/calculate.json`,
      { method: "POST", headers, body: JSON.stringify(calcBody) }
    );

    if (!calcRes.ok) {
      const text = await calcRes.text();
      console.error("[Admin API] Refund calculate error:", calcRes.status, text);
      return { success: false, error: `Refund calculation failed: HTTP ${calcRes.status}` };
    }

    const calcData = await calcRes.json();
    const suggestedRefund = calcData.refund;

    // ---- Step 2: Execute refund (change "suggested_refund" → "refund") ----
    const transactions = (suggestedRefund.transactions || []).map(
      (tx: { parent_id: number; amount: string; kind: string; gateway: string }) => ({
        parent_id: tx.parent_id,
        amount: tx.amount,
        kind: "refund", // Must change from "suggested_refund" to "refund"
        gateway: tx.gateway,
      })
    );

    const refundBody = {
      refund: {
        notify: true,
        refund_line_items: suggestedRefund.refund_line_items,
        transactions,
      },
    };

    const refundRes = await adminFetch(
      `${ADMIN_API_URL}/orders/${numericId}/refunds.json`,
      { method: "POST", headers, body: JSON.stringify(refundBody) }
    );

    if (!refundRes.ok) {
      const text = await refundRes.text();
      console.error("[Admin API] Refund execute error:", refundRes.status, text);
      return { success: false, error: `Refund failed: HTTP ${refundRes.status}: ${text}` };
    }

    // ---- Step 3: Cancel the order ----
    const cancelRes = await adminFetch(
      `${ADMIN_API_URL}/orders/${numericId}/cancel.json`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ reason, email: true }), // Send cancellation email immediately
      }
    );

    if (!cancelRes.ok) {
      // Refund succeeded but cancel failed — still considered success
      console.warn("[Admin API] Cancel failed after refund:", cancelRes.status);
    }

    return {
      success: true,
      refundAmount: order.total_price,
    };
  } catch (err) {
    console.error("[Admin API] Cancel+Refund exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ---- Marketing Consent Helpers ----

/**
 * Check if a customer is subscribed to email marketing.
 * Queries Shopify Admin API by email to get marketing consent state.
 * Returns true only if the customer exists and has explicitly subscribed.
 */
export async function isMarketingSubscribed(email: string): Promise<boolean> {
  try {
    const query = `
      query CheckMarketingConsent($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              emailMarketingConsent {
                marketingState
              }
            }
          }
        }
      }
    `;

    const result = await adminGraphQL(query, {
      query: `email:${email}`,
    });

    const customer = result?.data?.customers?.edges?.[0]?.node;
    if (!customer) return false;

    return customer.emailMarketingConsent?.marketingState === "SUBSCRIBED";
  } catch (err) {
    console.error("[Admin API] Marketing consent check failed:", err);
    return false; // Fail-safe: don't send if we can't verify
  }
}

/**
 * Update a customer's email marketing consent in Shopify.
 * Used when a customer clicks "Unsubscribe" in our emails.
 * This is the Single Source of Truth — no local DB needed.
 */
export async function updateMarketingConsent(
  email: string,
  state: "SUBSCRIBED" | "UNSUBSCRIBED"
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Find customer by email
    const searchQuery = `
      query FindCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const searchResult = await adminGraphQL(searchQuery, {
      query: `email:${email}`,
    });

    const customerId = searchResult?.data?.customers?.edges?.[0]?.node?.id;
    if (!customerId) {
      return { success: false, error: "Customer not found in Shopify." };
    }

    // 2. Update marketing consent
    const mutation = `
      mutation UpdateMarketingConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
        customerEmailMarketingConsentUpdate(input: $input) {
          customer {
            id
            emailMarketingConsent {
              marketingState
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const result = await adminGraphQL(mutation, {
      input: {
        customerId,
        emailMarketingConsent: {
          marketingState: state,
          consentUpdatedAt: new Date().toISOString(),
        },
      },
    });

    const userErrors = result?.data?.customerEmailMarketingConsentUpdate?.userErrors;
    if (userErrors?.length > 0) {
      return { success: false, error: userErrors[0].message };
    }

    return { success: true };
  } catch (err) {
    console.error("[Admin API] Marketing consent update failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Check if a customer with the given email is subscribed to newsletter / marketing.
 */
export async function checkIsSubscribed(email: string): Promise<boolean> {
  if (!email || !email.trim()) return false;
  try {
    const result = await adminGraphQL(
      `query CheckSubscription($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              emailMarketingConsent {
                marketingState
              }
              tags
            }
          }
        }
      }`,
      { query: `email:${email.trim().toLowerCase()}` }
    );
    const node = result?.data?.customers?.edges?.[0]?.node;
    if (!node) return false;

    const marketingState = node.emailMarketingConsent?.marketingState;
    if (marketingState === "UNSUBSCRIBED" || marketingState === "NOT_SUBSCRIBED") {
      return false;
    }

    const isSubscribedState = marketingState === "SUBSCRIBED";
    const hasTag = Array.isArray(node.tags) && node.tags.includes("newsletter");
    return isSubscribedState || (hasTag && marketingState !== "UNSUBSCRIBED");
  } catch (err) {
    console.error("[Admin API] checkIsSubscribed error:", err);
    return false;
  }
}
