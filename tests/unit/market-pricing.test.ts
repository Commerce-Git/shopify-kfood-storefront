import assert from 'node:assert/strict';
import test from 'node:test';
import { countryProductPath, resolveCountry } from '../../lib/markets/selection.ts';
import { GET_PRODUCT_BY_HANDLE, GET_BASE_PRODUCT_BY_HANDLE } from '../../lib/shopify/queries.ts';
import { fetchBagPrices } from '../../lib/cart/market-prices.ts';

test('common product links prefer saved active destinations, then location, then the default', () => {
  const active = ['US', 'DE', 'NL', 'SE'];
  assert.equal(resolveCountry(active, 'DE', 'NL'), 'DE');
  assert.equal(resolveCountry(active, 'CA', 'SE'), 'SE');
  assert.equal(resolveCountry(active, undefined, 'CA'), 'US');
  assert.equal(resolveCountry(['NL']), 'NL');
  assert.throws(() => resolveCountry([]));
  assert.equal(countryProductPath('SE', 'blue tote'), '/se/product/blue%20tote');
});

test('catalog product pages use a market and the admin base-price receipt stays uncontextualized', () => {
  assert.match(GET_PRODUCT_BY_HANDLE, /@inContext\(country: \$country\)/);
  assert.doesNotMatch(GET_BASE_PRODUCT_BY_HANDLE, /@inContext|\$country/);
});

test('a mismatched country or variant cannot validate a bag', async t => {
  const responses = [
    { country: 'DE', prices: [{ id: 'a', amount: '46' }] },
    { country: 'US', prices: [{ id: 'b', amount: '32' }] },
    { country: 'US', prices: [] },
    { country: 'US', prices: [{ id: 'a', amount: '32' }] },
  ];
  t.mock.method(globalThis, 'fetch', async () => Response.json(responses.shift()));
  const request = () => fetchBagPrices('US', ['a'], new AbortController().signal);
  await assert.rejects(request);
  await assert.rejects(request);
  await assert.rejects(request);
  assert.deepEqual(await request(), [{ id: 'a', amount: '32' }]);
});
