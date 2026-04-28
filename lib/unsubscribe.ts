/**
 * Unsubscribe 유틸 — HMAC 토큰 생성/검증 + opt-out 확인
 *
 * 보안: 이메일 주소를 HMAC-SHA256으로 서명하여,
 * 본인만 자신의 수신 거부 링크를 사용할 수 있도록 합니다.
 */

import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || "";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://shopify-kfood-storefront.vercel.app";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

/** HMAC 토큰 생성 */
function generateToken(email: string): string {
  return createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(email.toLowerCase().trim())
    .digest("hex");
}

/** Unsubscribe URL 생성 (이메일 템플릿에서 사용) */
export function generateUnsubscribeUrl(email: string): string {
  const token = generateToken(email);
  const encodedEmail = encodeURIComponent(email.toLowerCase().trim());
  return `${SITE_URL}/unsubscribe?email=${encodedEmail}&token=${token}`;
}

/** HMAC 토큰 검증 (API에서 사용) */
export function verifyUnsubscribeToken(
  email: string,
  token: string
): boolean {
  const expected = generateToken(email);
  return expected === token;
}

/** 수신 거부 여부 확인 (크론잡에서 사용) */
export async function isOptedOut(email: string): Promise<boolean> {
  const { data } = await supabase
    .from("email_opt_out")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  return !!data;
}

/** 수신 거부 등록 */
export async function optOut(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("email_opt_out").upsert(
    { email: email.toLowerCase().trim() },
    { onConflict: "email" }
  );

  return { error: error?.message || null };
}
