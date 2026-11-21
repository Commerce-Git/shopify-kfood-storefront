/** TEST-only Auth verification. Never generates login links or records credentials. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { parse } from 'dotenv';

const root = fileURLToPath(new URL('../', import.meta.url));
const ref = 'zijvqethklunvydtqmak';
const mailbox = 'thec9rqwer@gmail.com';
const output = path.join(root, '.agent-bridge/test-auth-live-verification.json');
const mode = process.argv[2] || 'inspect';
assert.ok(['inspect', 'apply', 'unconfirmed', 'observe'].includes(mode), 'Unknown mode');
const env = parse(fs.readFileSync(path.join(root, '.env.local')));
assert.equal(env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, ''), `https://${ref}.supabase.co`);
const adminEnv = parse(fs.readFileSync(path.join(root, '../blank-seoul-admin/.env.local')));
assert.equal(adminEnv.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, ''), `https://${ref}.supabase.co`);
assert.ok(fs.existsSync(path.join(os.homedir(), '.config/supabase-blank-seoul/profile.yaml')), 'Dedicated profile required');
const raw = execFileSync('security', ['find-generic-password', '-s', 'Supabase CLI', '-a', 'blank-seoul', '-w'], {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
}).trim();
const managementToken = raw.startsWith('go-keyring-base64:') ? Buffer.from(raw.slice('go-keyring-base64:'.length), 'base64').toString() : raw;
const state = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : {
  project: ref, createdAt: new Date().toISOString(), selectedMailbox: mailbox,
  realEmail: { status: 'pending' }, google: { status: 'pending' }, kakao: { status: 'pending' },
};
assert.equal(state.project, ref);
const save = () => fs.writeFileSync(output, JSON.stringify(state, null, 2) + '\n');
const hash = value => createHash('sha256').update(value).digest('hex');
async function request(url, key, method = 'GET', body) {
  const r = await fetch(url, {
    method, headers: { Authorization: `Bearer ${key}`, ...(url.includes('.supabase.co/') ? { apikey: key } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000), redirect: 'error',
  });
  const data = await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, data };
}
const auth = (suffix, method, body, key = env.SUPABASE_SERVICE_ROLE_KEY) => request(`https://${ref}.supabase.co/auth/v1${suffix}`, key, method, body);
const management = (method, body) => request(`https://api.supabase.com/v1/projects/${ref}/config/auth`, managementToken, method, body);
async function publicSettings() {
  const c = await requireData(await auth('/settings', 'GET', undefined, env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  return { mailer_autoconfirm: c.mailer_autoconfirm, disable_signup: c.disable_signup,
    external: Object.fromEntries(['email', 'google', 'kakao'].map(k => [k, c.external?.[k]])) };
}
async function requireData(result) {
  assert.ok(result.ok, `Remote operation failed: HTTP ${result.status}, code ${result.data?.error_code || result.data?.code || 'unavailable'}`);
  return result.data;
}
function settings(c) {
  const keys = ['mailer_autoconfirm', 'disable_signup', 'external_email_enabled', 'external_google_enabled',
    'external_kakao_enabled', 'site_url', 'uri_allow_list', 'hook_send_email_enabled'];
  return { ...Object.fromEntries(keys.map(k => [k, c[k] ?? null])), smtpConfigured: !!c.smtp_host };
}
async function users() {
  const all = [];
  for (let page = 1; page <= 20; page++) {
    const data = await requireData(await auth(`/admin/users?page=${page}&per_page=100`));
    all.push(...data.users);
    if (data.users.length < 100) return all;
  }
  throw Error('User inventory exceeded bounded page limit');
}
async function snapshot() {
  const result = [];
  for (const u of await users()) {
    const d = await requireData(await auth(`/admin/users/${u.id}`));
    result.push({ userHash: hash(d.id), selectedMailbox: d.email?.toLowerCase() === mailbox,
      role: d.app_metadata?.role ?? null, roles: d.app_metadata?.roles ?? [],
      providers: d.identities?.map(i => i.provider).sort() ?? [],
      identities: d.identities?.map(i => hash(`${i.provider}:${i.id}`)).sort() ?? [],
      lastSignInAt: d.last_sign_in_at ?? null, emailConfirmed: !!d.email_confirmed_at });
  }
  return result;
}
try {
  if (mode === 'inspect') {
    state.latestSettings = settings(await requireData(await management()));
    state.latestUsers = await snapshot();
    state.inspectedAt = new Date().toISOString(); save();
  }
  if (mode === 'apply') {
    assert.ok(!state.appliedAt, 'Already applied; use observe rather than overwrite the baseline');
    const before = settings(await requireData(await management()));
    state.before = { settings: before, users: await snapshot(), at: new Date().toISOString() }; save();
    // This is the entire configuration mutation. No provider/URL/SMTP changes.
    await requireData(await management('PATCH', { mailer_autoconfirm: false }));
    const after = settings(await requireData(await management()));
    assert.equal(after.mailer_autoconfirm, false);
    for (const k of Object.keys(before)) if (k !== 'mailer_autoconfirm') assert.deepEqual(after[k], before[k], `Unexpected config change: ${k}`);
    state.afterSettings = after; state.appliedAt = new Date().toISOString(); save();
    state.publicSettings = await publicSettings(); save();
    assert.equal(state.publicSettings.mailer_autoconfirm, false);
  }
  if (mode === 'unconfirmed') {
    assert.equal((await requireData(await management())).mailer_autoconfirm, false, 'Confirmation must be enabled first');
    const marker = `auth-verification-${randomUUID()}`;
    const email = `${marker}@example.invalid`, password = randomBytes(32).toString('base64url') + '!Aa1';
    state.unconfirmed = { status: 'running', marker, createdAt: new Date().toISOString(), cleanup: 'pending' }; save();
    try {
      const created = await requireData(await auth('/admin/users', 'POST', { email, password, email_confirm: false, app_metadata: { auth_verification_run: marker } }));
      const u = created.user || created;
      assert.equal(u.email_confirmed_at ?? null, null);
      const login = await auth('/token?grant_type=password', 'POST', { email, password }, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      // Never persist the response body: it could contain a session on failure of the assertion.
      state.unconfirmed.loginHttpStatus = login.status;
      state.unconfirmed.loginErrorCode = login.data?.error_code ?? null;
      state.unconfirmed.sessionIssued = !!login.data?.access_token;
      assert.equal(login.ok, false, 'Unconfirmed user unexpectedly received a login response');
      assert.equal(login.data?.error_code, 'email_not_confirmed');
      state.unconfirmed.status = 'passed';
    } finally {
      // Also handles a lost creation response: only our exact email+server marker can be deleted.
      const owned = (await users()).filter(u => u.email === email && u.app_metadata?.auth_verification_run === marker);
      for (const u of owned) await requireData(await auth(`/admin/users/${u.id}`, 'DELETE'));
      assert.equal((await users()).some(u => u.email === email), false, 'Temporary account cleanup failed');
      state.unconfirmed.cleanup = 'verified_deleted'; save();
    }
  }
  if (mode === 'observe') {
    state.latestSettings = settings(await requireData(await management()));
    state.publicSettings = await publicSettings();
    state.latestUsers = await snapshot();
    state.existingAccountsPreserved = !!state.before;
    for (const previous of state.before?.users || []) {
      const current = state.latestUsers.find(u => u.userHash === previous.userHash);
      assert.ok(current, 'Existing user disappeared');
      assert.deepEqual(current.role, previous.role); assert.deepEqual(current.roles, previous.roles);
      for (const identity of previous.identities) assert.ok(current.identities.includes(identity), 'Existing social identity changed');
    }
    state.observedAt = new Date().toISOString(); save();
  }
  console.log(JSON.stringify({ mode, project: ref, report: path.relative(root, output), appliedAt: state.appliedAt ?? null,
    unconfirmed: state.unconfirmed?.status ?? null, cleanup: state.unconfirmed?.cleanup ?? null,
    existingAccountsPreserved: state.existingAccountsPreserved ?? null }));
} catch (error) {
  state.failure = { mode, at: new Date().toISOString(), message: error.message }; save();
  console.error(error.message); process.exitCode = 1;
}
