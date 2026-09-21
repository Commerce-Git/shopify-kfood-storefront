import { NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { updateMarketingConsent, updateArtistFollowStatus } from "@/lib/shopify/admin";

/**
 * POST /api/unsubscribe
 * 이메일 수신 거부 처리 — Shopify Single Source of Truth
 *
 * 지원 형식:
 * 1. Web UI JSON POST: { email, token, artist? }
 * 2. RFC 8058 One-Click POST (Gmail, Yahoo native button):
 *    URL searchParams (?email=...&token=...&artist=...) with form-urlencoded or empty body
 */
export async function POST(request: Request) {
  try {
    let email: string | null = null;
    let token: string | null = null;
    let artist: string | null = null;

    // 1. Try parsing JSON body
    try {
      const body = await request.json();
      if (body && typeof body === "object") {
        email = body.email ?? null;
        token = body.token ?? null;
        artist = body.artist ?? null;
      }
    } catch {
      // Body may not be JSON (RFC 8058 dispatches form-data or empty body)
    }

    // 2. Fallback to URL searchParams if not found in body
    const url = new URL(request.url);
    if (!email) email = url.searchParams.get("email");
    if (!token) token = url.searchParams.get("token");
    if (!artist) artist = url.searchParams.get("artist");

    const cleanEmail = email?.trim()?.toLowerCase();
    const cleanToken = token?.trim();
    const cleanArtist = artist?.trim()?.toLowerCase() || undefined;

    if (!cleanEmail || !cleanToken) {
      return NextResponse.json(
        { error: "Missing email or token." },
        { status: 400 }
      );
    }

    // HMAC 토큰 검증 (본인만 구독 취소 가능)
    if (!verifyUnsubscribeToken(cleanEmail, cleanToken, cleanArtist)) {
      return NextResponse.json(
        { error: "Invalid unsubscribe link." },
        { status: 403 }
      );
    }

    // 3. Granular Unfollow for specific artist (SSOT)
    if (cleanArtist) {
      const { success, error } = await updateArtistFollowStatus(
        cleanEmail,
        cleanArtist,
        "unfollow"
      );

      if (!success) {
        console.error("[Unsubscribe Artist] Error:", error);
        return NextResponse.json(
          { error: error || "Failed to unfollow artist. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, artist: cleanArtist });
    }

    // 4. Global: Shopify에서 직접 마케팅 동의 상태를 UNSUBSCRIBED로 변경
    const { success, error } = await updateMarketingConsent(cleanEmail, "UNSUBSCRIBED");

    if (!success) {
      console.error("[Unsubscribe] Shopify update failed:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Unsubscribe API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Invalid request." },
      { status: 400 }
    );
  }
}
