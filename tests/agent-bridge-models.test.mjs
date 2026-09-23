import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, chmodSync, readdirSync, rmSync, existsSync, symlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const runner = fileURLToPath(new URL('../scripts/agent-bridge-front.mjs', import.meta.url));
function fixture(t, mode = 'success') {
  const cwd = mkdtempSync(path.join(tmpdir(), 'bridge-guards-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const mock = path.join(cwd, 'mock-agent.mjs');
  const invoke = args => spawnSync(process.execPath, [runner, ...args], {
    cwd, env: { ...process.env, CODEX_BIN: mock, AGY_BIN: mock, BRIDGE_TEST_MODE: mode }, encoding: 'utf8', timeout: 15000,
  });
  const git = args => {
    const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr); return r.stdout;
  };
  git(['init', '-q']);
  assert.equal(invoke(['init']).status, 0);
  const configPath = path.join(cwd, '.agent-bridge/pipeline.config.json');
  const config = JSON.parse(readFileSync(configPath));
  assert.deepEqual(config.reasoningEffort, { codexPlan: 'high', gemini: 'high', codexReview: 'high' });
  config.tests = [{ name: 'smoke', command: process.execPath, args: ['-e', 'process.exit(0)'] }];
  config.commandTimeoutMs = 2000;
  writeFileSync(configPath, JSON.stringify(config));
  writeFileSync(path.join(cwd, '.agent-bridge/REQUEST.md'), '# Implement sum\n');
  writeFileSync(mock, `#!/usr/bin/env node
import { appendFileSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
const args = process.argv.slice(2);
if (args.includes('--version')) { console.log('mock 1'); process.exit(0); }
const mode = process.env.BRIDGE_TEST_MODE;
if (args[0] === 'mcp' && args[1] === 'list') {
  console.log(mode === 'mcp-configured' ? 'Configured MCP server: external-db' : 'No MCP servers configured.');
  process.exit(0);
}
appendFileSync('.agent-bridge-runtime/calls.jsonl', JSON.stringify({ args }) + '\\n');
if (args.includes('-o')) {
  const output = args[args.indexOf('-o') + 1];
  if (output.endsWith('/COMMAND.md')) writeFileSync(output, '# Create sum.mjs and report manual actions\\n');
  else {
    if (mode === 'no-review') process.exit(0);
    if (mode === 'review-mutates') writeFileSync('sum.mjs', 'BROKEN');
    const countPath = '.agent-bridge-runtime/reviews';
    const count = existsSync(countPath) ? Number(readFileSync(countPath, 'utf8')) : 0;
    writeFileSync(countPath, String(count + 1));
    writeFileSync(output, 'Verdict: ' + (mode === 'repair' && count === 0 ? 'CHANGES_REQUIRED' : 'APPROVED') + '\\n');
  }
} else {
  if (mode === 'crash') process.exit(7);
  if (mode === 'timeout') { setInterval(() => {}, 1000); }
  else {
    if (mode !== 'no-report') {
      writeFileSync('sum.mjs', 'export function sum(a,b) { return a+b; }\\n');
      writeFileSync('.agent-bridge/REPORT.md', '# Report\\nStatus: COMPLETED\\nTests delegated. Manual: git push, SQL execution.\\n');
    }
    if (mode === 'config-mutates') writeFileSync('package.json', '{}');
    console.log(JSON.stringify({ status: mode === 'waiting' ? 'WAITING' : 'SUCCESS', response: 'Done' }));
  }
}
`);
  chmodSync(mock, 0o755);
  git(['add', '.']);
  git(['-c', 'user.name=Bridge Test', '-c', 'user.email=bridge@example.invalid', 'commit', '-qm', 'fixture']);
  const update = patch => writeFileSync(configPath, JSON.stringify({ ...config, ...patch }));
  const state = () => {
    const dir = path.join(cwd, '.agent-bridge-runtime/runs');
    return JSON.parse(readFileSync(path.join(dir, readdirSync(dir).sort().at(-1), 'STATE.json')));
  };
  const calls = () => readFileSync(path.join(cwd, '.agent-bridge-runtime/calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  return { cwd, invoke, config, update, state, calls, git };
}

test('per-stage model/effort flags and repair loop use scoped sandbox with read-only review', t => {
  const f = fixture(t, 'repair');
  const result = f.invoke(['run', '--plan-model', 'selected-plan', '--gemini-effort', 'medium', '--review-effort', 'low']);
  assert.equal(result.status, 0, result.stderr + readFileSync(path.join(f.cwd, '.agent-bridge/TEST_RESULTS.json'), 'utf8'));
  const calls = f.calls();
  assert.deepEqual(calls.map(({args}) => args[args.indexOf('--model')+1]), ['selected-plan', 'gemini-3.8-flash-medium', 'gpt-6-sol', 'gemini-3.8-flash-medium', 'gpt-6-sol']);
  for (const { args } of calls) {
    assert.ok(!args.includes('--dangerously-skip-permissions'));
    if (args.includes('exec')) {
      assert.equal(args[args.indexOf('--sandbox')+1], 'read-only');
      assert.ok(args.includes('approval_policy="never"'));
    } else {
      assert.ok(args.includes('--sandbox'));
      assert.equal(args[args.indexOf('--effort')+1], 'medium');
      assert.match(args.at(-1), /SQL/); assert.match(args.at(-1), /Git push/);
    }
  }
  assert.equal(f.state().status, 'approved');
  assert.equal(f.state().iteration, 2);
  assert.ok(!existsSync(path.join(f.cwd, '.agent-bridge-runtime/LOCK.json')));
});

test('init preserves README and regenerates missing instructions', t => {
  const f = fixture(t);
  const p = path.join(f.cwd, '.agent-bridge/README.md');
  writeFileSync(p, 'custom'); assert.equal(f.invoke(['init']).status, 0); assert.equal(readFileSync(p,'utf8'), 'custom');
  rmSync(p); assert.equal(f.invoke(['init']).status, 0); assert.match(readFileSync(p,'utf8'), /agent-bridge run/);
  assert.match(readFileSync(path.join(f.cwd, '.agent-bridge/SAFETY.md'),'utf8'), /Git push/);
});

test('init uses the root bridge directory even when legacy docs exist', t => {
  const f = fixture(t);
  rmSync(path.join(f.cwd, '.agent-bridge'), { recursive: true });
  writeFileSync(path.join(f.cwd, 'package.json'), JSON.stringify({ scripts: { test: 'node --test' } }));
  const legacy = path.join(f.cwd, 'docs/agent-bridge-front');
  mkdirSync(legacy, { recursive: true });
  const legacyConfig = '{"legacy":true}\n';
  writeFileSync(path.join(legacy, 'pipeline.config.json'), legacyConfig);
  const result = f.invoke(['init']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Initialized agent bridge at \.agent-bridge/);
  assert.ok(existsSync(path.join(f.cwd, '.agent-bridge/pipeline.config.json')));
  assert.equal(readFileSync(path.join(legacy, 'pipeline.config.json'), 'utf8'), legacyConfig);
  assert.equal(f.invoke(['run', '--dry-run']).status, 0);
});

test('init repairs partial initialization and preserves existing work on repeated runs', t => {
  const f = fixture(t);
  const dir = path.join(f.cwd, '.agent-bridge');
  const config = readFileSync(path.join(dir, 'pipeline.config.json'), 'utf8');
  writeFileSync(path.join(dir, 'REQUEST.md'), 'Keep my request');
  writeFileSync(path.join(dir, 'REVIEW.md'), 'Keep my review');
  rmSync(path.join(dir, 'REPORT.md'));
  writeFileSync(path.join(f.cwd, '.gitignore'), 'node_modules/\n');
  assert.equal(f.invoke(['init']).status, 0);
  assert.ok(existsSync(path.join(dir, 'REPORT.md')));
  assert.equal(readFileSync(path.join(dir, 'pipeline.config.json'), 'utf8'), config);
  rmSync(path.join(dir, 'pipeline.config.json'));
  assert.equal(f.invoke(['init']).status, 0);
  assert.ok(existsSync(path.join(dir, 'pipeline.config.json')));
  assert.equal(readFileSync(path.join(dir, 'REQUEST.md'), 'utf8'), 'Keep my request');
  assert.equal(readFileSync(path.join(dir, 'REVIEW.md'), 'utf8'), 'Keep my review');
  const before = readdirSync(dir).map(name => [name, readFileSync(path.join(dir, name), 'utf8')]);
  assert.equal(f.invoke(['init']).status, 0);
  assert.deepEqual(readdirSync(dir).map(name => [name, readFileSync(path.join(dir, name), 'utf8')]), before);
  assert.equal(readFileSync(path.join(f.cwd, '.gitignore'), 'utf8').split('/.agent-bridge-runtime/').length - 1, 1);
  assert.ok(!existsSync(path.join(f.cwd, '.agent-bridge-runtime')));
});

test('dry-run never changes request or creates a lock even with --request', t => {
  const f = fixture(t), p = path.join(f.cwd,'.agent-bridge/REQUEST.md'), before = readFileSync(p,'utf8');
  assert.equal(f.invoke(['run','--dry-run','--request','new content']).status,0);
  assert.equal(readFileSync(p,'utf8'),before);
  assert.ok(!existsSync(path.join(f.cwd,'.agent-bridge-runtime')));
});

test('legacy model defaults and invalid configuration are handled explicitly', t => {
  const f = fixture(t);
  f.update({models: {}, reasoningEffort: {}});
  assert.equal(f.invoke(['run','--allow-dirty']).status,0);
  assert.ok(f.calls().every(({args})=>!args.includes('--model')));
  for (const patch of [{workspaceRoot:'..'}, {tests:[]}, {maxIterations:0}, {tests:[{name:'bad', command:'supabase', args:['db','push']}]}, {reasoningEffort:{gemini:'extreme'}}]) {
    f.update(patch);
    assert.equal(f.invoke(['run','--dry-run']).status,1);
  }
  assert.equal(f.invoke(['run','--request-file']).status,1);
});

test('failed tests never accept stale approval and skip paid review', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.cwd,'.agent-bridge/REVIEW.md'),'Verdict: APPROVED\n');
  f.update({maxIterations:1,tests:[{name:'fails',command:process.execPath,args:['-e','process.exit(1)']}]});
  const r=f.invoke(['run','--allow-dirty']); assert.equal(r.status,1,r.stdout);
  assert.equal(f.state().status,'changes_required');
  assert.equal(f.calls().length,2);
  assert.match(readFileSync(path.join(f.cwd,'.agent-bridge/REVIEW.md'),'utf8'),/CHANGES_REQUIRED/);
});

