import test from 'node:test';
import assert from 'node:assert/strict';
import { createInquiryRequestKey, mergeInquiryMessages } from '../../lib/inquiries/clientDelivery.ts';
test('ambiguous send retry keeps its key; changed scope or acknowledged next message gets a new key', () => {
  const keys=createInquiryRequestKey(); const first=keys.get(['thread1','hello']);
  assert.equal(keys.get(['thread1','hello']),first);
  assert.notEqual(keys.get(['thread2','hello']),first);
  const second=keys.get(['thread1','hello']); keys.clear(); assert.notEqual(keys.get(['thread1','hello']),second);
});
test('GET arriving before/after a POST acknowledgment cannot duplicate or lose the sent message', () => {
  const row={id:'1',created_at:'2026-09-30T00:00:00Z',body:'first'};
  const sent={id:'2',created_at:'2026-09-30T00:00:01Z',body:'sent'};
  const afterPost=mergeInquiryMessages([row],[sent]);
  assert.deepEqual(mergeInquiryMessages(afterPost,[row]),[row,sent]);
  assert.deepEqual(mergeInquiryMessages([row,sent],[sent]),[row,sent]);
  assert.equal(mergeInquiryMessages([row],[{...row,body:'translated'}])[0].body,'translated');
});
