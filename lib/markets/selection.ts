export const marketCookie = 'bs-market';

export function resolveCountry(active: string[], saved?: string, detected?: string | null) {
  for (const candidate of [saved, detected, 'US']) {
    if (candidate && active.includes(candidate)) return candidate;
  }
  if (!active.length) throw new Error('No shipping destinations are available.');
  return active[0];
}

export function countryProductPath(country: string, handle: string) {
  return '/' + country.toLowerCase() + '/product/' + encodeURIComponent(handle);
}

export const preferenceOptions = { path: '/', maxAge: 31536000, sameSite: 'lax' as const, httpOnly: true };
