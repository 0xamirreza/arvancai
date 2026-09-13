import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";

/**
 * Edge Computing — OpenAPI https://www.arvancloud.ir/api/ec/1.0 (ec-1.0.yaml)
 * Base default: https://napi.arvancloud.ir/edge-computing/v1
 */
export function registerEdgeTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_edge_computes",
    {
      title: "List Edge Computes",
      description:
        "[READ] OpenAPI Edge Computing: GET /edge-computes (optional query: application, q, page, per_page).",
      inputSchema: z.object({
        application: z.string().optional(),
        q: z.string().optional(),
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        return toolResult(
          await ctx.client.edgeRequest("edge-computes", {
            method: "GET",
            idempotent: true,
            query: {
              application: args.application,
              q: args.q,
              page: args.page,
              per_page: args.per_page,
            },
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_edge_compute",
    {
      title: "Get Edge Compute",
      description: "[READ] OpenAPI: GET /edge-computes/{edgeComputeId}",
      inputSchema: z.object({ edge_compute_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ edge_compute_id }) => {
      try {
        return toolResult(
          await ctx.client.edgeRequest(`edge-computes/${encodeURIComponent(edge_compute_id)}`, {
            method: "GET",
            idempotent: true,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_edge_routes",
    {
      title: "List Edge Compute routes",
      description: "[READ] OpenAPI: GET /edge-computes/{edgeComputeId}/routes",
      inputSchema: z.object({ edge_compute_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ edge_compute_id }) => {
      try {
        return toolResult(
          await ctx.client.edgeRequest(
            `edge-computes/${encodeURIComponent(edge_compute_id)}/routes`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "create_edge_route",
    {
      title: "Create Edge Computing route",
      description:
        "[WRITE] OpenAPI Route schema: POST /edge-computes/{edgeComputeId}/routes — required domain, url, status (active|inactive).",
      inputSchema: z.object({
        edge_compute_id: z.string().min(1),
        domain: z.string().min(1),
        url: z.string().min(1).describe("Path pattern / uri-template e.g. /app/*"),
        status: z.enum(["active", "inactive"]),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        return toolResult(
          await ctx.client.edgeRequest(
            `edge-computes/${encodeURIComponent(args.edge_compute_id)}/routes`,
            {
              method: "POST",
              body: { domain: args.domain, url: args.url, status: args.status },
            },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "update_edge_route",
    {
      title: "Update Edge Computing route",
      description: "[WRITE] OpenAPI: PUT /edge-computes/{edgeComputeId}/routes/{route_id}",
      inputSchema: z.object({
        edge_compute_id: z.string().min(1),
        route_id: z.string().min(1),
        url: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
        domain: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {};
        if (args.url !== undefined) body.url = args.url;
        if (args.status !== undefined) body.status = args.status;
        if (args.domain !== undefined) body.domain = args.domain;
        if (!Object.keys(body).length) {
          return toolError(new Error("Provide url/status/domain to update"));
        }
        return toolResult(
          await ctx.client.edgeRequest(
            `edge-computes/${encodeURIComponent(args.edge_compute_id)}/routes/${encodeURIComponent(args.route_id)}`,
            { method: "PUT", body },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "delete_edge_route",
    {
      title: "Delete Edge Computing route",
      description: "[DESTRUCTIVE] OpenAPI: DELETE /edge-computes/{edgeComputeId}/routes/{route_id}",
      inputSchema: z.object({
        edge_compute_id: z.string().min(1),
        route_id: z.string().min(1),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async ({ edge_compute_id, route_id }) => {
      try {
        return toolResult(
          await ctx.client.edgeRequest(
            `edge-computes/${encodeURIComponent(edge_compute_id)}/routes/${encodeURIComponent(route_id)}`,
            { method: "DELETE" },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_edge_plans",
    {
      title: "List Edge Computing plans",
      description: "[READ] OpenAPI: GET /plans",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(await ctx.client.edgeRequest("plans", { method: "GET", idempotent: true }));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_edge_templates",
    {
      title: "List Edge Computing templates",
      description: "[READ] OpenAPI: GET /templates",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.edgeRequest("templates", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_edge_namespace",
    {
      title: "Get Edge namespace settings",
      description: "[READ] OpenAPI: GET /namespace",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.edgeRequest("namespace", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_edge_deployments",
    {
      title: "List Edge Compute deployments",
      description: "[READ] OpenAPI: GET /edge-computes/{edgeComputeId}/deployments",
      inputSchema: z.object({ edge_compute_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ edge_compute_id }) => {
      try {
        return toolResult(
          await ctx.client.edgeRequest(
            `edge-computes/${encodeURIComponent(edge_compute_id)}/deployments`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_edge_env_variables",
    {
      title: "List Edge Compute env variables",
      description: "[READ] OpenAPI: GET /edge-computes/{edgeComputeId}/env-variables",
      inputSchema: z.object({ edge_compute_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ edge_compute_id }) => {
      try {
        return toolResult(
          await ctx.client.edgeRequest(
            `edge-computes/${encodeURIComponent(edge_compute_id)}/env-variables`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "set_edge_env_variable",
    {
      title: "Set Edge Compute env variable",
      description:
        "[WRITE] OpenAPI EnvVariable: POST /edge-computes/{edgeComputeId}/env-variables — key, value, type (string|json), is_secret.",
      inputSchema: z.object({
        edge_compute_id: z.string().min(1),
        key: z.string().min(1),
        value: z.string(),
        type: z.enum(["string", "json"]),
        is_secret: z.boolean(),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        return toolResult(
          await ctx.client.edgeRequest(
            `edge-computes/${encodeURIComponent(args.edge_compute_id)}/env-variables`,
            {
              method: "POST",
              body: {
                key: args.key,
                value: args.value,
                type: args.type,
                is_secret: args.is_secret,
              },
            },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "deploy_edge_compute",
    {
      title: "Deploy Edge Compute",
      description:
        "[WRITE] OpenAPI: POST /edge-computes/deploy — required name, bundled_code; optional namespace, tag.",
      inputSchema: z.object({
        name: z.string().min(1),
        bundled_code: z.string().min(1),
        namespace: z.string().optional(),
        tag: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {
          name: args.name,
          bundled_code: args.bundled_code,
        };
        if (args.namespace !== undefined) body.namespace = args.namespace;
        if (args.tag !== undefined) body.tag = args.tag;
        return toolResult(
          await ctx.client.edgeRequest("edge-computes/deploy", { method: "POST", body }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
