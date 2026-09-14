import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { jsonSchemaToZod, jsonSchemaToZodShape } from "../src/bridge/json-schema-to-zod.js";
import { officialMcpApiKeyHeader } from "../src/client/auth.js";
import { bridgeOfficialMcp } from "../src/bridge/official-mcp.js";
import { McpServer } from "@modelcontextprotocol/server";

describe("officialMcpApiKeyHeader", () => {
  it("prefixes bare UUID", () => {
    expect(officialMcpApiKeyHeader("abc-123")).toBe("apikey abc-123");
  });

  it("keeps existing apikey scheme", () => {
    expect(officialMcpApiKeyHeader("apikey xyz")).toBe("apikey xyz");
  });

  it("normalizes Authorization-style Apikey prefix", () => {
    expect(officialMcpApiKeyHeader("Apikey xyz")).toBe("apikey xyz");
  });
});

describe("jsonSchemaToZod", () => {
  it("maps object properties and required", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: {
        name: { type: "string", description: "Space name" },
        retention: { type: "integer" },
      },
      required: ["name"],
    });
    expect(schema.parse({ name: "prod" })).toEqual({ name: "prod" });
    expect(() => schema.parse({})).toThrow();
    expect(schema.parse({ name: "a", retention: 30, extra: true })).toMatchObject({
      name: "a",
      retention: 30,
      extra: true,
    });
  });

  it("builds prompt shape", () => {
    const shape = jsonSchemaToZodShape({
      type: "object",
      properties: { domain: { type: "string" } },
      required: ["domain"],
    });
    expect(z.object(shape).parse({ domain: "a.com" })).toEqual({ domain: "a.com" });
  });
});

describe("bridgeOfficialMcp", () => {
  beforeEach(() => {
    process.env.ARVANCLOUD_OFFICIAL_MCP = "0";
  });

  afterEach(() => {
    delete process.env.ARVANCLOUD_OFFICIAL_MCP;
  });

  it("no-ops when disabled", async () => {
    const server = new McpServer({ name: "t", version: "0" });
    const r = await bridgeOfficialMcp(server, { apiKey: "k" });
    expect(r.connected).toBe(false);
    expect(r.error).toBe("disabled");
    expect(r.tools).toBe(0);
  });

  it("soft-fails when remote unreachable", async () => {
    process.env.ARVANCLOUD_OFFICIAL_MCP = "1";
    process.env.ARVANCLOUD_OFFICIAL_MCP_URL = "https://127.0.0.1:1";
    process.env.ARVANCLOUD_OFFICIAL_MCP_TIMEOUT_MS = "500";
    const server = new McpServer({ name: "t", version: "0" });
    const r = await bridgeOfficialMcp(server, { apiKey: "k", timeoutMs: 500 });
    expect(r.connected).toBe(false);
    expect(r.error).toBeTruthy();
  });
});

describe("createServer with bridge disabled", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.ARVANCLOUD_API_KEY = "test-key";
    process.env.ARVANCLOUD_OFFICIAL_MCP = "0";
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.ARVANCLOUD_API_KEY;
    delete process.env.ARVANCLOUD_OFFICIAL_MCP;
  });

  it("creates server without throwing", async () => {
    const { createServer } = await import("../src/server/create-server.js");
    const server = await createServer();
    expect(server).toBeTruthy();
  });
});
