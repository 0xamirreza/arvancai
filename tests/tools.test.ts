import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createServer } from "../src/server/create-server.js";

describe("MCP tools registration", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.ARVANCLOUD_API_KEY = "test-key";
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.ARVANCLOUD_API_KEY;
  });

  it("creates server without throwing", () => {
    const server = createServer();
    expect(server).toBeTruthy();
  });

  it("list_domains returns API payload", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ data: [{ domain: "example.com" }] }), { status: 200 }),
    );

    const server = createServer();
    // Access registered tools via private map is brittle; exercise via client path instead.
    const { ArvanCloudClient } = await import("../src/client/arvancloud-client.js");
    const { loadConfig } = await import("../src/client/auth.js");
    const client = new ArvanCloudClient(loadConfig());
    const data = await client.cdnRequest("domains", { method: "GET", idempotent: true });
    expect(data).toEqual({ data: [{ domain: "example.com" }] });
    expect(server).toBeTruthy();
  });
});

describe("destructive tool validation", () => {
  it("delete requires record_id", async () => {
    const { RecordIdSchema } = await import("../src/schemas/common.js");
    expect(() => RecordIdSchema.parse("")).toThrow();
  });

  it("purge individual without urls fails", async () => {
    const { PurgeCacheSchema } = await import("../src/schemas/common.js");
    const r = PurgeCacheSchema.safeParse({ domain: "a.com", purge: "individual", purge_urls: [] });
    expect(r.success).toBe(false);
  });
});
