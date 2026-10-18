import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ESLint } from 'eslint';
const require = createRequire(import.meta.url);
const { getRootDirs } = require('@next/eslint-plugin-next/dist/utils/get-root-dirs.js');

test('scoped glob replacement supports Next rootDir patterns and keeps lint rules active', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-eslint-glob-'));
  try {
    for (const name of ['shop', 'admin', '.hidden']) fs.mkdirSync(path.join(dir, name, 'pages'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'shop/pages/welcome.js'), 'export default function Welcome() {}');
    const rootDirs = (rootDir?: unknown) => getRootDirs({ cwd: dir, settings: { next: { rootDir } } });
    assert.deepEqual(rootDirs(), [dir]);
    assert.deepEqual(rootDirs(`${dir}/s*`), [path.join(dir, 'shop')]);
    assert.deepEqual(rootDirs(`${dir}/{shop,admin}`).sort(), ['admin', 'shop'].map(x => path.join(dir, x)));
    assert.deepEqual(rootDirs([`${dir}/shop`, `${dir}/admin`]).sort(), ['admin', 'shop'].map(x => path.join(dir, x)));
    assert.deepEqual(rootDirs(`${dir}/missing*`), []);
    assert.equal(rootDirs(`${dir}/*`).includes(path.join(dir, '.hidden')), false);
    const eslint = new ESLint({ overrideConfig: { settings: { next: { rootDir: `${dir}/s*` } } } });
    const [result] = await eslint.lintText('export default function Page(){return <a href="/welcome">Welcome</a>}', { filePath: 'app/dependency-fixture.tsx' });
    assert.ok(result.messages.some(m => m.ruleId === '@next/next/no-html-link-for-pages'));
    const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
    assert.equal(Object.keys(lock.packages).some(key => /\/braces$/.test(key)), false);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
