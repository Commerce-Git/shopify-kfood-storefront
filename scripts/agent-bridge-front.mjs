#!/usr/bin/env node

import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile, open, unlink, lstat, readlink, realpath } from "node:fs/promises";
import { existsSync, realpathSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";

const root = realpathSync(process.cwd());
let activeRun;
let lockHandle;
const children = new Set();
const bridgeDir = process.env.AGENT_BRIDGE_DIR
  ? path.resolve(root, process.env.AGENT_BRIDGE_DIR)
  : path.join(root, ".agent-bridge");
const bridgeRelative = path.relative(root, bridgeDir).split(path.sep).join("/");
const runtimeRoot = path.join(root, ".agent-bridge-runtime", "runs");
const files = {
  readme: path.join(bridgeDir, "README.md"),
  request: path.join(bridgeDir, "REQUEST.md"),
  command: path.join(bridgeDir, "COMMAND.md"),
  report: path.join(bridgeDir, "REPORT.md"),
  review: path.join(bridgeDir, "REVIEW.md"),
  tests: path.join(bridgeDir, "TEST_RESULTS.json"),
  config: path.join(bridgeDir, "pipeline.config.json"),
  policy: path.join(bridgeDir, "SAFETY.md"),
};

function bridgeReadme() {
  return `# Agent Bridge

이 폴더는 Codex가 작업을 계획하고, Gemini가 구현한 뒤, Codex가 실제 변경과 테스트 결과를 검토하는 자동화 파이프라인의 프로젝트별 작업 공간입니다.

## 시작하기

프로젝트 루트에서 실행합니다.
기본 작업 폴더는 루트의 \`.agent-bridge\`입니다. \`AGENT_BRIDGE_DIR\`로 명시적으로 변경할 수 있습니다.
\`init\`을 다시 실행하면 기존 파일을 보존하고 누락된 기본 파일과 로그 제외 규칙만 추가합니다.
\`.agent-bridge-runtime\`은 실행 로그용이며 \`init\`에서는 생성하지 않습니다.

\`\`\`bash
agent-bridge init
agent-bridge doctor
agent-bridge check
agent-bridge run --request "수행할 작업"
\`\`\`

파일에 요청을 작성해서 실행할 수도 있습니다.

\`\`\`bash
agent-bridge run --request-file ${bridgeRelative}/REQUEST.md
\`\`\`

에이전트를 호출하지 않고 설정만 확인하려면 다음 명령을 사용합니다.

\`\`\`bash
agent-bridge run --dry-run --allow-dirty
\`\`\`

## 파일

- \`REQUEST.md\`: 사용자가 작성하는 작업 요청
- \`COMMAND.md\`: Codex가 작성하는 Gemini 구현 지시
- \`REPORT.md\`: Gemini의 구현 및 검증 보고서
- \`REVIEW.md\`: Codex의 독립 검토 결과
- \`TEST_RESULTS.json\`: 오케스트레이터가 실행한 테스트 결과
- \`pipeline.config.json\`: 모델, 추론 강도, 테스트 명령과 반복 횟수
- \`SAFETY.md\`: 프로젝트 권한 설정과 SQL·Git push 수동 작업 안내

## 모델과 추론 강도

\`pipeline.config.json\`에서 각 단계의 모델과 \`low\`, \`medium\`, \`high\` 추론 강도를 설정합니다.

\`\`\`json
{
  "models": {
    "codexPlan": "gpt-6-sol",
    "gemini": "gemini-3.8-flash",
    "codexReview": "gpt-6-sol"
  },
  "reasoningEffort": {
    "codexPlan": "high",
    "gemini": "high",
    "codexReview": "high"
  }
}
\`\`\`

## 주의사항

- 실행 전에 기존 변경을 커밋하거나 별도 브랜치에 보관합니다.
- \`--allow-dirty\`는 기존 변경과 에이전트 변경을 구분하기 어려우므로 필요한 경우에만 사용합니다.
- 배포, 결제, 이메일 발송 등 외부 부작용이 있는 작업은 자동 실행 범위에 포함하지 않습니다.
- SQL 실행·마이그레이션 적용·Git push는 사용자가 직접 합니다. SQL 파일 작성은 가능합니다.
- \`agent-bridge check\`는 모델을 호출하지 않고 macOS 샌드박스에서 등록된 테스트만 실행합니다.
- \`doctor\` 성공은 인증이나 전체 자동화 성공을 의미하지 않습니다. \`SAFETY.md\`에서 Antigravity 프로젝트 범위와 MCP 권한을 확인하세요.
`;
}

function safetyGuide() {
  return `# 프로젝트 권한과 수동 작업\n\n작업 루트: ${root}\n\n- Antigravity Project의 Folders에는 위 프로젝트만 등록합니다. Downloads 전체나 다른 프로젝트를 추가하지 않습니다.\n- Permission Settings는 Default(샌드박스 내부 실행)로 설정합니다. Turbo, 전체 권한 우회, unsandboxed 허용은 사용하지 않습니다.\n- MCP의 Supabase SQL 실행, 배포, Git push는 자동 작업에서 제외합니다. CLI 프로젝트에서도 해당 MCP를 비활성화하거나 Deny로 설정합니다. 터미널 샌드박스는 MCP 호출을 통제하지 않습니다.\n- SQL 파일 작성과 검토는 가능하지만 실제 SQL 실행·마이그레이션 적용·Git push는 사용자가 직접 합니다. 필요한 수동 작업은 REPORT.md에 기록합니다.\n- Codex 계획/검토는 read-only이며 결과 문서는 오케스트레이터가 저장합니다.\n- 테스트는 macOS sandbox-exec에서 네트워크 없이 실행합니다. 쓰기는 프로젝트와 실행별 임시 폴더로 제한되며 .git, 브리지 제어 파일, .env 접근은 차단됩니다. 미지원 OS나 샌드박스 시작 실패 시 일반 실행으로 전환하지 않습니다.\n- 현재 agy 호출은 --sandbox를 사용하지만 사용자/프로젝트 권한과 MCP를 자동으로 감사하지 않습니다. 범위 제한을 완전히 검증했다는 뜻이 아닙니다.\n- doctor는 CLI 버전만 확인합니다. 인증·모델 호출·파일 구현은 별도 통합 테스트가 필요합니다.\n\n공식 안내: https://antigravity.google/docs/sandbox?tab=cli\n`;
}

function usage() {
  console.log(`Usage:
  agent-bridge init
  agent-bridge doctor
  agent-bridge run --request "task"
  agent-bridge check
  agent-bridge run --request-file .agent-bridge/REQUEST.md
  npm run agent:bridge -- --request "task"

Options:
  --request <text>       Write text to REQUEST.md before starting
  --request-file <path>  Use an existing request file
  --max-iterations <n>   Override pipeline.config.json
  --plan-model <id>      Codex planning model
  --gemini-model <id>    Antigravity implementation and repair model
  --review-model <id>    Codex independent review model
  --plan-effort <level>  Codex planning reasoning effort
  --gemini-effort <level> Antigravity implementation reasoning effort
  --review-effort <level> Codex review reasoning effort
  --allow-dirty          Allow starting with existing Git changes
  --dry-run              Validate configuration and print the planned stages
  --help                 Show this message`);
}

function parseArgs(argv) {
  const args = [...argv];
  const first = args[0];
  const action = ["init", "doctor", "run", "check"].includes(first) ? args.shift() : "run";
  const options = { action, allowDirty: false, dryRun: false };
  for (let i = 0; i < args.length; i += 1) {
    const value = args[i];
    if (value === "--allow-dirty") options.allowDirty = true;
    else if (value === "--dry-run") options.dryRun = true;
    else if (value === "--help" || value === "-h") options.help = true;
    else if (["--request", "--request-file"].includes(value)) {
      const content = args[++i];
      if (!content || content.startsWith("--")) throw new Error(`${value} requires a value`);
      options[value === "--request" ? "request" : "requestFile"] = content;
    }
    else if (value === "--max-iterations") options.maxIterations = Number(args[++i]);
    else if (["--plan-model", "--gemini-model", "--review-model"].includes(value)) {
      const model = args[++i];
      if (!model || model.startsWith("--")) throw new Error(`${value} requires a model ID`);
      const key = { "--plan-model": "codexPlan", "--gemini-model": "gemini", "--review-model": "codexReview" }[value];
      options.models ??= {};
      options.models[key] = model;
    }
    else if (["--plan-effort", "--gemini-effort", "--review-effort"].includes(value)) {
      const effort = args[++i];
      if (!effort || effort.startsWith("--")) throw new Error(`${value} requires a reasoning effort`);
      const key = { "--plan-effort": "codexPlan", "--gemini-effort": "gemini", "--review-effort": "codexReview" }[value];
      options.reasoningEffort ??= {};
      options.reasoningEffort[key] = effort;
    }
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (options.request !== undefined && !options.request?.trim()) {
    throw new Error("--request must not be empty");
  }
  if (options.request !== undefined && options.requestFile !== undefined) throw new Error("Choose --request or --request-file, not both");
  if (options.maxIterations !== undefined && (!Number.isInteger(options.maxIterations) || options.maxIterations < 1 || options.maxIterations > 5)) {
    throw new Error("--max-iterations must be an integer between 1 and 5");
  }
  return options;
}

function resolveModels(config, overrides = {}) {
  const configured = config.models ?? {};
  if (typeof configured !== "object" || Array.isArray(configured)) {
    throw new Error("models must be an object with codexPlan, gemini, and codexReview fields");
  }
  const models = {};
  for (const key of ["codexPlan", "gemini", "codexReview"]) {
    const value = overrides[key] ?? configured[key] ?? null;
    if (value !== null && (typeof value !== "string" || !value.trim() || /\s/.test(value.trim()) || value.trim().startsWith("-"))) {
      throw new Error(`models.${key} must be a nonempty model ID or null`);
    }
    models[key] = value === null ? null : value.trim();
  }
  return models;
}

function modelArgs(model) {
  return model === null ? [] : ["--model", model];
}

function resolveReasoningEffort(config, overrides = {}) {
  const configured = config.reasoningEffort ?? {};
  if (typeof configured !== "object" || Array.isArray(configured)) {
    throw new Error("reasoningEffort must be an object with codexPlan and codexReview fields");
  }
  const allowed = new Set(["minimal", "low", "medium", "high", "xhigh", "max", "ultra"]);
  const result = {};
  for (const key of ["codexPlan", "gemini", "codexReview"]) {
    const value = overrides[key] ?? configured[key] ?? null;
    const supported = key === "gemini" ? new Set(["low", "medium", "high"]) : allowed;
    if (value !== null && (typeof value !== "string" || !supported.has(value))) {
      throw new Error(`reasoningEffort.${key} must be one of ${[...supported].join(", ")} or null`);
    }
    result[key] = value;
  }
  return result;
}

function codexModelArgs(model, reasoningEffort) {
  return [
    ...modelArgs(model),
    ...(reasoningEffort === null ? [] : ["--config", `model_reasoning_effort=\"${reasoningEffort}\"`]),
  ];
}

function geminiInvocation(model, reasoningEffort) {
  const resolvedModel = model !== null && reasoningEffort !== null && model.startsWith("gemini-")
    ? `${model.replace(/-(?:low|medium|high)$/, "")}-${reasoningEffort}`
    : model;
  return [
    ...modelArgs(resolvedModel),
    ...(reasoningEffort === null ? [] : ["--effort", reasoningEffort]),
  ];
}

async function initializeBridge() {
  const alreadyInitialized = existsSync(files.config);
  await mkdir(bridgeDir, { recursive: true });
  let packageScripts = {};
  try {
    packageScripts = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")).scripts || {};
  } catch {}
  const candidates = [
    ["typecheck", "typecheck"],
    ["unit", "test:unit"],
    ["test", "test"],
    ["lint", "lint"],
    ["build", "build"],
  ];
  const seen = new Set();
  const tests = candidates
    .filter(([, script]) => packageScripts[script] && !seen.has(script) && seen.add(script))
    .map(([name, script]) => ({ name, command: "npm", args: ["run", script] }));
  const templates = {
    [files.readme]: bridgeReadme(),
    [files.policy]: safetyGuide(),
    [files.request]: "# 작업 요청\n\n## 목표\n\n여기에 이번 실행에서 달성할 목표를 작성합니다.\n\n## 제약 조건\n\n- 기존 사용자 변경을 보존한다.\n- 배포 및 실제 외부 데이터 변경은 수행하지 않는다.\n",
    [files.command]: "# Gemini 작업 지시\n\n> Codex 계획 단계에서 갱신됩니다.\n",
    [files.report]: "# Gemini 수행 결과 보고서\n\n> Gemini 구현 단계에서 갱신됩니다.\n\n## 수행 요약\n\n- 완료한 작업:\n- 수행하지 못한 작업과 이유:\n\n## 변경 사항\n\n| 파일 | 변경 내용 |\n| --- | --- |\n|  |  |\n\n## 검증 결과\n\n- 실행한 명령과 결과:\n- 남은 문제와 후속 조치:\n",
    [files.review]: "# Codex 독립 검토\n\nVerdict: NOT_RUN\n\n## 발견 사항\n\n- 아직 검토하지 않았습니다.\n",
    [files.tests]: JSON.stringify({ status: "not_run", generatedAt: null, commands: [] }, null, 2) + "\n",
    [files.config]: JSON.stringify({
      workspaceRoot: ".",
      maxIterations: 2,
      commandTimeoutMs: 300000,
      models: { codexPlan: "gpt-6-sol", gemini: "gemini-3.8-flash", codexReview: "gpt-6-sol" },
      reasoningEffort: { codexPlan: "high", gemini: "high", codexReview: "high" },
      tests,
    }, null, 2) + "\n",
  };
  for (const [file, content] of Object.entries(templates)) {
    try {
      await writeFile(file, content, { flag: "wx" });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }
  const gitignorePath = path.join(root, ".gitignore");
  const ignoreRule = "/.agent-bridge-runtime/";
  let gitignore = "";
  try {
    gitignore = await readFile(gitignorePath, "utf8");
  } catch {}
  if (!gitignore.split(/\r?\n/).includes(ignoreRule)) {
    const separator = gitignore && !gitignore.endsWith("\n") ? "\n" : "";
    await writeFile(gitignorePath, `${gitignore}${separator}\n# Agent bridge runtime logs\n${ignoreRule}\n`);
  }
  console.log(`${alreadyInitialized ? "Verified" : "Initialized"} agent bridge at ${bridgeRelative}`);
  console.log("Existing files preserved; missing files created. Runtime logs: .agent-bridge-runtime/");
  console.log(`Next: write ${bridgeRelative}/REQUEST.md, review and commit changes, then run agent-bridge run.`);
  if (!alreadyInitialized && tests.length === 0) console.log("No package.json test scripts were detected. Add validation commands to pipeline.config.json.");
}

function runId() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function stopChild(child, signal = 'SIGTERM') {
  if (!child.pid) return;
  try { process.kill(-child.pid, signal); } catch { child.kill(signal); }
}

async function run(command, args, { timeoutMs = 30000, logFile, allowFailure = false, echo = false, env } = {}) {
  const started = Date.now();
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root, env: env ?? process.env,
      stdio: ['ignore', 'pipe', 'pipe'], shell: false, detached: process.platform !== 'win32',
    });
    children.add(child);
    let stdout = '', stderr = '', timedOut = false, forceTimer;
    child.stdout.on('data', chunk => { stdout += chunk; if (echo) process.stdout.write(chunk); });
    child.stderr.on('data', chunk => { stderr += chunk; if (echo) process.stderr.write(chunk); });
    const timer = setTimeout(() => {
      timedOut = true;
      stopChild(child);
      forceTimer = setTimeout(() => stopChild(child, 'SIGKILL'), 2000);
    }, timeoutMs);
    const cleanup = () => { clearTimeout(timer); clearTimeout(forceTimer); children.delete(child); };
    child.on('error', error => { cleanup(); reject(error); });
    child.on('close', async (code, signal) => {
      cleanup();
      try {
        const result = { command: [command, ...args].join(' '), exitCode: code, signal, timedOut,
          durationMs: Date.now() - started, stdout, stderr };
        if (logFile) await writeFile(logFile, `${stdout}\n[stderr]\n${stderr}`);
        if ((code !== 0 || timedOut) && !allowFailure) {
          throw new Error(`${command} ${timedOut ? 'timed out' : `exited with code ${code}`} (see run logs)`);
        }
        resolve(result);
      } catch (error) { reject(error); }
    });
  });
}

