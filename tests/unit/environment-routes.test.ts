import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file: string, env: Record<string, string>, extras: Record<string, unknown> = {}, dependencies: Record<string, unknown> = {}) {
  const mod = { exports: {} as Record<string, (...args: any[]) => Promise<Response>> };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { module: mod, exports: mod.exports, process: { env }, URL, Headers, AbortSignal,
    console: { log() {}, error() {} }, ...extras,
    require: (name: string) => {
      if (name === 'next/server') return { NextResponse: Response };
      if (name === '@/lib/errors') return { errorMessage: () => 'error' };
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
  const api = load('app/api/revalidate/route.ts', { REVALIDATE_SECRET: 'fixture-secret' }, {}, {
    'next/cache': { revalidatePath: (path: string, type: string) => paths.push(`${path}:${type}`) },
  });
  const res = await api.POST(request('https://front.invalid/api/revalidate', {
    secret: 'fixture-secret', handle: null, collections: [], artists: true,
  }));
  assert.equal(res.status, 200);
  assert.ok(paths.includes('/artists:page'));
  assert.ok(paths.includes('/artists/[slug]:page'));
  paths.length = 0;
  assert.equal((await api.POST(request('https://front.invalid/api/revalidate', { secret: 'wrong', artists: true }))).status, 401);
  assert.equal(paths.length, 0);
  assert.equal((await api.POST(Object.assign(new Request('https://front.invalid/api/revalidate?secret=fixture-secret&path=/artists', { method: 'POST' }), { nextUrl: new URL('https://front.invalid/api/revalidate?secret=fixture-secret&path=/artists') }))).status, 400);
  assert.equal(paths.length, 0);
  assert.equal((await api.POST(request('https://front.invalid/api/revalidate', { secret: 'fixture-secret', handle: 'item', collections: ['craft'] }))).status, 200);
  assert.ok(paths.includes('/product/item:page'));
  assert.ok(paths.includes('/collections/craft:page'));
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
