import { NextRequest, NextResponse } from 'next/server';

/**
 * 2026 Smart Multi-Port Auto-Failover Proxy for Blank Seoul Concierge
 * - 1차: .env.local 설정 포트 (예: http://localhost:3001)
 * - 2차: 테스트 포트 (http://localhost:3002)
 * - 3차: 운영 포트 (http://localhost:3001)
 * - 4차: 운영 배포 서버 (https://blank-seoul-admin.vercel.app)
 *
 * 개발자가 3001(운영서버)을 띄우든 3002(테스트서버)를 띄우든 무중단 자동 감지 연결!
 */
export async function proxyInquiryRequest(req: NextRequest, subpath = '') {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL?.trim();

  // 중복 없이 후보군 생성
  const candidateBases = [
    envUrl,
    'http://localhost:3001',
    'http://localhost:3002',
    'https://blank-seoul-admin.vercel.app',
  ].filter((url, idx, self): url is string => Boolean(url) && self.indexOf(url) === idx);

  const targetPath = `/api/inquiries${subpath ? `/${subpath}` : ''}`;
  const method = req.method;

  let bodyBuffer: ArrayBuffer | null = null;
  if (method !== 'GET' && method !== 'HEAD') {
    bodyBuffer = await req.arrayBuffer().catch(() => null);
  }

  let lastError: Error | null = null;

  const search = req.nextUrl.search || '';

  for (const base of candidateBases) {
    const cleanBase = base.replace(/\/$/, '');
    const targetUrl = `${cleanBase}${targetPath}${search}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const headers = new Headers();
      const contentType = req.headers.get('content-type');
      if (contentType) headers.set('content-type', contentType);

      const forwardedFor = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
      if (forwardedFor) headers.set('x-forwarded-for', forwardedFor);

      const response = await fetch(targetUrl, {
        method,
        headers,
        body: bodyBuffer,
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeout);

      const resBody = await response.arrayBuffer();
      const resHeaders = new Headers();
      const resContentType = response.headers.get('content-type');
      if (resContentType) resHeaders.set('content-type', resContentType);

      return new NextResponse(resBody, {
        status: response.status,
        headers: resHeaders,
      });
    } catch (err) {
      // 포트가 닫혀있거나 연결 거부(ECONNREFUSED) 시 다음 후보(3002/3001)로 자동 시도!
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  return NextResponse.json(
    {
      error: 'Concierge backend server is unreachable. Tried candidate ports (3001, 3002) and Vercel.',
      details: lastError?.message,
    },
    { status: 503 }
  );
}
