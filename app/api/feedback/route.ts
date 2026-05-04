import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Simple in-memory rate limiting (per-IP, 1 request per minute)
const recentSubmissions = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, name, email, _hp } = body;

    // Honeypot check — bots fill hidden fields, humans don't
    if (_hp) {
      // Pretend success but don't save
      return NextResponse.json({ success: true });
    }

    // Validate required field
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required." },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const lastSubmission = recentSubmissions.get(ip);
    if (lastSubmission && Date.now() - lastSubmission < 60_000) {
      return NextResponse.json(
        { error: "Please wait a moment before sending another message." },
        { status: 429 }
      );
    }
    recentSubmissions.set(ip, Date.now());

    // Clean up old entries periodically (prevent memory leak)
    if (recentSubmissions.size > 1000) {
      const cutoff = Date.now() - 60_000;
      for (const [key, time] of recentSubmissions) {
        if (time < cutoff) recentSubmissions.delete(key);
      }
    }

    // Save to Supabase
    const { error: insertError } = await supabaseAdmin
      .from("customer_feedback")
      .insert({
        content: content.trim().slice(0, 5000),
        name: typeof name === "string" ? name.trim().slice(0, 200) || null : null,
        email: typeof email === "string" ? email.trim().slice(0, 320) || null : null,
        ip_address: ip,
      });

    if (insertError) {
      console.error("[Feedback API] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Feedback API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
