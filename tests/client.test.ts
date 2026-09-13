import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ArvanCloudClient } from "../src/client/arvancloud-client.js";
import { loadConfig, authHeaders } from "../src/client/auth.js";
import { ArvanCloudError } from "../src/client/errors.js";
import { PurgeCacheSchema, CreateDnsRecordSchema, DomainNameSchema } from "../src/schemas/common.js";

describe("auth", () => {
  it("requires API key", () => {
    expect(() => loadConfig({})).toThrow(/ARVANCLOUD_API_KEY/);
  });

  it("loads defaults", () => {
    const cfg = loadConfig({ ARVANCLOUD_API_KEY: "test-key" });
    expect(cfg.cdnBaseUrl).toBe("https://napi.arvancloud.ir/cdn/4.0");
    expect(cfg.eccBaseUrl).toBe("https://napi.arvancloud.ir/ecc/v1");
    expect(cfg.vodBaseUrl).toBe("https://napi.arvancloud.ir/vod/2.0");
    expect(cfg.edgeBaseUrl).toBe("https://napi.arvancloud.ir/edge-computing/v1");
    expect(cfg.liveBaseUrl).toBe("https://napi.arvancloud.ir/live/2.0");
    expect(cfg.vadsBaseUrl).toBe("https://napi.arvancloud.ir/vads/2.0");
    expect(cfg.aiaasBaseUrl).toBe("https://napi.arvancloud.ir/ai/v1");
    expect(cfg.caasZonesBaseUrl).toBe("https://napi.arvancloud.ir/caas/v2/zones");
    expect(cfg.eccV3BaseUrlTemplate).toBe("https://ecc.{region}.arvanapis.ir/v3");
    expect(cfg.storageApiBaseUrl).toBe("https://storage.arvanapis.ir/v1");
    expect(cfg.loggingBaseUrl).toBe("https://napi.arvancloud.ir/logging/v1");
    expect(cfg.s3Endpoint).toBe("https://s3.ir-thr-at1.arvanstorage.ir");
    expect(authHeaders("test-key").Authorization).toBe("test-key");
  });

  it("formats CloudLogs Authorization with Apikey prefix", async () => {
    const { loggingAuthHeaders } = await import("../src/client/auth.js");
    expect(loggingAuthHeaders("raw-key").Authorization).toBe("Apikey raw-key");
    expect(loggingAuthHeaders("Apikey already").Authorization).toBe("Apikey already");
  });
});

describe("schemas", () => {
  it("accepts valid domain", () => {
    expect(DomainNameSchema.parse("example.com")).toBe("example.com");
  });

  it("rejects invalid domain", () => {
    expect(() => DomainNameSchema.parse("http://example.com")).toThrow();
  });

  it("requires purge_urls for individual purge", () => {
    const r = PurgeCacheSchema.safeParse({
      domain: "example.com",
      purge: "individual",
    });
    expect(r.success).toBe(false);
  });

  it("rejects purge_urls with purge=all", () => {
    const r = PurgeCacheSchema.safeParse({
      domain: "example.com",
      purge: "all",
      purge_urls: ["https://example.com/a"],
    });
    expect(r.success).toBe(false);
  });

  it("accepts create dns record shape", () => {
    const r = CreateDnsRecordSchema.parse({
      domain: "example.com",
      type: "A",
      name: "www",
      value: [{ ip: "1.2.3.4", country: "" }],
      ttl: 120,
      cloud: false,
    });
    expect(r.type).toBe("A");
  });
});

describe("ArvanCloudClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function client() {
    return new ArvanCloudClient(
      loadConfig({ ARVANCLOUD_API_KEY: "secret-key-do-not-leak" }),
    );
  }

  it("sends Authorization header as-is", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await client().cdnRequest("domains", { method: "GET", idempotent: true });
    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.headers.Authorization).toBe("secret-key-do-not-leak");
    expect(init.headers.Accept).toBe("application/json");
  });

  it("maps 401 to authentication error", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ message: "Unauthenticated." }), { status: 401 }),
    );

    await expect(client().cdnRequest("domains", { method: "GET" })).rejects.toMatchObject({
      className: "authentication",
      message: "Unauthenticated.",
    });
  });

  it("maps 404 to not_found", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ message: "Not found" }), { status: 404 }),
    );

    await expect(
      client().cdnRequest("domains/missing.example", { method: "GET" }),
    ).rejects.toBeInstanceOf(ArvanCloudError);
  });

  it("does not retry non-idempotent POST on 500", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ message: "fail" }), { status: 500 }),
    );

    await expect(
      client().cdnRequest("domains/dns-service", {
        method: "POST",
        body: { domain: "x.com", domain_type: "full" },
      }),
    ).rejects.toMatchObject({ className: "server" });

    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it("retries GET on 429 then succeeds", async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "slow down" }), {
          status: 429,
          headers: { "retry-after": "0" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      );

    const data = await client().cdnRequest("domains", { method: "GET", idempotent: true });
    expect(data).toEqual({ data: [] });
    expect(fetchMock.mock.calls.length).toBe(2);
  });

  it("builds CDN URLs correctly", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    await client().cdnRequest("domains/example.com/dns-records", { method: "GET" });
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://napi.arvancloud.ir/cdn/4.0/domains/example.com/dns-records");
  });
});
