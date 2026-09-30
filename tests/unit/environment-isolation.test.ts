import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import ts from "typescript";
import { configuredPreviewOrigin, isTrustedPreviewMessage } from "../../lib/security/preview-origin.ts";
import { generateUnsubscribeUrl, generateOneClickUnsubscribeApiUrl, verifyUnsubscribeToken } from "../../lib/unsubscribe.ts";

test("unsubscribe links reject other environments, recipients and tampering", t => {
  const keys = ["UNSUBSCRIBE_SECRET", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN",
    "NEXT_PUBLIC_SUPABASE_URL", "VERCEL_ENV", "UNSUBSCRIBE_ACCEPT_LEGACY"];
  const saved = keys.map(key => process.env[key]);
  t.after(() => keys.forEach((key, i) => { if (saved[i] === undefined) delete process.env[key]; else process.env[key] = saved[i]; }));
  Object.assign(process.env, { UNSUBSCRIBE_SECRET: "fixture-secret", NEXT_PUBLIC_SITE_URL: "https://preview.example.com",
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "dev.myshopify.com", NEXT_PUBLIC_SUPABASE_URL: "https://dev.supabase.co", VERCEL_ENV: "preview" });
  delete process.env.UNSUBSCRIBE_ACCEPT_LEGACY;
  const link = new URL(generateUnsubscribeUrl("Buyer@Example.com", " Artist "));
  const token = link.searchParams.get("token")!;
  assert.equal(link.origin, "https://preview.example.com");
  assert.ok(verifyUnsubscribeToken("buyer@example.com", token, "artist"));
  assert.equal(new URL(generateOneClickUnsubscribeApiUrl("buyer@example.com", "artist")).searchParams.get("token"), token);
  assert.equal(verifyUnsubscribeToken("other@example.com", token, "artist"), false);
  assert.equal(verifyUnsubscribeToken("buyer@example.com", token, "other"), false);
  for (const invalid of ["", "v2.bad", token + "a", token.replace(/.$/, token.endsWith("a") ? "b" : "a")]) {
    assert.equal(verifyUnsubscribeToken("buyer@example.com", invalid, "artist"), false);
  }
  for (const [key, value] of [["NEXT_PUBLIC_SITE_URL", "https://other.example.com"],
    ["NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN", "prod.myshopify.com"], ["NEXT_PUBLIC_SUPABASE_URL", "https://prod.supabase.co"],
    ["UNSUBSCRIBE_SECRET", "another-secret"]]) {
    const before = process.env[key]; process.env[key] = value;
    assert.equal(verifyUnsubscribeToken("buyer@example.com", token, "artist"), false, key);
    process.env[key] = before;
  }
  const legacy = crypto.createHmac("sha256", "fixture-secret").update("buyer@example.com:artist").digest("hex");
  assert.equal(verifyUnsubscribeToken("buyer@example.com", legacy, "artist"), false);
  process.env.NEXT_PUBLIC_SITE_URL = "https://blankseoul.com";
  assert.throws(() => generateUnsubscribeUrl("buyer@example.com"));
  process.env.VERCEL_ENV = "production";
  assert.equal(verifyUnsubscribeToken("buyer@example.com", token, "artist"), false);
  assert.equal(verifyUnsubscribeToken("buyer@example.com", legacy, "artist"), true);
  process.env.UNSUBSCRIBE_ACCEPT_LEGACY = "false";
  assert.equal(verifyUnsubscribeToken("buyer@example.com", legacy, "artist"), false);
  for (const value of ["", "http://example.com", "https://user:pass@example.com", "https://example.com/path", "https://example.com/?x=1"]) {
    process.env.NEXT_PUBLIC_SITE_URL = value;
    assert.throws(() => generateUnsubscribeUrl("buyer@example.com"));
  }
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3001";
  assert.equal(new URL(generateUnsubscribeUrl("buyer@example.com")).origin, "http://localhost:3001");
  delete process.env.UNSUBSCRIBE_SECRET;
  assert.throws(() => generateUnsubscribeUrl("buyer@example.com"));
});

