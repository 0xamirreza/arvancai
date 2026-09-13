import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";

const ZoneSchema = z
  .string()
  .min(1)
  .describe("CaaS zone from OpenAPI servers, e.g. ir-tbz-sh1 (Shahriar) or ir-thr-ba1 (Bamdad)");

const NamespaceSchema = z.string().min(1).describe("Kubernetes namespace / project name");

/**
 * Cloud Container (CaaS) — curated subset of OpenAPI paas/1.25
 * Base: https://napi.arvancloud.ir/caas/v2/zones/{zone}
 */
export function registerCaasTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_caas_pods",
    {
      title: "List CaaS pods",
      description:
        "[READ] OpenAPI Arvan CaaS 1.25: GET /api/v1/namespaces/{namespace}/pods on zone base.",
      inputSchema: z.object({ zone: ZoneSchema, namespace: NamespaceSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ zone, namespace }) => {
      try {
        return toolResult(
          await ctx.client.caasRequest(
            zone,
            `api/v1/namespaces/${encodeURIComponent(namespace)}/pods`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_caas_pod",
    {
      title: "Get CaaS pod",
      description: "[READ] OpenAPI: GET /api/v1/namespaces/{namespace}/pods/{name}",
      inputSchema: z.object({
        zone: ZoneSchema,
        namespace: NamespaceSchema,
        name: z.string().min(1),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ zone, namespace, name }) => {
      try {
        return toolResult(
          await ctx.client.caasRequest(
            zone,
            `api/v1/namespaces/${encodeURIComponent(namespace)}/pods/${encodeURIComponent(name)}`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_caas_pod_logs",
    {
      title: "Get CaaS pod logs",
      description: "[READ] OpenAPI: GET /api/v1/namespaces/{namespace}/pods/{name}/log",
      inputSchema: z.object({
        zone: ZoneSchema,
        namespace: NamespaceSchema,
        name: z.string().min(1),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ zone, namespace, name }) => {
      try {
        return toolResult(
          await ctx.client.caasRequest(
            zone,
            `api/v1/namespaces/${encodeURIComponent(namespace)}/pods/${encodeURIComponent(name)}/log`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_caas_deployments",
    {
      title: "List CaaS deployments",
      description:
        "[READ] OpenAPI: GET /apis/apps/v1/namespaces/{namespace}/deployments",
      inputSchema: z.object({ zone: ZoneSchema, namespace: NamespaceSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ zone, namespace }) => {
      try {
        return toolResult(
          await ctx.client.caasRequest(
            zone,
            `apis/apps/v1/namespaces/${encodeURIComponent(namespace)}/deployments`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_caas_deployment",
    {
      title: "Get CaaS deployment",
      description:
        "[READ] OpenAPI: GET /apis/apps/v1/namespaces/{namespace}/deployments/{name}",
      inputSchema: z.object({
        zone: ZoneSchema,
        namespace: NamespaceSchema,
        name: z.string().min(1),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ zone, namespace, name }) => {
      try {
        return toolResult(
          await ctx.client.caasRequest(
            zone,
            `apis/apps/v1/namespaces/${encodeURIComponent(namespace)}/deployments/${encodeURIComponent(name)}`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_caas_services",
    {
      title: "List CaaS services",
      description: "[READ] OpenAPI: GET /api/v1/namespaces/{namespace}/services",
      inputSchema: z.object({ zone: ZoneSchema, namespace: NamespaceSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ zone, namespace }) => {
      try {
        return toolResult(
          await ctx.client.caasRequest(
            zone,
            `api/v1/namespaces/${encodeURIComponent(namespace)}/services`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_caas_configmaps",
    {
      title: "List CaaS configmaps",
      description: "[READ] OpenAPI: GET /api/v1/namespaces/{namespace}/configmaps",
      inputSchema: z.object({ zone: ZoneSchema, namespace: NamespaceSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ zone, namespace }) => {
      try {
        return toolResult(
          await ctx.client.caasRequest(
            zone,
            `api/v1/namespaces/${encodeURIComponent(namespace)}/configmaps`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
