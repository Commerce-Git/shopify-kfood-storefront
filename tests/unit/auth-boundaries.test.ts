import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as ownership from '../../lib/security/orderOwnership.ts';

// Actual handlers with explicit dependencies; no SDK, credentials or network escapes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Heterogeneous route exports in the VM harness.
function load(file: string, deps: Record<string, unknown>): any {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    module: mod, exports: mod.exports, URL, Response, Request,
    console: { error() {}, log() {} }, process: { env: {} },
    fetch() { throw Error('External requests forbidden'); },
    require(name: string) {
      if (name === 'next/server') return { NextResponse: Response };
      if (name === '@/lib/security/orderOwnership') return ownership;
      assert.ok(name in deps, `Unmocked dependency: ${name}`);
      return deps[name];
    },
  });
  return mod.exports;
}
const buyer = { id: 'buyer-a', email: 'Buyer@Example.invalid', email_confirmed_at: '2026-01-01T00:00:00Z' };
const post = (body: unknown) => new Request('https://front.invalid/api/test', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});

function fixture(user: typeof buyer | null, orderEmail = 'buyer@example.invalid', authError: unknown = null) {
  const calls: string[] = [];
  const deps: Record<string, unknown> = {
    '@/lib/supabase/server': { createClient: async () => ({ auth: {
      getUser: async () => ({ data: { user }, error: authError }),
    } }) },
    '@/lib/shopify/admin': {
      getOrdersByEmail: async (email: string) => {
        calls.push(`orders:${email}`);
        return [{ id: 'gid://shopify/Order/1', lineItems: { edges: [] }, processedAt: '2026-01-01', totalPrice: { amount: '33' } }];
      },
      checkIsSubscribed: async () => { calls.push('subscription'); return false; },
      adminGraphQL: async (query: string) => {
        if (query.includes('GetOrderProcessedAt')) {
          calls.push('ownership-read');
          return { data: { order: { email: orderEmail, name: '#A', processedAt: new Date().toISOString() } } };
        }
        assert.match(query, /GetOrderDiscounts/);
        calls.push('discount-read'); return { data: { order: { discountCodes: [] } } };
      },
      cancelOrder: async () => { calls.push('cancel-refund'); return { success: true, refundAmount: '33' }; },
    },
    '@/lib/orders/enrichment': { getOrderProgress: async () => {
      calls.push('progress'); return { viewStatusMap: {}, artistOrdersMap: {}, artistStatusByOrderAndVendor: {} };
    } },
    '@/lib/orders/status': { aggregateWmsStatus: () => 'placed' },
    '@/lib/shopify/order-utils': { splitOrderIntoVendorPackages: () => [] },
    '@/lib/shopify/storefront': { storefrontFetch: () => { throw Error('No variants in fixture'); } },
    '@/lib/constants': { CANCEL_WINDOW_HOURS: 3, isCancelable: () => true },
    '@/lib/coupon-config': { COUPON_CONFIG: { codePrefix: 'REVIEW-' }, generateCouponCode: () => { calls.push('coupon'); return 'fixture'; } },
    '@/lib/unsubscribe': { generateUnsubscribeUrl: () => 'https://front.invalid/unsubscribe' },
    '@/emails': {
      sendOrderCancellationEmail: async () => { calls.push('email'); },
      sendCouponConfirmationEmail: async () => { calls.push('coupon-email'); },
    },
    '@/lib/supabase/admin': { supabaseAdmin: { from: (table: string) => {
      assert.equal(table, 'storefront_cancel_requests');
      calls.push('cancel-db');
      const chain = {
        select: () => chain, eq: () => chain, in: () => chain,
        maybeSingle: async () => ({ data: null, error: null }),
        insert: () => { calls.push('insert'); return chain; },
        update: () => { calls.push('update'); return chain; },
        single: async () => ({ data: { id: 'request-a' }, error: null }),
      };
      return chain;
    } } },
  };
  return { calls, deps };
}

