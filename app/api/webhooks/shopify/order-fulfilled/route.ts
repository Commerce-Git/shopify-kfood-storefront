import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Shopify Admin API Client Secret (Shopify에서 발급받은 Webhook 검증용 키)
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

    // 1. 보안 검증: Shopify가 진짜로 보낸 요청인지 확인 (HMAC)
    if (SHOPIFY_CLIENT_SECRET && hmacHeader) {
      const generatedHash = crypto
        .createHmac("sha256", SHOPIFY_CLIENT_SECRET)
        .update(rawBody, "utf8")
        .digest("base64");

      if (generatedHash !== hmacHeader) {
        console.warn("Shopify Webhook HMAC verification failed!");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 2. 데이터 파싱
    const payload = JSON.parse(rawBody);
    const orderId = payload.id?.toString();
    const email = payload.email || payload.contact_email;
    const firstName = payload.customer?.first_name || "";

    if (!orderId || !email) {
      // 이메일이 없는 주문은 무시
      return NextResponse.json({ message: "No email found, ignored." });
    }

    // 3. Supabase 장부에 기록 (14일 뒤 스케줄러가 찾을 수 있도록)
    const { error } = await supabase.from("fulfilled_orders").upsert(
      {
        order_id: orderId,
        email: email,
        first_name: firstName,
        fulfilled_at: new Date().toISOString(),
        feedback_requested: false,
      },
      { onConflict: "order_id" } // 이미 있으면 덮어쓰기
    );

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, message: "Order logged for future feedback." });
  } catch (error) {
    console.error("Order Fulfilled Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