for (const mode of ['no-report','waiting','crash','timeout','no-review','review-mutates','config-mutates']) {
  test(`${mode} cannot be marked approved; failure state and lock are finalized`, t => {
    const f=fixture(t,mode);
    const r=f.invoke(['run']); assert.equal(r.status,1,r.stdout);
    assert.equal(f.state().status,'failed');
    assert.ok(f.state().error);
    assert.ok(!existsSync(path.join(f.cwd,'.agent-bridge-runtime/LOCK.json')));
  });
}

test('concurrent execution lock blocks before model calls',t=>{
  const f=fixture(t); mkdirSync(path.join(f.cwd,'.agent-bridge-runtime'));
  writeFileSync(path.join(f.cwd,'.agent-bridge-runtime/LOCK.json'),'{}');
  const r=f.invoke(['run']); assert.equal(r.status,1); assert.match(r.stderr,/lock exists/);
  assert.ok(!existsSync(path.join(f.cwd,'.agent-bridge-runtime/calls.jsonl')));
});

test('configured MCP inventory stops automation before any model is called', t => {
  const f = fixture(t, 'mcp-configured');
  const result = f.invoke(['run']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /MCP inventory/);
  assert.equal(f.state().status, 'failed');
  assert.ok(!existsSync(path.join(f.cwd, '.agent-bridge-runtime/calls.jsonl')));
  assert.ok(!existsSync(path.join(f.cwd, '.agent-bridge-runtime/LOCK.json')));
});

