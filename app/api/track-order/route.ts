/**
 * Track Order API — Public endpoint for order tracking by email.
 *
 * Returns only non-sensitive order data (no addresses, names, amounts, or product details).
 * Rate limited to prevent abuse.
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrdersByEmail } from "@/lib/shopify/admin";

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

    // Filter out cancelled/refunded orders and map to public-safe format
    const publicOrders = orders
      .filter(
        (o) =>
          o.financialStatus !== "REFUNDED" &&
          o.financialStatus !== "VOIDED"
      )
      .map((order) => ({
        name: order.name,
        date: new Date(order.processedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status:
          order.fulfillmentStatus === "FULFILLED" ? "shipped" : "preparing",
        itemCount: order.lineItems.edges.length,
        tracking: order.tracking?.number
          ? {
              number: order.tracking.number,
              carrier: order.tracking.company || "Korea Post EMS",
            }
          : null,
      }));

    return NextResponse.json({
      maskedEmail: maskEmail(email),
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
