import { NextRequest, NextResponse } from 'next/server';

/** One explicitly configured backend. Never replay a write against another environment. */
export async function proxyInquiryRequest(req: NextRequest, subpath = '') {
  const configured = process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL;
  if (!configured) return NextResponse.json({ error: 'Concierge is temporarily unavailable.' }, { status: 503 });
  const base = new URL(configured);
  if (process.env.NODE_ENV === 'production' && base.protocol !== 'https:') {
    return NextResponse.json({ error: 'Invalid concierge configuration.' }, { status: 503 });
  }
  if (subpath && !/^inq_[a-f0-9]{32}(?:\/messages)?$/.test(subpath)) {
    return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  }
  const target = new URL(`/api/inquiries${subpath ? `/${subpath}` : ''}`, base);
  target.search = req.nextUrl.search;
  try {
    const headers = new Headers();
    const contentType = req.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    const response = await fetch(target, {
      method: req.method, headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
      signal: AbortSignal.timeout(15000), cache: 'no-store', redirect: 'error',
    });
    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Concierge could not be reached. Please check the conversation before resending.' }, { status: 503 });
  }
}
