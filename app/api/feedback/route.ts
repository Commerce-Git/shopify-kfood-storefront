/**
 * Feedback API — Stores customer feedback in Supabase.
 *
 * Public endpoint (no auth required) since feedback is submitted
 * from the /feedback page after clicking an email link.
 * Rate limited to prevent abuse.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { VALID_SNACK_IDS, VALID_CATEGORY_IDS } from "@/lib/feedback-options";

// Use service_role to bypass RLS for insert
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Simple rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

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

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate rating (required, 1-5)
    const rating = Number(body.rating);
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    // Sanitize arrays (optional)
    const favoriteSnacks = Array.isArray(body.favoriteSnacks)
      ? body.favoriteSnacks.filter(
          (s: string) => typeof s === "string" && VALID_SNACK_IDS.includes(s)
        )
      : [];

    const leastFavoriteSnacks = Array.isArray(body.leastFavoriteSnacks)
      ? body.leastFavoriteSnacks.filter(
          (s: string) => typeof s === "string" && VALID_SNACK_IDS.includes(s)
        )
      : [];

    const wantNext = Array.isArray(body.wantNext)
      ? body.wantNext.filter(
          (s: string) => typeof s === "string" && VALID_CATEGORY_IDS.includes(s)
        )
      : [];

    // Sanitize comment (optional, max 1000 chars)
    const comment =
      typeof body.comment === "string"
        ? body.comment.trim().slice(0, 1000)
        : null;

    // Sanitize email (optional)
    const email =
      typeof body.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
        ? body.email.trim().toLowerCase()
        : null;

    const { error } = await supabase.from("feedback").insert({
      rating,
      favorite_snacks: favoriteSnacks,
      least_favorite_snacks: leastFavoriteSnacks,
      want_next: wantNext,
      comment,
      email,
    });

    if (error) {
      console.error("[Feedback API] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Feedback API] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
