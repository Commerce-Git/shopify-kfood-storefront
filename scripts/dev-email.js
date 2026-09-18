const { execSync, spawn } = require("child_process");

// 1. Check and terminate any process occupying port 3003
try {
  const pids = execSync("lsof -ti :3003", { encoding: "utf8" }).trim();
  if (pids) {
    const pidList = pids.split("\n").map((p) => p.trim()).filter(Boolean);
    console.log(`🧹 포트 3003을 점유 중인 기존 프로세스를 정리합니다 (PID: ${pidList.join(", ")})...`);
    for (const pid of pidList) {
      try {
        process.kill(Number(pid), "SIGKILL");
      } catch {}
    }
    // Give OS socket a brief moment to close
    execSync("sleep 0.2");
  }
} catch {
  // Port 3003 is already free
}

console.log("⚡️ React Email 프리뷰 서버를 포트 3003에서 시작합니다 (http://localhost:3003)...");

// 2. Start react-email dev server on port 3003 exclusively
const child = spawn("npx", ["email", "dev", "-p", "3003"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});

process.on("SIGINT", () => {
  child.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  child.kill("SIGTERM");
  process.exit(0);
});
