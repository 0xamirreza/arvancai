import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { binEntryPath, skillSourceDir } from "./package-root.js";

export type SetupResult = {
  host: string;
  path: string;
  action: "created" | "updated" | "copied" | "skipped" | "failed";
  detail?: string;
};

const PLACEHOLDER = "<MU-KEY>";

export function resolveApiKey(existing?: string): string {
  const fromEnv = process.env.ARVANCLOUD_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (existing && existing !== PLACEHOLDER && existing.length > 0) return existing;
  return PLACEHOLDER;
}

export function mcpServerEntry(apiKey: string): Record<string, unknown> {
  // Absolute node + bin path so GUI apps without nvm PATH still work.
  return {
    command: process.execPath,
    args: [binEntryPath()],
    env: {
      ARVANCLOUD_API_KEY: apiKey,
    },
  };
}

function readJson(file: string): Record<string, unknown> {
  if (!existsSync(file)) return {};
  try {
    const raw = readFileSync(file, "utf8");
    if (!raw.trim()) return {};
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function writeJson(file: string, data: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/** Merge arvancai into a classic `{ mcpServers: { ... } }` file. */
export function mergeMcpServersFile(file: string, apiKey: string): SetupResult {
  const host = path.basename(path.dirname(file)) + "/" + path.basename(file);
  try {
    const doc = readJson(file);
    const servers =
      doc.mcpServers && typeof doc.mcpServers === "object" && !Array.isArray(doc.mcpServers)
        ? ({ ...(doc.mcpServers as Record<string, unknown>) } as Record<string, unknown>)
        : {};
    const prev = servers.arvancai as { env?: { ARVANCLOUD_API_KEY?: string } } | undefined;
    const key = apiKey !== PLACEHOLDER ? apiKey : resolveApiKey(prev?.env?.ARVANCLOUD_API_KEY);
    const existed = Boolean(servers.arvancai);
    servers.arvancai = mcpServerEntry(key);
    doc.mcpServers = servers;
    writeJson(file, doc);
    return { host, path: file, action: existed ? "updated" : "created" };
  } catch (err) {
    return {
      host,
      path: file,
      action: "failed",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

/** OpenCode uses `{ mcp: { name: {...} } }`. */
export function mergeOpenCodeFile(file: string, apiKey: string): SetupResult {
  const host = "opencode/" + path.basename(file);
  try {
    const doc = readJson(file);
    const mcp =
      doc.mcp && typeof doc.mcp === "object" && !Array.isArray(doc.mcp)
        ? ({ ...(doc.mcp as Record<string, unknown>) } as Record<string, unknown>)
        : {};
    const prev = mcp.arvancai as { env?: { ARVANCLOUD_API_KEY?: string } } | undefined;
    const key = apiKey !== PLACEHOLDER ? apiKey : resolveApiKey(prev?.env?.ARVANCLOUD_API_KEY);
    const existed = Boolean(mcp.arvancai);
    mcp.arvancai = mcpServerEntry(key);
    doc.mcp = mcp;
    writeJson(file, doc);
    return { host, path: file, action: existed ? "updated" : "created" };
  } catch (err) {
    return {
      host,
      path: file,
      action: "failed",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

export function copySkill(destDir: string): SetupResult {
  try {
    const src = skillSourceDir();
    mkdirSync(path.dirname(destDir), { recursive: true });
    cpSync(src, destDir, { recursive: true });
    // Ensure SKILL.md is present (cpSync is enough; touch for clarity)
    if (!existsSync(path.join(destDir, "SKILL.md"))) {
      copyFileSync(path.join(src, "SKILL.md"), path.join(destDir, "SKILL.md"));
    }
    return { host: "cursor-skill", path: destDir, action: "copied" };
  } catch (err) {
    return {
      host: "cursor-skill",
      path: destDir,
      action: "failed",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

function home(...parts: string[]): string {
  return path.join(os.homedir(), ...parts);
}

export function discoverTargets(): Array<{
  kind: "mcpServers" | "opencode" | "skill";
  file: string;
}> {
  const targets: Array<{ kind: "mcpServers" | "opencode" | "skill"; file: string }> = [
    { kind: "mcpServers", file: home(".cursor", "mcp.json") },
    { kind: "skill", file: home(".cursor", "skills", "arvancai") },
    { kind: "mcpServers", file: home(".codeium", "windsurf", "mcp_config.json") },
    { kind: "mcpServers", file: home(".config", "Claude", "claude_desktop_config.json") },
    { kind: "mcpServers", file: home("Library", "Application Support", "Claude", "claude_desktop_config.json") },
    { kind: "mcpServers", file: home(".codex", "mcp.json") },
    { kind: "opencode", file: home(".config", "opencode", "opencode.json") },
  ];
  return targets;
}

export type RunSetupOptions = {
  apiKey?: string;
  /** Only write MCP configs whose parent dir already exists (except Cursor). */
  preferExistingHosts?: boolean;
};

export function runSetup(opts: RunSetupOptions = {}): SetupResult[] {
  const apiKey = resolveApiKey(opts.apiKey);
  const results: SetupResult[] = [];
  const prefer = opts.preferExistingHosts ?? false;

  for (const t of discoverTargets()) {
    if (t.kind === "skill") {
      results.push(copySkill(t.file));
      continue;
    }

    const parent = path.dirname(t.file);
    const isCursor = t.file.includes(`${path.sep}.cursor${path.sep}`);
    if (prefer && !isCursor && !existsSync(parent) && !existsSync(t.file)) {
      results.push({
        host: path.basename(parent),
        path: t.file,
        action: "skipped",
        detail: "host config directory not found",
      });
      continue;
    }

    if (t.kind === "opencode") {
      if (prefer && !existsSync(parent) && !existsSync(t.file)) {
        results.push({
          host: "opencode",
          path: t.file,
          action: "skipped",
          detail: "host config directory not found",
        });
        continue;
      }
      results.push(mergeOpenCodeFile(t.file, apiKey));
      continue;
    }

    results.push(mergeMcpServersFile(t.file, apiKey));
  }

  return results;
}