test('order handlers reject missing, unconfirmed and rejected sessions before business calls', async () => {
  for (const [user, error] of [
    [null, null], [{ ...buyer, email_confirmed_at: '' }, null],
    [null, { message: 'expired token' }], [null, { message: 'invalid signature' }],
    [buyer, { message: 'authentication failed' }],
  ] as const) {
    for (const route of ['orders', 'track-order', 'cancel-order']) {
      const { deps, calls } = fixture(user, undefined, error);
      const handler = load(`app/api/${route}/route.ts`, deps);
      const response = route === 'orders' ? await handler.GET() : await handler.POST(post({
        email: buyer.email, shopify_order_id: 'gid://shopify/Order/1',
      }));
      assert.equal(response.status, 401, `${route}: ${JSON.stringify(error)}`);
      assert.deepEqual(calls, []);
    }
  }
});

test('own orders use server email; another submitted email never reaches Shopify', async () => {
  const { deps, calls } = fixture(buyer);
  const own = await load('app/api/orders/route.ts', deps).GET();
  assert.equal(own.status, 200);
  assert.equal((await own.json()).orders[0].id, 'gid://shopify/Order/1');
  assert.match(own.headers.get('cache-control') || '', /private, no-store/);
  assert.equal(calls[0], 'orders:buyer@example.invalid'); calls.length = 0;
  const track = load('app/api/track-order/route.ts', deps);
  assert.equal((await track.POST(post({ email: 'other@example.invalid' }))).status, 403);
  assert.deepEqual(calls, []);
  assert.equal((await track.POST(post({ email: ' buyer@example.invalid ' }))).status, 200);
  assert.equal(calls[0], 'orders:buyer@example.invalid');
});

test('another order cannot trigger cancellation, DB writes, coupons or emails', async () => {
  const { deps, calls } = fixture(buyer, 'other@example.invalid');
  const response = await load('app/api/cancel-order/route.ts', deps).POST(post({ shopify_order_id: 'gid://shopify/Order/2' }));
  assert.equal(response.status, 404);
  assert.equal(JSON.stringify(await response.json()).includes('other@example.invalid'), false);
  assert.deepEqual(calls, ['ownership-read']);
});

test('own eligible cancellation still reaches only isolated mutation adapters', async () => {
  const { deps, calls } = fixture(buyer);
  const response = await load('app/api/cancel-order/route.ts', deps).POST(post({ shopify_order_id: 'gid://shopify/Order/1' }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  for (const action of ['insert', 'cancel-refund', 'update', 'email']) assert.equal(calls.filter(c => c === action).length, 1);
  assert.equal(calls.includes('coupon'), false);
});

test('confirmation timestamp alone cannot distinguish automatic confirmation from mailbox proof', () => {
  // This passing test records the limitation, NOT successful mailbox verification.
  assert.equal(ownership.verifyOrderLookupEmail(buyer, buyer.email).ok, true);
  assert.equal(ownership.verifyOrderLookupEmail({ ...buyer, email: ' ' }, ' ').ok, false);
});

test('OAuth callback permits local destinations and rejects external or malformed next values', async () => {
  let exchangeCalls = 0;
  const api = load('app/auth/callback/route.ts', {
    '@/lib/supabase/server': { createClient: async () => ({
      auth: { exchangeCodeForSession: async () => { exchangeCalls++; return { data: { user: buyer }, error: null }; } },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { id: buyer.id } }) }) }) }),
    }) },
  });
  for (const next of ['https://evil.invalid', '@evil.invalid', '//evil.invalid', '/\\evil.invalid', '\n@evil.invalid']) {
    const response = await api.GET(new Request(`https://front.invalid/auth/callback?code=fixture&next=${encodeURIComponent(next)}`));
    assert.equal(response.headers.get('location'), 'https://front.invalid/account', next);
  }
  const good = await api.GET(new Request('https://front.invalid/auth/callback?code=fixture&next=%2Faccount%3Ftab%3Dorders'));
  assert.equal(good.headers.get('location'), 'https://front.invalid/account?tab=orders');
  const before = exchangeCalls;
  const missing = await api.GET(new Request('https://front.invalid/auth/callback'));
  assert.equal(missing.headers.get('location'), 'https://front.invalid/account/login?error=auth_failed');
  assert.equal(exchangeCalls, before);
});
