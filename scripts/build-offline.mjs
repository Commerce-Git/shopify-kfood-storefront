#!/usr/bin/env node
// This is a compilation/prerender check with synthetic values, never a deployable build.
// Turbopack requires a local listening port for PostCSS; webpack supports a fully network-denied check.
// agent-bridge executes this script inside its no-network, no-secret sandbox.
import { spawn } from "node:child_process";

// Prevent accidental direct execution with access to the developer's .env files.
// This marker is an invocation guard; the OS profile in agent-bridge is the security boundary.
if (process.env.AGENT_BRIDGE_TEST_SANDBOX !== "macos-no-network") {
  console.error("Run this check through agent-bridge check so network and secrets are sandboxed.");
  process.exit(1);
}

const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], {
  stdio: "inherit",
  env: {
    ...Object.fromEntries(["PATH", "HOME", "TMPDIR", "LANG", "LC_ALL", "TZ"].filter(key => process.env[key]).map(key => [key, process.env[key]])),
    CI: "1",
    NODE_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
    STOREFRONT_OFFLINE_CHECK: "1",
    NEXT_PUBLIC_SUPABASE_URL: "https://supabase.invalid",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "offline-anon-placeholder",
    SUPABASE_SERVICE_ROLE_KEY: "offline-service-placeholder",
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "offline.invalid",
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: "offline-token",
    RESEND_API_KEY: "re_offline_placeholder",
  },
});
child.on("error", error => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code, signal) => { process.exitCode = signal ? 1 : code ?? 1; });
