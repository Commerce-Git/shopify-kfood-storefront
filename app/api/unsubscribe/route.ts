import { NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { updateMarketingConsent } from "@/lib/shopify/admin";

/**
 * POST /api/unsubscribe
 * 이메일 수신 거부 처리 — Shopify Single Source of Truth
 *
 * 고객이 이메일 하단의 '구독 취소' 링크를 클릭하면,
 * Shopify Admin API를 통해 해당 고객의 마케팅 동의 상태를
 * 직접 UNSUBSCRIBED로 변경합니다.
 */
export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Missing email or token." },
        { status: 400 }
      );
    }

    // HMAC 토큰 검증 (본인만 구독 취소 가능)
    if (!verifyUnsubscribeToken(email, token)) {
      return NextResponse.json(
        { error: "Invalid unsubscribe link." },
        { status: 403 }
      );
    }

    // Shopify에서 직접 마케팅 동의 상태를 UNSUBSCRIBED로 변경
    const { success, error } = await updateMarketingConsent(email, "UNSUBSCRIBED");

    if (!success) {
      console.error("[Unsubscribe] Shopify update failed:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