test('non-ASCII dirty filenames and request-only changes are parsed correctly', t=>{
  const f=fixture(t);
  writeFileSync(path.join(f.cwd,'.agent-bridge/REQUEST.md'),'request change');
  assert.equal(f.invoke(['run']).status,0);
  writeFileSync(path.join(f.cwd,'한글 이름.txt'),'content');
  const r=f.invoke(['run']); assert.equal(r.status,1); assert.match(r.stderr,/한글 이름.txt/);
});

test('symlinked bridge control files are rejected before invocation',t=>{
  const f=fixture(t), p=path.join(f.cwd,'.agent-bridge/REPORT.md');
  rmSync(p); symlinkSync('/tmp',p);
  const r=f.invoke(['run']); assert.equal(r.status,1); assert.match(r.stderr,/symlinks/);
});

test('real test sandbox blocks outside writes, environment secrets, .env reads and network',t=>{
  const f=fixture(t);
  const outside=mkdtempSync(path.join(tmpdir(),'bridge-outside-'));
  t.after(()=>rmSync(outside,{recursive:true,force:true}));
  writeFileSync(path.join(f.cwd,'.env'),'SECRET=fixture');
  const code=`const fs=require('node:fs'); const net=require('node:net');
    let failed=0;
    try { fs.writeFileSync(${JSON.stringify(path.join(outside,'escaped'))},'bad'); failed++; console.error('outside write allowed'); } catch {}
    try { fs.readFileSync('.env'); failed++; console.error('env read allowed'); } catch {}
    try { fs.writeFileSync('.git/config','bad'); failed++; console.error('git write allowed'); } catch {}
    if (process.env.BRIDGE_TEST_MODE || process.env.NODE_OPTIONS) failed++;
    const s=net.createServer(); s.on('error',()=>process.exit(failed ? 1 : 0));
    s.listen(0,'127.0.0.1',()=>{s.close(); process.exit(1);});`;
  f.update({tests:[{name:'containment',command:process.execPath,args:['-e',code]}]});
  const r=f.invoke(['check','--allow-dirty']); assert.equal(r.status,0,r.stderr+'\n'+r.stdout+readFileSync(path.join(f.cwd,'.agent-bridge/TEST_RESULTS.json'),'utf8'));
  assert.equal(f.state().status,'passed'); assert.ok(!existsSync(path.join(outside,'escaped')));
});
