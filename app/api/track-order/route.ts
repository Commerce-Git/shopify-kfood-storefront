/**
 * Track Order API — verified-account order tracking.
 *
 * Returns the verified account’s order summary, line items and shipment progress.
 * Rate limited to prevent abuse.
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrdersByEmail, checkIsSubscribed } from "@/lib/shopify/admin";
import { getOrderProgress } from "@/lib/orders/enrichment";
import { aggregateWmsStatus } from "@/lib/orders/status";
import { splitOrderIntoVendorPackages } from "@/lib/shopify/order-utils";

import { createClient } from "@/lib/supabase/server";
import { verifyOrderLookupEmail } from "@/lib/security/orderOwnership";

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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const ownership = verifyOrderLookupEmail(authError ? null : user, email);
    if (!ownership.ok) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }
    const verifiedEmail = ownership.email;

    const orders = await getOrdersByEmail(verifiedEmail);

    // Filter out cancelled/refunded orders
    const activeOrders = orders.filter(
      (o) =>
        !o.cancelledAt && o.financialStatus !== "REFUNDED" &&
        o.financialStatus !== "VOIDED"
    );

    const { viewStatusMap, artistOrdersMap, artistStatusByOrderAndVendor } = await getOrderProgress(activeOrders);

    const publicOrders = activeOrders.map((order) => {
      const viewResult = viewStatusMap[order.id];
      const wmsStatus = viewResult?.customer_status || aggregateWmsStatus(order.fulfillmentStatus, artistOrdersMap[order.id]);
      const deliveredAt = viewResult?.delivered_at || null;
      const itemCount = order.lineItems.edges.reduce((sum, { node }) => sum + node.quantity, 0);
      const formattedPrice = order.totalPrice?.amount
        ? parseFloat(order.totalPrice.amount).toFixed(2)
        : "0.00";

      const packages = splitOrderIntoVendorPackages({
        orderId: order.id,
        lineItems: order.lineItems.edges,
        artistStatusMap: artistStatusByOrderAndVendor[order.id] || {},
        orderFulfillmentStatus: order.fulfillmentStatus,
        orderWmsStatus: wmsStatus,
        orderTracking: order.tracking,
        fulfillments: order.fulfillments,
        deliveredAt,
      });

      return {
        id: order.id,
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
          vendor: node.vendor || "Blank Seoul",
          imageUrl: node.variant?.image?.url || null,
          altText: node.variant?.image?.altText || node.title,
        })),
        tracking: order.tracking?.number
          ? {
              number: order.tracking.number,
              carrier: order.tracking.company || "Korea Post EMS",
              url: order.tracking.url,
            }
          : null,
        packages,
      };
    });

    const isSubscribed = await checkIsSubscribed(verifiedEmail);

    return NextResponse.json({
      maskedEmail: maskEmail(verifiedEmail),
      isSubscribed,
      orders: publicOrders,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    console.error("[Track Order API] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