test("preview accepts only its configured origin and the actual embedding window", () => {
  const origin = configuredPreviewOrigin("https://admin-preview.example.com/");
  const parent = {} as Window, other = {} as Window;
  assert.ok(isTrustedPreviewMessage({ origin: origin!, source: parent }, origin, parent, null));
  assert.ok(isTrustedPreviewMessage({ origin: origin!, source: parent }, origin, null, parent));
  assert.equal(isTrustedPreviewMessage({ origin: origin!, source: other }, origin, parent, null), false);
  assert.equal(isTrustedPreviewMessage({ origin: origin!, source: null }, origin, parent, null), false);
  for (const bad of ["", "null", "https://admin-preview.example.com.evil.test", "https://other.vercel.app", "https://localhost.evil.test"]) {
    assert.equal(isTrustedPreviewMessage({ origin: bad, source: parent }, origin, parent, null), false);
  }
  for (const bad of [undefined, "", "https://user@example.com", "https://admin.example.com/path", "http://admin.example.com", "https://admin.example.com?x=1"]) {
    assert.equal(configuredPreviewOrigin(bad), null);
  }
  assert.equal(configuredPreviewOrigin("http://localhost:3003"), "http://localhost:3003");
  assert.equal(isTrustedPreviewMessage({ origin: origin!, source: parent }, null, parent, null), false);
});

type Row = { id: string; access_token: string; expires_at: string };
const source = ts.transpileModule(fs.readFileSync("lib/shopify/admin.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function client(rows: Map<string, Row>, shop = "dev.myshopify.com", app = "fixture-app", secret = "fixture-secret", brokenDb = false, invalidResponse = false) {
  const calls: string[] = [];
  const mod = { exports: {} as { getAdminToken(): Promise<string> } };
  const supabaseAdmin = { from: () => ({
    select: () => ({ eq: (_field: string, id: string) => ({ single: async () => {
      if (brokenDb) throw new Error("offline");
      return { data: rows.get(id) };
    } }) }),
    upsert: async (row: Row) => { if (brokenDb) throw new Error("offline"); rows.set(row.id, row); return { error: null }; },
  }) };
  const context = vm.createContext({ module: mod, exports: mod.exports, console: { warn() {}, error() {} }, URLSearchParams,
    process: { env: { NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: shop, SHOPIFY_CLIENT_ID: app, SHOPIFY_CLIENT_SECRET: secret } },
    fetch: async (url: string, options: RequestInit) => {
      assert.equal(options.redirect, "error"); calls.push(url);
      return Response.json(invalidResponse ? { access_token: "" } : { access_token: `token-${shop}-${app}-${secret}`, expires_in: 86400 });
    },
    require: (name: string) => {
      if (name === "node:crypto") return crypto;
      if (name === "@/lib/supabase/admin") return { supabaseAdmin };
      if (name === "@/lib/errors") return { errorMessage: () => "error" };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  vm.runInContext(source, context);
  return { api: mod.exports, calls };
}

test("Shopify cache isolates stores/apps/rotations sharing a DB and ignores legacy tokens", async () => {
  const rows = new Map<string, Row>([["admin_token", { id: "admin_token", access_token: "legacy", expires_at: "2999-01-01" }]]);
  const dev = client(rows), prod = client(rows, "prod.myshopify.com");
  const d = await dev.api.getAdminToken(), p = await prod.api.getAdminToken();
  assert.notEqual(d, p); assert.notEqual(d, "legacy");
  assert.equal(await dev.api.getAdminToken(), d); assert.equal(dev.calls.length, 1);
  const restarted = client(rows); assert.equal(await restarted.api.getAdminToken(), d); assert.equal(restarted.calls.length, 0);
  const app = client(rows, "dev.myshopify.com", "another-app"); assert.notEqual(await app.api.getAdminToken(), d);
  const rotated = client(rows, "dev.myshopify.com", "fixture-app", "rotated"); assert.notEqual(await rotated.api.getAdminToken(), d);
  assert.equal(rows.size, 5);
  for (const id of rows.keys()) assert.ok(!id.includes("fixture-secret"));
  for (const row of rows.values()) row.expires_at = "2000-01-01";
  const expired = client(rows); await expired.api.getAdminToken(); assert.equal(expired.calls.length, 1);
});

test("Shopify validates configuration/response and tolerates unavailable cache storage", async () => {
  const rows = new Map<string, Row>();
  for (const shop of ["", "evil.example", "dev.myshopify.com.evil.test", "https://user@dev.myshopify.com"]) {
    const x = client(rows, shop); await assert.rejects(x.api.getAdminToken()); assert.equal(x.calls.length, 0);
  }
  const missing = client(rows, "dev.myshopify.com", "", ""); await assert.rejects(missing.api.getAdminToken());
  const broken = client(rows, undefined, undefined, undefined, true);
  const token = await broken.api.getAdminToken(); assert.equal(await broken.api.getAdminToken(), token); assert.equal(broken.calls.length, 1);
  const invalid = client(rows, undefined, undefined, undefined, false, true);
  await assert.rejects(invalid.api.getAdminToken()); assert.equal(rows.size, 0);
});
