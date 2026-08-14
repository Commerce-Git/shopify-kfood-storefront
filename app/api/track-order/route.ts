/**
 * Track Order API — Public endpoint for order tracking by email.
 *
 * Returns only non-sensitive order data (no addresses, names, amounts, or product details).
 * Rate limited to prevent abuse.
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrdersByEmail, checkIsSubscribed } from "@/lib/shopify/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Simple in-memory rate limiter (per serverless instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Mask email for display: "john@example.com" → "j***@example.com"
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local[0]}***@${domain}`;
}

// Helper to aggregate multiple item statuses into a single order status (fallback logic)
function aggregateWmsStatus(
  shopifyStatus: string,
  artistStatuses: string[] | undefined,
  deliveryStatus?: string | null
): "placed" | "crafting" | "packaging" | "shipped" | "delivered" {
  if (deliveryStatus === "delivered") return "delivered";
  if (shopifyStatus === "FULFILLED") return "shipped";
  if (!artistStatuses || artistStatuses.length === 0) return "placed";

  // If any item is pending (WMS initial state), the overall order is at "placed"
  if (artistStatuses.includes("pending")) return "placed";

  // If any item is confirmed (WMS crafting state), the overall order is at "crafting"
  if (artistStatuses.includes("confirmed")) return "crafting";

  // If all items are shipped or received by warehouse, the overall order is at "packaging"
  if (artistStatuses.includes("shipped") || artistStatuses.includes("received")) return "packaging";

  return "placed";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limiting
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const orders = await getOrdersByEmail(email);

    // Filter out cancelled/refunded orders
    const activeOrders = orders.filter(
      (o) =>
        o.financialStatus !== "REFUNDED" &&
        o.financialStatus !== "VOIDED"
    );

    const shopifyIds = activeOrders.map((o) => o.id);
    const viewStatusMap: Record<string, { customer_status: "placed" | "crafting" | "packaging" | "shipped" | "delivered"; delivered_at: string | null }> = {};
    let artistOrdersMap: Record<string, string[]> = {};

    if (shopifyIds.length > 0) {
      // 1. Try querying unified order_status_view first
      const { data: viewData, error: viewError } = await supabaseAdmin
        .from("order_status_view")
        .select("shopify_id, customer_status, delivered_at")
        .in("shopify_id", shopifyIds);

      if (!viewError && viewData && viewData.length > 0) {
        for (const row of viewData) {
          if (row.shopify_id && row.customer_status) {
            viewStatusMap[row.shopify_id] = {
              customer_status: row.customer_status,
              delivered_at: row.delivered_at || null,
            };
          }
        }
      }

      // 2. Fallback to artist_orders for IDs not found in view
      const missingIds = shopifyIds.filter((id) => !viewStatusMap[id]);
      if (missingIds.length > 0) {
        const { data: artistOrders, error: dbError } = await supabaseAdmin
          .from("artist_orders")
          .select("shopify_order_id, status")
          .in("shopify_order_id", missingIds);

        if (!dbError && artistOrders) {
          for (const row of artistOrders) {
            if (!artistOrdersMap[row.shopify_order_id]) {
              artistOrdersMap[row.shopify_order_id] = [];
            }
            artistOrdersMap[row.shopify_order_id].push(row.status.toLowerCase());
          }
        }
      }
    }

    const publicOrders = activeOrders.map((order) => {
      const viewResult = viewStatusMap[order.id];
      const wmsStatus = viewResult?.customer_status || aggregateWmsStatus(order.fulfillmentStatus, artistOrdersMap[order.id]);
      const deliveredAt = viewResult?.delivered_at || null;
      const itemCount = order.lineItems.edges.reduce((sum, { node }) => sum + node.quantity, 0);
      const formattedPrice = order.totalPrice?.amount
        ? parseFloat(order.totalPrice.amount).toFixed(2)
        : "0.00";

      return {
        name: order.name,
        date: new Date(order.processedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: wmsStatus === "delivered" ? "delivered" : order.fulfillmentStatus === "FULFILLED" ? "shipped" : "preparing",
        fulfillmentStatus: order.fulfillmentStatus,
        wmsStatus,
        deliveredAt,
        itemCount,
        totalPrice: formattedPrice,
        lineItems: order.lineItems.edges.map(({ node }) => ({
          title: node.title,
          quantity: node.quantity,
          imageUrl: node.variant?.image?.url || null,
          altText: node.variant?.image?.altText || node.title,
        })),
        tracking: order.tracking?.number
          ? {
              number: order.tracking.number,
              carrier: order.tracking.company || "Korea Post EMS",
            }
          : null,
      };
    });

    const isSubscribed = await checkIsSubscribed(email);

    return NextResponse.json({
      maskedEmail: maskEmail(email),
      isSubscribed,
      orders: publicOrders,
    });
  } catch (err) {
    console.error("[Track Order API] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
