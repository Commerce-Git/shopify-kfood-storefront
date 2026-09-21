/**
 * Unsubscribe 유틸 — HMAC 토큰 생성/검증
 *
 * 보안: 이메일 주소를 HMAC-SHA256으로 서명하여,
 * 본인만 자신의 수신 거부 링크를 사용할 수 있도록 합니다.
 *
 * 마케팅 동의 상태 관리는 Shopify를 Single Source of Truth로 사용합니다.
 * (lib/shopify/admin.ts의 isMarketingSubscribed, updateMarketingConsent 참조)
 */

import { createHmac } from "crypto";

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || "";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://blank-seoul-storefront.vercel.app";

/** HMAC 토큰 생성 */
function generateToken(email: string, artistSlug?: string): string {
  const payload = artistSlug
    ? `${email.toLowerCase().trim()}:${artistSlug.toLowerCase().trim()}`
    : email.toLowerCase().trim();
  return createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(payload)
    .digest("hex");
}

/** Unsubscribe URL 생성 (이메일 템플릿 웹 링크에서 사용) */
export function generateUnsubscribeUrl(email: string, artistSlug?: string): string {
  const token = generateToken(email, artistSlug);
  const encodedEmail = encodeURIComponent(email.toLowerCase().trim());
  const artistParam = artistSlug
    ? `&artist=${encodeURIComponent(artistSlug.toLowerCase().trim())}`
    : "";
  return `${SITE_URL}/unsubscribe?email=${encodedEmail}&token=${token}${artistParam}`;
}

/**
 * RFC 8058 One-Click Unsubscribe API URL 생성
 * Mail-client automated POST (Gmail, Yahoo) uses this target.
 */
export function generateOneClickUnsubscribeApiUrl(email: string, artistSlug?: string): string {
  const token = generateToken(email, artistSlug);
  const encodedEmail = encodeURIComponent(email.toLowerCase().trim());
  const artistParam = artistSlug
    ? `&artist=${encodeURIComponent(artistSlug.toLowerCase().trim())}`
    : "";
  return `${SITE_URL}/api/unsubscribe?email=${encodedEmail}&token=${token}${artistParam}`;
}

/** HMAC 토큰 검증 (API에서 사용) */
export function verifyUnsubscribeToken(
  email: string,
  token: string,
  artistSlug?: string
): boolean {
  const expected = generateToken(email, artistSlug);
  return expected === token;
}

