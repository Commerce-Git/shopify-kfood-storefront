import test from 'node:test';
import assert from 'node:assert/strict';
import { createInquiryPoller } from '../../lib/inquiries/polling.ts';

function clock() {
  const tasks = new Map<number, { run: () => void; delay: number }>();
  let id = 0;
  return {
    schedule(run: () => void, delay: number) {
      const key = ++id;
      tasks.set(key, { run, delay });
      return () => { tasks.delete(key); };
    },
    delay() { return [...tasks.values()][0]?.delay; },
    count() { return tasks.size; },
    fire() {
      const entry = [...tasks.entries()][0];
      assert.ok(entry, 'a next read should be scheduled');
      tasks.delete(entry[0]); entry[1].run();
    },
  };
}
const settle = () => new Promise<void>(resolve => queueMicrotask(resolve));

test('closed inquiries read once a minute; opening refreshes immediately and closing slows down', async () => {
  const timer = clock(); let reads = 0;
  const poller = createInquiryPoller({ read: async () => { reads++; return true; }, isVisible: () => true,
    isOnline: () => true, schedule: timer.schedule });
  poller.start(); await settle();
  assert.equal(reads, 1); assert.equal(timer.delay(), 60_000);
  poller.setOpen(true); await settle();
  assert.equal(reads, 2); assert.equal(timer.delay(), 10_000);
  timer.fire(); await settle(); assert.equal(reads, 3);
  poller.setOpen(false); assert.equal(timer.delay(), 60_000);
  poller.stop(); assert.equal(timer.count(), 0);
});

test('hidden and offline pages do not read; returning refreshes immediately', async () => {
  const timer = clock(); let visible = false, online = true, reads = 0;
  const poller = createInquiryPoller({ read: async () => { reads++; return true; }, isVisible: () => visible,
    isOnline: () => online, schedule: timer.schedule });
  poller.start(); await settle(); assert.equal(reads, 0); assert.equal(timer.count(), 0);
  visible = true; poller.refresh(); await settle(); assert.equal(reads, 1);
  online = false; poller.pause(); poller.refresh(); await settle();
  assert.equal(reads, 1); assert.equal(timer.count(), 0);
  online = true; poller.refresh(); await settle(); assert.equal(reads, 2);
  visible = false; timer.fire(); await settle(); assert.equal(reads, 2); assert.equal(timer.count(), 0);
  poller.stop();
});

test('slow requests never overlap and repeated refreshes become one pending refresh', async () => {
  const timer = clock(); let reads = 0, active = 0, peak = 0;
  const finishes: Array<(value: boolean) => void> = [];
  const poller = createInquiryPoller({ read: () => {
    reads++; active++; peak = Math.max(active, peak);
    return new Promise<boolean>(resolve => finishes.push(ok => { active--; resolve(ok); }));
  }, isVisible: () => true, isOnline: () => true, schedule: timer.schedule });
  poller.start(); poller.refresh(); poller.refresh(); poller.setOpen(true);
  assert.equal(reads, 1); assert.equal(timer.count(), 0);
  finishes.shift()!(true); await settle();
  assert.equal(reads, 2); assert.equal(peak, 1);
  finishes.shift()!(true); await settle(); assert.equal(timer.count(), 1);
  poller.stop();
});

test('failures back off to two minutes and a successful read restores the open interval', async () => {
  const timer = clock(); let ok = false;
  const poller = createInquiryPoller({ read: async () => ok, isVisible: () => true,
    isOnline: () => true, initialOpen: true, schedule: timer.schedule });
  poller.start(); await settle();
  for (const expected of [20_000, 40_000, 80_000, 120_000, 120_000]) {
    assert.equal(timer.delay(), expected); timer.fire(); await settle();
  }
  ok = true; timer.fire(); await settle(); assert.equal(timer.delay(), 10_000);
  poller.stop();
});

test('pause cancels a pending request; stop prevents late completions from restarting polling', async () => {
  const timer = clock(); let signal: AbortSignal | undefined;
  let finish: (value: boolean) => void = () => {};
  const poller = createInquiryPoller({ read: current => {
    signal = current; return new Promise<boolean>(resolve => { finish = resolve; });
  }, isVisible: () => true, isOnline: () => true, schedule: timer.schedule });
  poller.start(); poller.pause(); assert.equal(signal?.aborted, true);
  poller.stop(); finish(true); await settle(); assert.equal(timer.count(), 0);
  poller.refresh(); await settle(); assert.equal(timer.count(), 0);
});

test('a thrown network error is retried with backoff', async () => {
  const timer = clock();
  const poller = createInquiryPoller({ read: async () => { throw Error('offline transport'); },
    isVisible: () => true, isOnline: () => true, initialOpen: true, schedule: timer.schedule });
  poller.start(); await settle(); assert.equal(timer.delay(), 20_000); poller.stop();
});
