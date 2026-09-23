import assert from "node:assert/strict";
import test from "node:test";

import { verifyOrderLookupEmail } from "../../lib/security/orderOwnership.ts";

test("order lookup requires a verified session email", () => {
  assert.deepEqual(verifyOrderLookupEmail(null, "buyer@example.com"), {
    ok: false,
    status: 401,
    error: "Sign in with your verified email to track orders.",
  });
  assert.equal(verifyOrderLookupEmail({ email: "buyer@example.com" }, "buyer@example.com").ok, false);
});

test("order lookup rejects a different submitted email", () => {
  const result = verifyOrderLookupEmail(
    { email: "buyer@example.com", email_confirmed_at: "2026-09-23T00:00:00Z" },
    "victim@example.com",
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 403);
});

test("order lookup normalizes and accepts the verified email", () => {
  assert.deepEqual(
    verifyOrderLookupEmail(
      { email: "Buyer@Example.com", email_confirmed_at: "2026-09-23T00:00:00Z" },
      " buyer@example.com ",
    ),
    { ok: true, email: "buyer@example.com" },
  );
});
