export type BagQuote = { id: string; amount?: string; issue?: string };

export async function fetchBagPrices(country: string, ids: string[], signal: AbortSignal): Promise<BagQuote[]> {
  const prices: BagQuote[] = [];
  for (let i = 0; i < ids.length; i += 250) {
    const batch = ids.slice(i, i + 250);
    const response = await fetch('/api/market/cart-prices', {
      method: 'POST', cache: 'no-store', signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country, ids: batch }),
    });
    if (!response.ok) throw new Error('Price verification failed.');
    const result = await response.json();
    if (result.country !== country || !Array.isArray(result.prices) || result.prices.length !== batch.length ||
        result.prices.some((quote: BagQuote | null, index: number) => !quote || quote.id !== batch[index])) {
      throw new Error('Incomplete bag prices.');
    }
    prices.push(...result.prices);
  }
  return prices;
}
