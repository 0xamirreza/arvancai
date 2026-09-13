import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ArvanCloudClient } from "../client/arvancloud-client.js";
import { ArvanCloudError } from "../client/errors.js";
import { findAllowedOp, loadAllowlist, normalizePath, type Allowlist } from "../openapi/allowlist.js";
import { toolError, toolResult } from "./helpers.js";

const MethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

type InvokeArgs = {
  method: z.infer<typeof MethodSchema>;
  path: string;
  query?: Record<string, string | number | boolean>;
  body?: unknown;
  zone?: string;
  region?: string;
};

function assertAllowed(allowlist: Allowlist, method: string, path: string) {
  const hit = findAllowedOp(allowlist, method, path);
  if (!hit) {
    throw new ArvanCloudError(
      "validation",
      `Path/method not in official OpenAPI allowlist for ${allowlist.product}: ${method} ${path}. Source: ${allowlist.source}`,
      { details: { product: allowlist.product, method, path } },
    );
  }
  return hit;
}

/** Strip a prefix from path when base URL already includes it. */
function stripPrefix(path: string, prefix: string): string {
  const n = normalizePath(path);
  const p = normalizePath(prefix);
  if (n === p) return "/";
  if (n.startsWith(`${p}/`)) return n.slice(p.length) || "/";
  return n;
}

function registerInvoker(
  server: McpServer,
  client: ArvanCloudClient,
  opts: {
    name: string;
    title: string;
    product: string;
    description: string;
    needsZone?: boolean;
    needsRegion?: boolean;
    execute: (args: InvokeArgs) => Promise<unknown>;
  },
) {
  const allowlist = loadAllowlist(opts.product);
  const shape: Record<string, z.ZodTypeAny> = {
    method: MethodSchema,
    path: z
      .string()
      .min(1)
      .describe(
        `Concrete path matching OpenAPI ${allowlist.source} (fill path params). Example templates exist in docs/discovery/openapi/.`,
      ),
    query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    body: z.unknown().optional(),
  };
  if (opts.needsZone) {
    shape.zone = z.string().min(1).describe("CaaS zone e.g. ir-tbz-sh1 or ir-thr-ba1");
  }
  if (opts.needsRegion) {
    shape.region = z.string().min(1).describe("Region code for ecc.{region}.arvanapis.ir/v3");
  }

  server.registerTool(
    opts.name,
    {
      title: opts.title,
      description: `${opts.description} Allowlist: ${allowlist.operations.length} ops from ${allowlist.source} (${allowlist.title ?? opts.product} ${allowlist.version ?? ""}). Rejects unknown paths — does not invent APIs.`,
      inputSchema: z.object(shape),
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
        destructiveHint: true,
      },
    },
    async (args) => {
      try {
        const method = args.method as InvokeArgs["method"];
        const path = normalizePath(String(args.path));
        assertAllowed(allowlist, method, path);
        const data = await opts.execute({
          method,
          path,
          query: args.query as InvokeArgs["query"],
          body: args.body,
          zone: args.zone as string | undefined,
          region: args.region as string | undefined,
        });
        return toolResult({
          openapi: { product: allowlist.product, source: allowlist.source },
          request: { method, path, query: args.query ?? null },
          data,
        });
      } catch (e) {
        return toolError(e);
      }
    },
  );
}

/**
 * Full OpenAPI surface via validated invokers (not free-form raw API).
 * Prefer curated named tools for common flows; use these for remaining ops.
 */
