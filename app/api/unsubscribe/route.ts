import { NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { updateMarketingConsent, updateArtistFollowStatus } from "@/lib/shopify/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/unsubscribe
 * 이메일 수신 거부 처리 — Omni-SSOT (Shopify + Supabase 양방향 동기화)
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

    // 3. Granular Unfollow for specific artist (Omni-SSOT)
    if (cleanArtist) {
      // 3.1. Shopify Tag Update
      const { success, error } = await updateArtistFollowStatus(
        cleanEmail,
        cleanArtist,
        "unfollow"
      );

      if (!success) {
        console.error("[Unsubscribe Artist] Shopify error:", error);
      }

      // 3.2. Supabase Soft Churn Update
      try {
        const { data: customer } = await supabaseAdmin
          .from("storefront_customers")
          .select("id")
          .eq("email", cleanEmail)
          .single();

        if (customer?.id) {
          await supabaseAdmin
            .from("customer_followed_artists")
            .update({
              status: "unsubscribed",
              unfollowed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", customer.id)
            .eq("artist_slug", cleanArtist);
        }
      } catch (sbErr) {
        console.warn("[Unsubscribe Artist] Supabase sync notice:", sbErr);
      }

      return NextResponse.json({ success: true, artist: cleanArtist });
    }

    // 4. Global Unsubscribe: Shopify + Supabase 마케팅 동의 취소
    const { success, error } = await updateMarketingConsent(cleanEmail, "UNSUBSCRIBED");

    if (!success) {
      console.error("[Unsubscribe Global] Shopify update failed:", error);
    }

    // 4.2. Supabase 마케팅 동의 및 드롭 알림 일괄 해제
    try {
      const { data: customer } = await supabaseAdmin
        .from("storefront_customers")
        .select("id")
        .eq("email", cleanEmail)
        .single();

      await supabaseAdmin
        .from("storefront_customers")
        .update({
          marketing_consent: false,
          updated_at: new Date().toISOString(),
        })
        .eq("email", cleanEmail);

      if (customer?.id) {
        await supabaseAdmin
          .from("customer_followed_artists")
          .update({
            notify_drops: false,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", customer.id);
      }
    } catch (sbErr) {
      console.warn("[Unsubscribe Global] Supabase sync notice:", sbErr);
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
