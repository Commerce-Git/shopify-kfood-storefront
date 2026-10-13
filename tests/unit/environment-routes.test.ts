import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file: string, env: Record<string, string>, extras: Record<string, unknown> = {}, dependencies: Record<string, unknown> = {}) {
  const mod = { exports: {} as Record<string, (request: Request, id?: string) => Promise<Response>> };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { module: mod, exports: mod.exports, process: { env }, URL, Headers, AbortSignal,
    console: { log() {}, error() {} }, ...extras,
    require: (name: string) => {
      if (name === 'next/server') return { NextResponse: Response };
      if (name === '@/lib/errors') return { errorMessage: () => 'error' };
      if (name === '@/lib/shopify/cache' || name === './cache.ts') return { SHOPIFY_CATALOG_CACHE_TAG: 'shopify-catalog' };
      if (name === '@/lib/shopify/storefront') return load('lib/shopify/storefront.ts', env, extras, dependencies);
      if (name === '@/lib/shopify/queries') return { GET_PRODUCT_BY_HANDLE: 'query ProductPrice($handle: String!) { product(handle: $handle) { variants(first: 10) { edges { node { id price { amount currencyCode } } } } } }' };
      if (name in dependencies) return dependencies[name];
      throw new Error(name);
    },
  });
  return mod.exports;
}
function request(url: string, body?: unknown) {
  return Object.assign(new Request(url, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), { nextUrl: new URL(url) });
}

test('revalidation accepts artist JSON and rejects invalid credentials before any invalidation', async () => {
  const paths: string[] = [];
  const tags: Array<{ tag: string; expire: number }> = [];
  const api = load('app/api/revalidate/route.ts', { REVALIDATE_SECRET: 'fixture-secret' }, {}, {
    'next/cache': {
      revalidatePath: (path: string, type?: string) => paths.push(`${path}:${type}`),
      revalidateTag: (tag: string, profile: { expire: number }) => tags.push({ tag, expire: profile.expire }),
    },
  });
  const res = await api.POST(request('https://front.invalid/api/revalidate', {
    secret: 'fixture-secret', handle: null, collections: [], artists: true,
  }));
  assert.equal(res.status, 200);
  assert.ok(paths.includes('/artists:undefined'));
  assert.ok(paths.includes('/artists/[slug]:page'));
  assert.deepEqual(tags, [{ tag: 'shopify-catalog', expire: 0 }]);
  paths.length = 0;
  tags.length = 0;
  assert.equal((await api.POST(request('https://front.invalid/api/revalidate', { secret: 'wrong', artists: true }))).status, 401);
  assert.equal(paths.length, 0);
  assert.equal(tags.length, 0);
  assert.equal((await api.POST(Object.assign(new Request('https://front.invalid/api/revalidate?secret=fixture-secret&path=/artists', { method: 'POST' }), { nextUrl: new URL('https://front.invalid/api/revalidate?secret=fixture-secret&path=/artists') }))).status, 400);
  assert.equal(paths.length, 0);
  assert.equal(tags.length, 0);
  assert.equal((await api.POST(request('https://front.invalid/api/revalidate', { secret: 'fixture-secret', handle: 'item', collections: ['craft'] }))).status, 200);
  assert.ok(paths.includes('/product/item:undefined'));
  assert.ok(paths.includes('/collections/craft:undefined'));
  assert.ok(paths.includes('/collections:undefined'));
  assert.ok(paths.includes('/:undefined'));
});

test('price changes expire caches only after the uncached Storefront price matches', async () => {
  const paths: string[] = [], tags: string[] = [], calls: RequestInit[] = [];
  let amount = '34.0';
  const api = load('app/api/revalidate/route.ts', { REVALIDATE_SECRET: 'fixture-secret',
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: 'dev-shop.myshopify.com', NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: 'storefront-token',
  }, { fetch: async (_url: string, init: RequestInit) => {
    calls.push(init); return Response.json({ data: { product: { variants: { edges: [{ node: {
      id: 'gid://shopify/ProductVariant/1', price: { amount, currencyCode: 'USD' },
    } }] } } } });
  } }, { 'next/cache': {
    revalidatePath: (path: string) => paths.push(path),
    revalidateTag: (tag: string) => tags.push(tag),
  } });
  const body = { secret: 'fixture-secret', handle: 'item', expectedPrice: {
    variantId: 'gid://shopify/ProductVariant/1', amountUsd: 153,
  } };
  assert.equal((await api.POST(request('https://front.invalid/api/revalidate', { ...body, secret: 'wrong' }))).status, 401);
  assert.equal(calls.length, 0);
  const pending = await api.POST(request('https://front.invalid/api/revalidate', body));
  assert.equal(pending.status, 409);
  assert.equal((await pending.json()).code, 'SHOPIFY_PRICE_PENDING');
  assert.equal(paths.length, 0); assert.equal(tags.length, 0);
  assert.equal(calls[0].cache, 'no-store');
  assert.deepEqual(JSON.parse(String(calls[0].body)).variables, { handle: 'item' });
  assert.ok(calls[0].signal instanceof AbortSignal);
  amount = '153.0';
  const ready = await api.POST(request('https://front.invalid/api/revalidate', body));
  assert.equal(ready.status, 200); assert.equal((await ready.json()).priceConfirmed, true);
  assert.deepEqual(tags, ['shopify-catalog']);
  assert.ok(paths.includes('/product/item'));
  calls.length = 0;
  assert.equal((await api.POST(request('https://front.invalid/api/revalidate', {
    ...body, expectedPrice: { variantId: 'invalid', amountUsd: 153 },
  }))).status, 400);
  assert.equal(calls.length, 0);
});

