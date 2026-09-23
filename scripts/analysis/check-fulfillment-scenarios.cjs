// Read-only diagnostic of actual admin domain code with in-memory fixtures.
// Run from the admin project: node <storefront>/scripts/analysis/check-fulfillment-scenarios.cjs
const path = require('node:path');
const { createRequire } = require('node:module');
const root = process.cwd();
const adminRequire = createRequire(path.join(root, 'package.json'));
adminRequire('tsx/cjs');
const { groupArtistOrdersIntoSubOrders } = adminRequire(path.join(root, 'lib/3pl/orderGrouping.ts'));
const { getArtistShortCode } = adminRequire(path.join(root, 'lib/utils/subOrder.ts'));
const A = '도자공방', B = '목공방';
const item = (artist, status) => ({ id: artist, shopify_order_id: '123', artist_name: artist, order_number: '1001', sku: artist + '-01', quantity: 1, status });
function run(a, b, tracking = false, fulfilled = false) {
  return groupArtistOrdersIntoSubOrders({
    artistOrders: [item(A, a), item(B, b)],
    orderMap: new Map([['123', { order_number: '1001', sync_status: tracking ? 'EMS_SUBMITTED' : 'PENDING', tracking_number: tracking ? 'TRACK-A' : null }]]),
    emsMap: tracking ? new Map([['123__' + getArtistShortCode(A), { tracking_number: 'TRACK-A', delivery_status: fulfilled ? 'in_transit' : 'registered', ...(fulfilled ? { fulfillment_id: 'FULFILL-A' } : {}) }]]) : new Map(),
    productMap: new Map(), itemMap: new Map(), tplId: 'PNC',
  });
}
const results = [];
function check(name, fn) {
  try { const result = fn(); results.push({ name, ...result }); }
  catch (error) { results.push({ name, passed: false, error: String(error) }); }
}
check('Fixture artist IDs are distinct', () => ({ passed: getArtistShortCode(A) !== getArtistShortCode(B) }));
check('All inbound items consolidate before any label', () => {
  const r = run('received', 'received');
  return { passed: r.length === 1 && r[0].is_consolidated && r[0].pack_status === 'ready' };
});
check('Only ready artist may be submitted', () => {
  const r = run('received', 'shipped');
  return { passed: r.length === 2 && r.find(o => o.items[0].artist_name === A).pack_status === 'ready' && r.find(o => o.items[0].artist_name === B).pack_status === 'pending' };
});
check('Registered artist remains separate while other artist is in transit', () => {
  const r = run('received', 'shipped', true);
  return { passed: r.length === 2 && r.find(o => o.items[0].artist_name === A).pack_status === 'submitted' && r.find(o => o.items[0].artist_name === B).pack_status === 'pending' };
});
check('Existing label must not absorb later inbound items', () => {
  const r = run('received', 'received', true);
  return { passed: !r.some(o => o.is_consolidated && o.tracking_number === 'TRACK-A' && o.items.length === 2), actual: r.map(o => ({ id: o.sub_order_id, consolidated: o.is_consolidated, tracking: o.tracking_number, itemCount: o.items.length })) };
});
check('Completed artist and later ready artist retain separate states', () => {
  const r = run('shipped', 'received', true, true);
  return { passed: r.length === 2 && r.find(o => o.items[0].artist_name === A).pack_status === 'completed' && r.find(o => o.items[0].artist_name === B).pack_status === 'ready' };
});
check('Distinct artists must not share an EMS identity', () => ({ passed: getArtistShortCode('Artist A') !== getArtistShortCode('Artist B'), actual: [getArtistShortCode('Artist A'), getArtistShortCode('Artist B')] }));
console.log(JSON.stringify({ results, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length }, null, 2));
process.exitCode = results.some(r => !r.passed) ? 1 : 0;
