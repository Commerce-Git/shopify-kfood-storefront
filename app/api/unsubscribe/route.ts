import { NextResponse } from "next/server";
import { verifyUnsubscribeToken, optOut } from "@/lib/unsubscribe";

/**
 * POST /api/unsubscribe
 * 이메일 수신 거부 처리
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

    // HMAC 토큰 검증
    if (!verifyUnsubscribeToken(email, token)) {
      return NextResponse.json(
        { error: "Invalid unsubscribe link." },
        { status: 403 }
      );
    }

    // Supabase에 opt-out 등록
    const { error } = await optOut(email);

    if (error) {
      console.error("[Unsubscribe] DB error:", error);
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
