#!/usr/bin/env node
/**
 * Runs after npm install. On global installs, wires Cursor MCP + Skill
 * (and other clients if their config dirs already exist).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "dist", "index.js");

if (process.env.ARVANCAI_SKIP_SETUP === "1") {
  process.exit(0);
}

const isGlobal = process.env.npm_config_global === "true";
const force = process.env.ARVANCAI_AUTO_SETUP === "1";

if (!isGlobal && !force) {
  console.error("[arvancai] Installed. Wire clients with: arvancai setup");
  process.exit(0);
}

if (!existsSync(entry)) {
  console.error("[arvancai] dist/ missing; skip auto-setup. Run: npm run build && arvancai setup");
  process.exit(0);
}

console.error("[arvancai] Auto-setup (MCP + Skill)…");
const result = spawnSync(process.execPath, [entry, "setup"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 0);
