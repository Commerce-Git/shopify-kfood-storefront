/**
 * Unsubscribe 유틸 — HMAC 토큰 생성/검증
 *
 * 보안: 이메일 주소를 HMAC-SHA256으로 서명하여,
 * 본인만 자신의 수신 거부 링크를 사용할 수 있도록 합니다.
 *
 * 마케팅 동의 상태 관리는 Shopify를 Single Source of Truth로 사용합니다.
 * (lib/shopify/admin.ts의 isMarketingSubscribed, updateMarketingConsent 참조)
 */

import { createHmac, timingSafeEqual } from "node:crypto";

function configuration() {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(site.hostname);
  if (!secret?.trim() || site.username || site.password || site.search || site.hash
    || site.pathname !== "/" || (site.protocol !== "https:" && !(local && site.protocol === "http:"))) {
    throw new Error("Invalid unsubscribe site URL or missing signing secret.");
  }
  const productionSite = site.origin === "https://blankseoul.com";
  if (process.env.VERCEL_ENV === "preview" && productionSite) {
    throw new Error("Preview email links must use the Preview storefront URL.");
  }
  const shop = (process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "").trim().toLowerCase();
  const database = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!shop || !database) throw new Error("Missing unsubscribe environment identity.");
  return { secret, site: site.origin, shop, database,
    // Existing production emails remain usable; legacy tokens are never accepted in Preview/local.
    legacy: productionSite && process.env.VERCEL_ENV !== "preview"
      && process.env.UNSUBSCRIBE_ACCEPT_LEGACY !== "false" };
}

/** HMAC 토큰 생성 */
function generateToken(email: string, artistSlug?: string): string {
  const config = configuration();
  const payload = JSON.stringify(["v2", config.site, config.shop, config.database,
    email.toLowerCase().trim(), artistSlug?.toLowerCase().trim() || ""]);
  return "v2." + createHmac("sha256", config.secret).update(payload).digest("hex");
}

/** Unsubscribe URL 생성 (이메일 템플릿 웹 링크에서 사용) */
export function generateUnsubscribeUrl(email: string, artistSlug?: string): string {
  const token = generateToken(email, artistSlug);
  const encodedEmail = encodeURIComponent(email.toLowerCase().trim());
  const artistParam = artistSlug
    ? `&artist=${encodeURIComponent(artistSlug.toLowerCase().trim())}`
    : "";
  return `${configuration().site}/unsubscribe?email=${encodedEmail}&token=${token}${artistParam}`;
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
  return `${configuration().site}/api/unsubscribe?email=${encodedEmail}&token=${token}${artistParam}`;
}

/** HMAC 토큰 검증 (API에서 사용) */
export function verifyUnsubscribeToken(
  email: string,
  token: string,
  artistSlug?: string
): boolean {
  const config = configuration();
  let expected: string;
  if (/^v2\.[a-f0-9]{64}$/.test(token)) {
    expected = generateToken(email, artistSlug);
  } else if (config.legacy && /^[a-f0-9]{64}$/.test(token)) {
    const payload = artistSlug
      ? `${email.toLowerCase().trim()}:${artistSlug.toLowerCase().trim()}`
      : email.toLowerCase().trim();
    expected = createHmac("sha256", config.secret).update(payload).digest("hex");
  } else { return false; }
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