export function registerOpenApiGatewayTools(server: McpServer, client: ArvanCloudClient): void {
  registerInvoker(server, client, {
    name: "invoke_cdn_api",
    title: "Invoke CDN OpenAPI operation",
    product: "cdn",
    description:
      "[OPENAPI] Call any path from CDN OpenAPI 4.181.3 on napi.../cdn/4.0. Prefer named CDN tools when available.",
    execute: ({ method, path, query, body }) =>
      client.cdnRequest(path.replace(/^\//, ""), {
        method,
        query,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        idempotent: method === "GET",
      }),
  });

  registerInvoker(server, client, {
    name: "invoke_storage_api",
    title: "Invoke Object Storage management OpenAPI",
    product: "storage",
    description:
      "[OPENAPI] Call storage.arvanapis.ir management API (OpenAPI storage/1.0.0). Paths are /v1/...; base already includes /v1 so /v1 is stripped.",
    execute: ({ method, path, query, body }) => {
      const relative = stripPrefix(path, "/v1").replace(/^\//, "");
      return client.storageApiRequest(relative, {
        method,
        query,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        idempotent: method === "GET",
      });
    },
  });

  registerInvoker(server, client, {
    name: "invoke_iaas_v1_api",
    title: "Invoke IaaS OpenAPI v1 (ecc/v1)",
    product: "iaas_v1",
    description:
      "[OPENAPI] Call napi.../ecc/v1 paths from iaas-1.0.json (servers, networks, float-ips, databases, …). Use concrete paths e.g. /regions/ir-thr-c2/servers.",
    execute: ({ method, path, query, body }) =>
      client.eccRequest(path.replace(/^\//, ""), {
        method,
        query,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        idempotent: method === "GET",
      }),
  });

  registerInvoker(server, client, {
    name: "invoke_iaas_v3_api",
    title: "Invoke IaaS OpenAPI v3",
    product: "iaas_v3",
    needsRegion: true,
    description:
      "[OPENAPI] Call ecc.{region}.arvanapis.ir/v3 paths from iaas-3.0.0.yaml (servers, volumes, firewalls, networks, …).",
    execute: ({ method, path, query, body, region }) => {
      if (!region) throw new ArvanCloudError("validation", "region is required for IaaS v3");
      return client.eccV3Request(region, path.replace(/^\//, ""), {
        method,
        query,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        idempotent: method === "GET",
      });
    },
  });

  registerInvoker(server, client, {
    name: "invoke_vod_api",
    title: "Invoke VOD OpenAPI",
    product: "vod",
    description: "[OPENAPI] Full Arvan VOD 2.0 surface (channels, videos, files, reports, …).",
    execute: ({ method, path, query, body }) =>
      client.vodRequest(path.replace(/^\//, ""), {
        method,
        query,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        idempotent: method === "GET",
      }),
  });

  registerInvoker(server, client, {
    name: "invoke_live_api",
    title: "Invoke LIVE OpenAPI",
    product: "live",
    description: "[OPENAPI] Full Arvan LIVE 2.0 surface (streams, watermarks, reports, metrics).",
    execute: ({ method, path, query, body }) =>
      client.liveRequest(path.replace(/^\//, ""), {
        method,
        query,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        idempotent: method === "GET",
      }),
  });

  registerInvoker(server, client, {
    name: "invoke_vads_api",
    title: "Invoke Video Ads OpenAPI",
    product: "vads",
    description: "[OPENAPI] Full VADS 2.0 surface (channels, campaigns, ads, transactions).",
    execute: ({ method, path, query, body }) =>
      client.vadsRequest(path.replace(/^\//, ""), {
        method,
        query,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        idempotent: method === "GET",
      }),
  });

  registerInvoker(server, client, {
    name: "invoke_edge_api",
    title: "Invoke Edge Computing OpenAPI",
    product: "edge",
    description: "[OPENAPI] Full Edge Computing 1.8.1 surface on edge-computing/v1.",
    execute: ({ method, path, query, body }) =>
      client.edgeRequest(path.replace(/^\//, ""), {
        method,
        query,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        idempotent: method === "GET",
      }),
  });

  registerInvoker(server, client, {
    name: "invoke_caas_api",
    title: "Invoke CaaS / Cloud Container OpenAPI",
    product: "caas",
    needsZone: true,
    description:
      "[OPENAPI] Full Arvan CaaS 1.25 (Kubernetes-style) on caas/v2/zones/{zone}. Pass concrete path e.g. /api/v1/namespaces/my-ns/pods.",
    execute: ({ method, path, query, body, zone }) => {
      if (!zone) throw new ArvanCloudError("validation", "zone is required for CaaS");
      return client.caasRequest(zone, path.replace(/^\//, ""), {
        method,
        query,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        idempotent: method === "GET",
      });
    },
  });

  registerInvoker(server, client, {
    name: "invoke_aiaas_api",
    title: "Invoke AI-as-a-Service OpenAPI",
    product: "aiaas",
    description:
      "[OPENAPI] Full ai-ml-backend 1.0 on /ai/v1. Paths may be /endpoints or /ai/v1/datasets — /ai/v1 prefix is stripped when present.",
    execute: ({ method, path, query, body }) => {
      const relative = stripPrefix(path, "/ai/v1").replace(/^\//, "");
      return client.aiaasRequest(relative, {
        method,
        query,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        idempotent: method === "GET",
      });
    },
  });
}
