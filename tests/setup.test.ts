import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { mergeMcpServersFile, mergeOpenCodeFile, resolveApiKey } from "../src/cli/setup.js";

const temps: string[] = [];

afterEach(() => {
  for (const t of temps.splice(0)) {
    rmSync(t, { recursive: true, force: true });
  }
});

function tempDir(): string {
  const d = mkdtempSync(path.join(os.tmpdir(), "arvancai-setup-"));
  temps.push(d);
  return d;
}

describe("resolveApiKey", () => {
  it("prefers env", () => {
    const prev = process.env.ARVANCLOUD_API_KEY;
    process.env.ARVANCLOUD_API_KEY = "from-env";
    expect(resolveApiKey("old")).toBe("from-env");
    if (prev === undefined) delete process.env.ARVANCLOUD_API_KEY;
    else process.env.ARVANCLOUD_API_KEY = prev;
  });
});

describe("mergeMcpServersFile", () => {
  it("creates mcpServers and preserves siblings", () => {
    const dir = tempDir();
    const file = path.join(dir, "mcp.json");
    writeFileSync(
      file,
      JSON.stringify({ mcpServers: { other: { command: "x" } } }, null, 2),
    );
    const r = mergeMcpServersFile(file, "key-1");
    expect(r.action).toBe("created");
    const doc = JSON.parse(readFileSync(file, "utf8")) as {
      mcpServers: { other: unknown; arvancai: { env: { ARVANCLOUD_API_KEY: string }; args: string[] } };
    };
    expect(doc.mcpServers.other).toEqual({ command: "x" });
    expect(doc.mcpServers.arvancai.env.ARVANCLOUD_API_KEY).toBe("key-1");
    expect(doc.mcpServers.arvancai.args[0]).toMatch(/arvancai\.js$/);
  });

  it("keeps existing key when placeholder passed", () => {
    const dir = tempDir();
    const file = path.join(dir, "mcp.json");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      file,
      JSON.stringify({
        mcpServers: {
          arvancai: { command: "old", env: { ARVANCLOUD_API_KEY: "keep-me" } },
        },
      }),
    );
    const prev = process.env.ARVANCLOUD_API_KEY;
    delete process.env.ARVANCLOUD_API_KEY;
    const r = mergeMcpServersFile(file, "<MU-KEY>");
    expect(r.action).toBe("updated");
    const doc = JSON.parse(readFileSync(file, "utf8")) as {
      mcpServers: { arvancai: { env: { ARVANCLOUD_API_KEY: string } } };
    };
    expect(doc.mcpServers.arvancai.env.ARVANCLOUD_API_KEY).toBe("keep-me");
    if (prev === undefined) delete process.env.ARVANCLOUD_API_KEY;
    else process.env.ARVANCLOUD_API_KEY = prev;
  });
});

describe("mergeOpenCodeFile", () => {
  it("writes mcp map", () => {
    const dir = tempDir();
    const file = path.join(dir, "opencode.json");
    const r = mergeOpenCodeFile(file, "k2");
    expect(["created", "updated"]).toContain(r.action);
    expect(existsSync(file)).toBe(true);
    const doc = JSON.parse(readFileSync(file, "utf8")) as {
      mcp: { arvancai: { env: { ARVANCLOUD_API_KEY: string } } };
    };
    expect(doc.mcp.arvancai.env.ARVANCLOUD_API_KEY).toBe("k2");
  });
});
