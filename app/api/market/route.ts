import { NextResponse } from 'next/server';
import { activeCountries } from '@/lib/markets/registry';
import { marketCookie, preferenceOptions } from '@/lib/markets/selection';

export async function POST(request: Request) {
  const country = (await request.json().catch(() => null))?.country;
  if (!(await activeCountries()).includes(country)) return NextResponse.json({ error: 'Unavailable destination' }, { status: 400 });
  const response = NextResponse.json({ country });
  response.cookies.set(marketCookie, country, preferenceOptions);
  return response;
}