test('page and price confirmation use identical upstream requests with separate cache policies', async () => {
  const calls: Array<{ url: string; init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } }> = [];
  const client = load('lib/shopify/storefront.ts', {
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: 'dev-shop.myshopify.com', NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: 'fixture-token',
  }, { fetch: async (url: string, init: RequestInit) => {
    calls.push({ url, init }); return Response.json({ data: { product: { id: 'fixture' } } });
  } }) as unknown as { storefrontFetch: (query: string, variables: Record<string, unknown>, options?: { cache: 'no-store'; signal: AbortSignal }) => Promise<unknown> };
  const signal = AbortSignal.timeout(4000);
  await client.storefrontFetch('query Product', { handle: 'item' });
  await client.storefrontFetch('query Product', { handle: 'item' }, { cache: 'no-store', signal });
  assert.equal(calls[0].url, 'https://dev-shop.myshopify.com/api/2025-10/graphql.json');
  assert.equal(calls[0].url, calls[1].url);
  assert.equal(calls[0].init.body, calls[1].init.body);
  assert.deepEqual({ ...calls[0].init.headers }, { ...calls[1].init.headers });
  assert.equal(calls[0].init.next?.revalidate, 60);
  assert.ok(calls[0].init.next?.tags?.includes('shopify-catalog'));
  assert.equal(calls[1].init.cache, 'no-store');
  assert.equal(calls[1].init.next, undefined);
  assert.equal(calls[1].init.signal, signal);
});

test('inquiry proxy uses only the canonical backend and forwards a write once without retry', async () => {
  const calls: string[] = [];
  const api = load('app/api/inquiries/proxyHelper.ts', { NODE_ENV: 'production',
    NEXT_PUBLIC_ADMIN_API_URL: 'https://preview-admin.invalid', ADMIN_API_URL: 'https://production-admin.invalid',
  }, { fetch: async (url: URL, init: RequestInit) => {
    calls.push(url.href);
    assert.equal(init.redirect, 'error');
    assert.equal(new TextDecoder().decode(init.body as ArrayBuffer), '{"message":"fixture"}');
    return new Response('upstream unavailable', { status: 503 });
  } });
  const res = await api.proxyInquiryRequest(request('https://front.invalid/api/inquiries', { message: 'fixture' }));
  assert.equal(res.status, 503);
  assert.deepEqual(calls, ['https://preview-admin.invalid/api/inquiries']);
});

test('invalid backend settings return 503 without forwarding credentials or contacting any server', async () => {
  for (const url of ['', 'bad url', 'ftp://admin.invalid', 'https://user:secret@admin.invalid',
    'https://admin.invalid/path', 'https://admin.invalid?token=secret', 'http://admin.invalid']) {
    const api = load('app/api/inquiries/proxyHelper.ts', { NODE_ENV: 'production', NEXT_PUBLIC_ADMIN_API_URL: url },
      { fetch: () => { throw new Error('must not fetch'); } });
    assert.equal((await api.proxyInquiryRequest(request('https://front.invalid/api/inquiries'))).status, 503, url);
  }
});

test('protected inquiry proxy uses its server credential and excludes frontend credentials', async () => {
  const api = load('app/api/inquiries/proxyHelper.ts', {
    NODE_ENV: 'production', NEXT_PUBLIC_ADMIN_API_URL: 'https://preview-admin.invalid',
    ADMIN_API_PROTECTION_BYPASS: 'backend-fixture-secret',
  }, { fetch: async (url: URL, init: RequestInit) => {
    assert.equal(url.href, 'https://preview-admin.invalid/api/inquiries/inq_' + 'a'.repeat(32) + '?summary=1&known=12&before=cursor');
    const headers = new Headers(init.headers);
    assert.equal(headers.get('x-vercel-protection-bypass'), 'backend-fixture-secret');
    assert.equal(headers.get('cookie'), null);
    assert.equal(headers.get('authorization'), null);
    assert.equal(headers.get('x-vercel-set-bypass-cookie'), null);
    assert.equal(init.redirect, 'error');
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } });
  const url = 'https://front.invalid/api/inquiries/inq_' + 'a'.repeat(32) + '?summary=1&known=12&before=cursor&x-vercel-protection-bypass=frontend-secret&x-vercel-set-bypass-cookie=true';
  const req = Object.assign(new Request(url, { headers: {
    cookie: 'guest=private', authorization: 'Bearer private',
    'x-vercel-protection-bypass': 'client-secret',
  } }), { nextUrl: new URL(url) });
  const res = await api.proxyInquiryRequest(req, 'inq_' + 'a'.repeat(32));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.ok(!(await res.text()).includes('secret'));
});

test('inquiry proxy does not send a bypass credential to HTTP localhost', async () => {
  const api = load('app/api/inquiries/proxyHelper.ts', {
    NODE_ENV: 'development', NEXT_PUBLIC_ADMIN_API_URL: 'http://localhost:3003',
    ADMIN_API_PROTECTION_BYPASS: 'backend-fixture-secret',
  }, { fetch: async (_url: URL, init: RequestInit) => {
    assert.equal(new Headers(init.headers).get('x-vercel-protection-bypass'), null);
    return new Response('{}');
  } });
  assert.equal((await api.proxyInquiryRequest(request('http://localhost:3001/api/inquiries'))).status, 200);
});
