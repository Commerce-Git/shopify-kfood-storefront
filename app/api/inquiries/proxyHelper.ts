import { NextRequest, NextResponse } from 'next/server';

/** One explicitly configured backend. Never replay a write against another environment. */
export async function proxyInquiryRequest(req: NextRequest, subpath = '') {
  const configured = process.env.NEXT_PUBLIC_ADMIN_API_URL;
  if (!configured) return NextResponse.json({ error: 'Concierge is temporarily unavailable.' }, { status: 503 });
  let base: URL;
  try {
    base = new URL(configured);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
    if (base.username || base.password || base.pathname !== '/' || base.search || base.hash ||
      (base.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && local && base.protocol === 'http:'))) {
      throw new Error('Invalid backend origin');
    }
  } catch {
    return NextResponse.json({ error: 'Invalid concierge configuration.' }, { status: 503 });
  }
  if (subpath && !/^inq_[a-f0-9]{32}(?:\/(?:messages|realtime))?$/.test(subpath)) {
    return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  }
  const target = new URL(`/api/inquiries${subpath ? `/${subpath}` : ''}`, base);
  // Only inquiry parameters belong upstream, never frontend protection keys.
  for (const key of ['summary', 'known', 'before']) {
    const value = req.nextUrl.searchParams.get(key);
    if (value !== null) target.searchParams.set(key, value);
  }
  try {
    const headers = new Headers();
    const contentType = req.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    // Server-only credential for an independently protected Admin Preview.
    // Customer cookies and authorization headers remain local.
    const bypass = process.env.ADMIN_API_PROTECTION_BYPASS?.trim();
    if (bypass && base.protocol === 'https:') headers.set('x-vercel-protection-bypass', bypass);
    const response = await fetch(target, {
      method: req.method, headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
      signal: AbortSignal.any([req.signal, AbortSignal.timeout(15000)]), cache: 'no-store', redirect: 'error',
    });
    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Concierge could not be reached. Please check the conversation before resending.' }, { status: 503 });
  }
}