function tail(value, maxLines = 60, maxChars = 8000) {
  return value.split(/\r?\n/).slice(-maxLines).join('\n').slice(-maxChars);
}

async function gitStatus() {
  return (await run('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'])).stdout;
}
function changedPaths(status) {
  const entries = status.split('\0'), paths = [];
  for (let i = 0; i < entries.length; i++) {
    if (!entries[i]) continue;
    const entry = entries[i];
    paths.push(entry.slice(3));
    if (/R|C/.test(entry.slice(0, 2))) paths.push(entries[++i]);
  }
  return paths;
}
async function assertExists(file) {
  try { await access(file); } catch { throw new Error(`Required file is missing: ${path.relative(root, file)}`); }
}
async function writeState(runDir, state) {
  await writeFile(path.join(runDir, 'STATE.json'), JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2) + '\n');
}
const inside = (base, target) => target === base || target.startsWith(base + path.sep);
async function assertLocalPath(target) {
  if (!inside(root, target)) throw new Error(`Path must stay inside project root: ${target}`);
  const relative = path.relative(root, target);
  let current = root;
  for (const part of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink()) throw new Error(`Bridge paths must not use symlinks: ${current}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
async function checkWorkspace() {
  const gitRoot = (await run('git', ['rev-parse', '--show-toplevel'])).stdout.trim();
  if (await realpath(gitRoot) !== root) throw new Error('Run agent-bridge from the Git project root');
  await assertLocalPath(bridgeDir);
  await assertLocalPath(path.dirname(runtimeRoot));
  for (const file of Object.values(files)) await assertLocalPath(file);
}
function validateConfig(config, options) {
  if (path.resolve(root, config.workspaceRoot ?? '.') !== root) throw new Error('workspaceRoot must resolve to this project root (.)');
  const maxIterations = options.maxIterations ?? config.maxIterations ?? 2;
  const timeoutMs = config.commandTimeoutMs ?? 300000;
  if (config.antigravityProject != null && (typeof config.antigravityProject !== 'string' || !config.antigravityProject.trim())) throw new Error('antigravityProject must be a project name/ID or null');
  if (!Number.isInteger(maxIterations) || maxIterations < 1 || maxIterations > 5) throw new Error('maxIterations must be 1..5');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 1800000) throw new Error('commandTimeoutMs must be 100..1800000');
  if (!Array.isArray(config.tests) || !config.tests.length) throw new Error('Configure at least one test; empty tests cannot approve a run');
  const names = new Set();
  for (const test of config.tests) {
    if (!test || !/^[a-zA-Z0-9_-]+$/.test(test.name) || names.has(test.name)) throw new Error('Tests need unique safe names');
    names.add(test.name);
    if (typeof test.command !== 'string' || !test.command || !Array.isArray(test.args) || test.args.some(a => typeof a !== 'string')) throw new Error('Each test needs command and string args');
    if (test.timeoutMs !== undefined && (!Number.isInteger(test.timeoutMs) || test.timeoutMs < 100 || test.timeoutMs > 1800000)) throw new Error('Invalid test timeoutMs');
    // This is an obvious-configuration check, not a shell security boundary. The OS sandbox is the boundary.
    const command = [test.command, ...test.args].join(' ');
    if (/\b(supabase|psql|pgcli|deploy|publish)\b|\bgit\b.*\bpush\b/i.test(command)) throw new Error('SQL execution, deployment and Git push are manual-only');
  }
  return { maxIterations, timeoutMs };
}
async function snapshot() {
  const names = (await run('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'])).stdout.split('\0').filter(Boolean);
  const result = {};
  for (const name of [...new Set(names)].sort()) {
    if (name.startsWith('.agent-bridge-runtime/')) continue;
    const file = path.join(root, name);
    try {
      const stat = await lstat(file);
      const bytes = stat.isSymbolicLink() ? await readlink(file) : stat.isFile() ? await readFile(file) : 'directory';
      result[name] = `${stat.mode}:${createHash('sha256').update(bytes).digest('hex')}`;
    } catch (error) { if (error.code !== 'ENOENT') throw error; result[name] = 'deleted'; }
  }
  result['@git-head'] = (await run('git', ['rev-parse', '--verify', 'HEAD'])).stdout.trim();
  return result;
}
function snapshotChanges(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(key => before[key] !== after[key]);
}
async function assertUnchanged(before, label, allowed = []) {
  const changes = snapshotChanges(before, await snapshot()).filter(p => !allowed.includes(p));
  if (changes.length) throw new Error(`${label} modified protected files: ${changes.join(', ')}`);
}
async function lockRun() {
  const lockFile = path.join(path.dirname(runtimeRoot), 'LOCK.json');
  await mkdir(path.dirname(runtimeRoot), { recursive: true });
  try { lockHandle = await open(lockFile, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') throw new Error(`Another run or stale lock exists: ${lockFile}. Verify the recorded PID before removing it.`); throw error; }
  await lockHandle.writeFile(JSON.stringify({ pid: process.pid, root, startedAt: new Date().toISOString() }) + '\n');
}
async function unlockRun() {
  if (!lockHandle) return;
  await lockHandle.close(); lockHandle = undefined;
  await unlink(path.join(path.dirname(runtimeRoot), 'LOCK.json'));
}

// Local validation commands have no model/API access. macOS Seatbelt is deliberately fail-closed.
async function testSandbox(runDir) {
  if (process.platform !== 'darwin' || !existsSync('/usr/bin/sandbox-exec')) throw new Error('Local tests require macOS sandbox-exec; configure isolation before using another OS');
  const temp = path.join(runDir, 'test-tmp');
  await mkdir(temp, { recursive: true });
  const quote = p => JSON.stringify(p);
  const profile = `(version 1)
(allow default)
(deny network*)
(deny file-read-data)
(allow file-read-data (literal "/"))
(allow file-read-data ${[root, '/System', '/usr', '/bin', '/sbin', '/Library', '/private/etc', '/private/var/db', '/dev', '/opt/homebrew', path.dirname(process.execPath)].map(p => `(subpath ${quote(p)})`).join(' ')})
(deny file-write*)
(allow file-write* (subpath ${quote(root)}) (literal "/dev/null"))
(deny file-write* (subpath ${quote(path.join(root, '.git'))}) (subpath ${quote(bridgeDir)}) (subpath ${quote(path.dirname(runtimeRoot))}))
(deny file-write* ${['.agents', '.codex', '.gemini'].map(p => `(subpath ${quote(path.join(root, p))})`).join(' ')})
(allow file-write* (subpath ${quote(temp)}))
(deny file-read-data file-write* (regex #"^/.*/[.]env($|[./].*)"))
`;
  const profilePath = path.join(runDir, 'tests.sb');
  await writeFile(profilePath, profile);
  // No inherited API keys, DB URLs, shell hooks or NODE_OPTIONS.
  const env = Object.fromEntries(['PATH', 'LANG', 'LC_ALL', 'TZ'].filter(k => process.env[k]).map(k => [k, process.env[k]]));
  Object.assign(env, { HOME: temp, TMPDIR: temp, npm_config_cache: path.join(temp, 'npm-cache'), CI: '1', AGENT_BRIDGE_TEST_SANDBOX: 'macos-no-network' });
  return { profilePath, env };
}
async function executeTests(config, runDir, iteration, timeoutMs) {
  const sandbox = await testSandbox(runDir);
  const testResults = [];
  for (const test of config.tests) {
    console.log(`[local-tests] ${test.name}`);
    const result = await run('/usr/bin/sandbox-exec', ['-f', sandbox.profilePath, test.command, ...test.args], {
      timeoutMs: test.timeoutMs ?? timeoutMs, env: sandbox.env,
      logFile: path.join(runDir, `test-${iteration}-${test.name}.log`), allowFailure: true,
    });
    testResults.push({ name: test.name, command: [test.command, ...test.args].join(' '),
      status: result.exitCode === 0 && !result.timedOut ? 'passed' : 'failed',
      exitCode: result.exitCode, signal: result.signal, timedOut: result.timedOut, durationMs: result.durationMs,
      outputTail: result.exitCode === 0 && !result.timedOut ? '' : tail(result.stdout + '\n' + result.stderr) });
  }
  const document = { status: testResults.every(t => t.status === 'passed') ? 'passed' : 'failed',
    runId: activeRun.state.runId, generatedAt: new Date().toISOString(), iteration, commands: testResults };
  await writeFile(files.tests, JSON.stringify(document, null, 2) + '\n');
  await writeFile(path.join(runDir, `TEST_RESULTS-${iteration}.json`), JSON.stringify(document, null, 2) + '\n');
  return document;
}
const manualPolicy = `Work only within ${root}. Do not access sibling projects. Never execute SQL, Supabase operations, migrations, Git push, deploy, publish, send messages, or change live external data. SQL files may be drafted for the user to execute manually. Do not use MCP tools or network tools. List required manual actions in your report. Do not delegate or spawn subagents.`;
async function assertNoAntigravityMcp(bin) {
  const result = await run(bin, ['mcp', 'list']);
  // CLI 1.2.9 has no per-invocation MCP-disable flag. Fail closed if its inventory
  // is nonempty or its format changes; never alter the user's global MCP settings.
  if (result.stdout.trim() !== 'No MCP servers configured.') {
    throw new Error('Antigravity MCP inventory is not confirmed empty. Disable/remove MCP configuration for this automation profile before running; see agy mcp list.');
  }
}
async function codexDocument(bin, model, effort, prompt, outputFile, logFile, timeoutMs) {
  const before = await snapshot();
  await run(bin, ['exec', '-C', root, '--sandbox', 'read-only', '--ignore-user-config', '--ephemeral',
    ...codexModelArgs(model, effort), '-c', 'approval_policy="never"',
    '-o', outputFile, `${prompt}\n${manualPolicy}\nDo not write any files. Return the complete Markdown document as your final response; the orchestrator will save it.`], { timeoutMs, logFile });
  await assertUnchanged(before, 'Read-only Codex stage');
  const document = await readFile(outputFile, 'utf8');
  if (!document.trim()) throw new Error('Codex returned an empty document');
  return document;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return usage();
  await checkWorkspace();
  if (options.action === 'init') return initializeBridge();
  const codexBin = process.env.CODEX_BIN || 'codex';
  const antigravityBin = process.env.AGY_BIN || 'agy';
  if (options.action === 'doctor') {
    const checks = [];
    for (const [name, command] of [['codex', codexBin], ['antigravity', antigravityBin], ['git', 'git']]) {
      try {
        const result = await run(command, ['--version'], { allowFailure: true });
        checks.push({ name, command, available: result.exitCode === 0, version: tail(result.stdout || result.stderr, 2, 500).trim() });
      } catch (error) { checks.push({ name, command, available: false, error: error.message }); }
    }
    console.log(JSON.stringify({ project: root, bridgeDir: bridgeRelative, initialized: existsSync(files.config), checks,
      authentication: 'not_checked', modelAccess: 'not_checked', antigravityProjectPermissions: 'not_checked',
      testSandbox: process.platform === 'darwin' && existsSync('/usr/bin/sandbox-exec') ? 'available_not_executed' : 'unsupported' }, null, 2));
    if (!existsSync(files.config) || checks.some(c => !c.available)) process.exitCode = 1;
    return;
  }
  await Promise.all(['request', 'config'].map(key => assertExists(files[key])));
  const config = JSON.parse(await readFile(files.config, 'utf8'));
  const { maxIterations, timeoutMs } = validateConfig(config, options);
  const models = resolveModels(config, options.models);
  const reasoningEffort = resolveReasoningEffort(config, options.reasoningEffort);
  const requestText = options.requestFile ? await readFile(path.resolve(root, options.requestFile), 'utf8')
    : options.request !== undefined ? `# 작업 요청\n\n${options.request.trim()}\n` : await readFile(files.request, 'utf8');
  if (options.dryRun) {
    console.log(JSON.stringify({ project: root, codexBin, antigravityBin, models, reasoningEffort,
      antigravityArgs: [...geminiInvocation(models.gemini, reasoningEffort.gemini), ...(config.antigravityProject ? ['--project', config.antigravityProject] : []), '--mode=accept-edits', '--sandbox'], maxIterations,
      tests: config.tests, codexSandbox: 'read-only', testSandbox: 'macos-no-network', manualOnly: ['SQL execution', 'Git push', 'deploy'] }, null, 2));
    return;
  }
  if (options.action !== 'check' && (!requestText.trim() || requestText.includes('여기에 이번 실행에서 달성할 목표를 작성합니다'))) throw new Error('Write REQUEST.md or supply --request first');
  const dirty = changedPaths(await gitStatus()).filter(p => p !== path.relative(root, files.request));
  if (dirty.length && !options.allowDirty) throw new Error(`The Git working tree contains changes outside REQUEST.md: ${dirty.join(', ')}`);
  await lockRun();
  const id = runId();
  const runDir = path.join(runtimeRoot, id);
  await mkdir(runDir, { recursive: true });
  const state = { runId: id, status: 'running', stage: options.action === 'check' ? 'local-tests' : 'codex-plan', iteration: 0,
    project: root, requestedModels: models, requestedReasoningEffort: reasoningEffort };
  activeRun = { runDir, state };
  await writeState(runDir, state);
  await testSandbox(runDir);
  if (options.action === 'check') {
    const before = await snapshot();
    const results = await executeTests(config, runDir, 0, timeoutMs);
    await assertUnchanged(before, 'Tests', [path.relative(root, files.tests)]);
    state.status = results.status; state.stage = 'complete'; await writeState(runDir, state);
    if (results.status !== 'passed') throw new Error('Local validation failed; see TEST_RESULTS.json');
    console.log('Local validation passed (no models called).'); return;
  }
  await assertNoAntigravityMcp(antigravityBin);
  await writeFile(files.request, requestText);
  await writeFile(files.review, '# Codex 독립 검토\n\nVerdict: NOT_RUN\n');
  await writeFile(files.tests, JSON.stringify({ runId: id, status: 'not_run', commands: [] }, null, 2) + '\n');
  await writeFile(path.join(runDir, 'REQUEST.md'), requestText);
  await writeFile(path.join(runDir, 'pipeline.config.json'), JSON.stringify(config, null, 2));
  console.log('[codex-plan] drafting command');
  const command = await codexDocument(codexBin, models.codexPlan, reasoningEffort.codexPlan,
    `You are the planning agent. Read repository instructions and ${bridgeRelative}/REQUEST.md. Return an implementation assignment with scope, non-goals, acceptance criteria and relevant tests. Gemini implements code and writes ${bridgeRelative}/REPORT.md including manual actions. The orchestrator exclusively runs tests from pipeline.config.json; do not instruct Gemini to execute commands. Request changes to test configuration from the user if coverage is insufficient.`,
    path.join(runDir, 'COMMAND.md'), path.join(runDir, 'codex-plan.log'), timeoutMs);
  await writeFile(files.command, command);
  const protectedFiles = [path.relative(root, files.config), 'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
    path.relative(root, files.policy), path.relative(root, files.readme),
    path.relative(root, files.command), path.relative(root, files.request), path.relative(root, files.tests), path.relative(root, files.review)];
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    state.iteration = iteration; state.stage = iteration === 1 ? 'gemini-implement' : 'gemini-fix';
    await writeState(runDir, state);
    const pendingReport = `# Gemini report\n\nRun: ${id}\nIteration: ${iteration}\nStatus: NOT_RUN\n`;
    await writeFile(files.report, pendingReport);
    const beforeImplementation = await snapshot();
    console.log(`[${state.stage}] Antigravity is implementing`);
    await assertNoAntigravityMcp(antigravityBin);
    const result = await run(antigravityBin, [...geminiInvocation(models.gemini, reasoningEffort.gemini),
      ...(config.antigravityProject ? ['--project', config.antigravityProject] : []),
      '--mode=accept-edits', '--sandbox', '--output-format', 'json', '--print-timeout', `${timeoutMs}ms`, '-p',
      `Work directly in ${root}; do not delegate, spawn subagents, or finish with a plan. Read repository instructions and ${files.command}${iteration > 1 ? ` and ${files.review}` : ''}. Implement the assignment${iteration > 1 ? ' and fix review findings' : ''} using file tools. Do not execute shell commands; the orchestrator runs tests. Preserve unrelated existing work. Do not edit pipeline controls, package scripts, lock files or permission settings. Write ${files.report} with changed files, limitations, tests marked NOT_RUN (or delegated), and manual actions. Replace its NOT_RUN status with COMPLETED or BLOCKED. ${manualPolicy}`],
      { timeoutMs: timeoutMs + 5000, logFile: path.join(runDir, `gemini-${iteration}.log`) });
    await checkWorkspace();
    const afterImplementation = await snapshot();
    const illegal = snapshotChanges(beforeImplementation, afterImplementation).filter(p => protectedFiles.includes(p) || p === '@git-head' || /(^|\/)(AGENTS\.md|GEMINI\.md)$/.test(p) || /^(\.agents|\.codex|\.gemini)\//.test(p));
    if (illegal.length) throw new Error(`Implementation modified protected files: ${illegal.join(', ')}`);
    let envelope;
    try { envelope = JSON.parse(result.stdout); } catch { throw new Error('Antigravity did not return a JSON result; inspect its log'); }
    if (envelope.status !== 'SUCCESS' || /auto-denied|authentication required/i.test(result.stderr)) throw new Error(`Antigravity did not complete: ${envelope.status || 'unknown'}; check permissions/authentication and run logs`);
    const report = await readFile(files.report, 'utf8');
    if (report === pendingReport || !/^Status:\s*COMPLETED\s*$/m.test(report) || /^Status:\s*(NOT_RUN|BLOCKED)\s*$/m.test(report)) throw new Error('Antigravity did not produce a completed report; stopping before paid review');
    await writeFile(path.join(runDir, `REPORT-${iteration}.md`), report);
    state.stage = 'local-tests'; await writeState(runDir, state);
    const testBaseline = await snapshot();
    const testDocument = await executeTests(config, runDir, iteration, timeoutMs);
    await assertUnchanged(testBaseline, 'Tests', [path.relative(root, files.tests)]);
    if (testDocument.status !== 'passed') {
      // Deterministic repair instructions avoid paying a reviewer to repeat a test failure.
      await writeFile(files.review, '# Codex 독립 검토\n\nVerdict: CHANGES_REQUIRED\n\nAutomated test gate failed; Codex review was not run. Read TEST_RESULTS.json and fix failing tests without weakening their assertions.\n');
      continue;
    }
    state.stage = 'codex-review'; await writeState(runDir, state);
    console.log('[codex-review] reviewing implementation and test evidence');
    const review = await codexDocument(codexBin, models.codexReview, reasoningEffort.codexReview,
      `Act as an independent code reviewer. Read repository instructions, ${files.command}, ${files.report}, ${files.tests}. Inspect actual git diff AND untracked files. Do not rerun the full suite; use its recorded result, inspect coverage and identify missing tests. Return Markdown beginning with '# Codex 독립 검토', followed by exactly one 'Verdict: APPROVED' or 'Verdict: CHANGES_REQUIRED'. List findings with file references, verified checks and required manual actions. Approve only if requirements and coverage are satisfied. SQL execution and Git push remain manual even when approved.`,
      path.join(runDir, `REVIEW-${iteration}.md`), path.join(runDir, `codex-review-${iteration}.log`), timeoutMs);
    const verdicts = [...review.matchAll(/^Verdict:\s*(APPROVED|CHANGES_REQUIRED)\s*$/gm)];
    if (verdicts.length !== 1) throw new Error('Fresh reviewer response must contain exactly one valid verdict');
    await writeFile(files.review, review);
    if (verdicts[0][1] === 'APPROVED') {
      state.status = 'approved'; state.stage = 'complete'; await writeState(runDir, state);
      console.log(`Agent bridge approved after ${iteration} iteration(s). SQL execution, Git push and deployment remain manual.`); return;
    }
  }
  state.status = 'changes_required'; await writeState(runDir, state);
  throw new Error(`Changes remain after ${maxIterations} iteration(s). See REVIEW.md and TEST_RESULTS.json`);
}

let stopping = false;
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  if (stopping) return; stopping = true;
  for (const child of children) stopChild(child, signal);
  setTimeout(async () => {
    for (const child of children) stopChild(child, 'SIGKILL');
    if (activeRun) { activeRun.state.status = 'interrupted'; await writeState(activeRun.runDir, activeRun.state).catch(() => {}); }
    await unlockRun().catch(() => {});
    process.exit(130);
  }, 2000);
});
main().catch(async error => {
  if (activeRun) {
    if (activeRun.state.status === 'running') activeRun.state.status = stopping ? 'interrupted' : 'failed';
    activeRun.state.error = error.message;
    await writeState(activeRun.runDir, activeRun.state).catch(() => {});
  }
  console.error(`[agent-bridge] ${error.message}`); process.exitCode = 1;
}).finally(unlockRun);
