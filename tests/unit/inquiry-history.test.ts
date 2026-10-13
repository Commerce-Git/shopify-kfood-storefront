import test from 'node:test';
import assert from 'node:assert/strict';
import { readInquiryHistory, upsertInquiryHistory } from '../../lib/inquiries/history.ts';

test('browser history tolerates unavailable or corrupt storage without inventing access', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('denied'); } });
    assert.deepEqual(readInquiryHistory(), []);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => '{broken' } });
    assert.deepEqual(readInquiryHistory(), []);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => JSON.stringify([
      { token: 'someone@example.com', title: 'Email is not an access token', updatedAt: new Date().toISOString() },
      { token: `inq_${'a'.repeat(32)}`, title: 'Invalid date', updatedAt: 'invalid' },
    ]) } });
    assert.deepEqual(readInquiryHistory(), []);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('updating a conversation retains other access links and sorts by last activity', () => {
  const first = { token: `inq_${'a'.repeat(32)}`, title: 'Shipping', updatedAt: '2026-10-03T00:00:00Z' };
  const second = { token: `inq_${'b'.repeat(32)}`, title: 'Product', updatedAt: '2026-10-04T00:00:00Z' };
  const saved = upsertInquiryHistory([first], second);
  const updated = upsertInquiryHistory(saved, { ...first, updatedAt: '2026-10-04T01:00:00Z' });
  assert.deepEqual(updated.map(row => row.token), [first.token, second.token]);
  assert.equal(updated.length, 2);
  assert.equal(saved[0].token, second.token);
});
