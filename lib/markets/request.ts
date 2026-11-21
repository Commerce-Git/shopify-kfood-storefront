import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { activeCountries } from './registry';
import { marketCookie, resolveCountry } from './selection';

export const requestMarket = cache(async () => {
  const [countries, jar, requestHeaders] = await Promise.all([activeCountries(), cookies(), headers()]);
  const detected = process.env.VERCEL === '1' ? requestHeaders.get('x-vercel-ip-country') : null;
  return { countries, country: resolveCountry(countries, jar.get(marketCookie)?.value, detected) };
});
