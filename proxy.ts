import { updateSession } from "@/lib/supabase/middleware";
import { activeCountries } from '@/lib/markets/registry';
import { marketCookie, preferenceOptions } from '@/lib/markets/selection';
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const marketLink = request.nextUrl.pathname.match(/^\/([a-z]{2})(\/product\/[^/]+\/?$)/);
  if (!marketLink) return updateSession(request);
  const country = marketLink[1].toUpperCase();
  if (!(await activeCountries()).includes(country)) return new NextResponse(null, { status: 404 });
  const destination = request.nextUrl.clone();
  destination.pathname = marketLink[2];
  request.cookies.set(marketCookie, country);
  const response = NextResponse.rewrite(destination, { request: { headers: request.headers } });
  if (!request.headers.has('next-router-prefetch') && request.headers.get('purpose') !== 'prefetch' && !request.headers.get('sec-purpose')?.includes('prefetch')) {
    response.cookies.set(marketCookie, country, preferenceOptions);
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/account/:path*', '/:market([a-z]{2})/product/:handle'] };
