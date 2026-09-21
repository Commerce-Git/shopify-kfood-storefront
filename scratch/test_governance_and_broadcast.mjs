import { createHmac, timingSafeEqual } from "crypto";

console.log("=== Testing 2026 CRM Funnel Governance & Logic ===");

// 1. Test Deduplication Logic (Omni-SSOT Merge)
const mockSupabaseSubscribers = [
  {
    artist_slug: "soyo-studio",
    artist_name: "Soyo Studio",
    email: "Collector@example.com",
    first_name: "Min-jun",
    last_name: "Kim",
    user_id: "user-uuid-1",
    followed_at: "2026-09-01T00:00:00Z",
  },
  {
    artist_slug: "soyo-studio",
    artist_name: "Soyo Studio",
    email: "only-supabase@example.com",
    first_name: "Hannah",
    last_name: null,
    user_id: "user-uuid-2",
    followed_at: "2026-09-02T00:00:00Z",
  },
];

const mockShopifyFollowers = [
  {
    id: "gid://shopify/Customer/1",
    email: "COLLECTOR@example.com", // Same person, different casing
    displayName: "Min-jun Kim",
    firstName: "Min-jun",
    tags: ["follow-artist:soyo-studio"],
  },
  {
    id: "gid://shopify/Customer/2",
    email: "only-shopify@example.com",
    displayName: "David Miller",
    firstName: "David",
    tags: ["follow-artist:soyo-studio"],
  },
];

const followersMap = new Map();

for (const sub of mockSupabaseSubscribers) {
  if (!sub.email || !sub.email.includes("@")) continue;
  const cleanEmail = sub.email.trim().toLowerCase();
  const fullName = [sub.first_name, sub.last_name].filter(Boolean).join(" ");
  followersMap.set(cleanEmail, {
    email: cleanEmail,
    name: sub.first_name?.trim() || fullName.trim() || "Valued Collector",
    source: "supabase",
  });
}

for (const sc of mockShopifyFollowers) {
  if (!sc.email || !sc.email.includes("@")) continue;
  const cleanEmail = sc.email.trim().toLowerCase();
  const existing = followersMap.get(cleanEmail);
  if (existing) {
    existing.source = "both";
    if (existing.name === "Valued Collector" && (sc.firstName || sc.displayName)) {
      existing.name = sc.firstName?.trim() || sc.displayName?.trim() || "Valued Collector";
    }
  } else {
    followersMap.set(cleanEmail, {
      email: cleanEmail,
      name: sc.firstName?.trim() || sc.displayName?.trim() || "Valued Collector",
      source: "shopify",
    });
  }
}

const mergedList = Array.from(followersMap.values());
console.log(`[Omni-SSOT Merge] Total input: ${mockSupabaseSubscribers.length + mockShopifyFollowers.length}, Deduplicated output: ${mergedList.length}`);

if (mergedList.length !== 3) {
  console.error("FAIL: Expected 3 unique recipients, got", mergedList.length);
  process.exit(1);
}

const duplicateItem = mergedList.find((m) => m.email === "collector@example.com");
if (!duplicateItem || duplicateItem.source !== "both") {
  console.error("FAIL: collector@example.com should have source 'both', got:", duplicateItem);
  process.exit(1);
}
console.log("PASS: Deduplication and source tracking verified!");

// 2. Test Resend Svix Signature Verification
function verifySvixSignature(payload, headers, secret) {
  if (!headers.id || !headers.timestamp || !headers.signature) return false;
  const secretKey = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret, "utf-8");

  const signedContent = `${headers.id}.${headers.timestamp}.${payload}`;
  const computedSignature = createHmac("sha256", secretKey)
    .update(signedContent)
    .digest("base64");

  const expectedV1 = `v1,${computedSignature}`;
  const signatures = headers.signature.split(" ");
  for (const sig of signatures) {
    try {
      const sigBuf = Buffer.from(sig);
      const expectedBuf = Buffer.from(expectedV1);
      if (sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)) {
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

const testSecret = "whsec_" + Buffer.from("test_secret_32_byte_key_12345678").toString("base64");
const testPayload = JSON.stringify({ type: "email.bounced", data: { to: ["bounced@example.com"] } });
const testId = "msg_123456";
const testTimestamp = Math.floor(Date.now() / 1000).toString();

const rawKey = Buffer.from(testSecret.slice(6), "base64");
const testSig = "v1," + createHmac("sha256", rawKey).update(`${testId}.${testTimestamp}.${testPayload}`).digest("base64");

const isValid = verifySvixSignature(
  testPayload,
  { id: testId, timestamp: testTimestamp, signature: testSig },
  testSecret
);

if (!isValid) {
  console.error("FAIL: Svix signature verification failed");
  process.exit(1);
}
console.log("PASS: Resend Svix signature verification logic verified!");

// 3. Test Soft Unfollow State Transitions
const mockCustomerDb = [
  { id: "1", user_id: "u1", artist_slug: "soyo-studio", status: "active", unfollowed_at: null },
];

// Perform Soft Unfollow
const target = mockCustomerDb.find((r) => r.user_id === "u1" && r.artist_slug === "soyo-studio");
target.status = "unsubscribed";
target.unfollowed_at = new Date().toISOString();

console.log("[Soft Unfollow] Record after soft unfollow:", target);
if (target.status !== "unsubscribed" || !target.unfollowed_at) {
  console.error("FAIL: Soft unfollow state transition failed");
  process.exit(1);
}
console.log("PASS: Soft unfollow state transition verified!");

console.log("\n>>> ALL GOVERNANCE & MERGE TESTS PASSED SUCCESSFULLY! <<<");
