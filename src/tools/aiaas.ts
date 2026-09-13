import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";

/**
 * AI-as-a-Service — OpenAPI https://www.arvancloud.ir/api/aiaas/1.0
 * Default base: https://napi.arvancloud.ir/ai/v1 (paths like /models, /endpoints).
 * Spec also lists /ai/v1/buckets/{region}; we call buckets/{region} under the same base.
 */
export function registerAiaasTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_ai_providers",
    {
      title: "List AI providers",
      description: "[READ] OpenAPI ai-ml-backend: GET /providers",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.aiaasRequest("providers", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_ai_models",
    {
      title: "List AI models",
      description: "[READ] OpenAPI: GET /models",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.aiaasRequest("models", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_ai_model",
    {
      title: "Get AI model",
      description: "[READ] OpenAPI: GET /models/{model_id}",
      inputSchema: z.object({ model_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ model_id }) => {
      try {
        return toolResult(
          await ctx.client.aiaasRequest(`models/${encodeURIComponent(model_id)}`, {
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
    "list_ai_endpoints",
    {
      title: "List AI endpoints",
      description: "[READ] OpenAPI: GET /endpoints",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.aiaasRequest("endpoints", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_ai_endpoint",
    {
      title: "Get AI endpoint",
      description: "[READ] OpenAPI: GET /endpoints/{endpoint_id}",
      inputSchema: z.object({ endpoint_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ endpoint_id }) => {
      try {
        return toolResult(
          await ctx.client.aiaasRequest(`endpoints/${encodeURIComponent(endpoint_id)}`, {
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
    "list_ai_datasets",
    {
      title: "List AI datasets",
      description: "[READ] OpenAPI: GET /ai/v1/datasets → buckets path under /ai/v1 base as datasets",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.aiaasRequest("datasets", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_ai_knowledge_bases",
    {
      title: "List AI knowledge bases",
      description: "[READ] OpenAPI: GET /knowledge-bases",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.aiaasRequest("knowledge-bases", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_ai_buckets",
    {
      title: "List AI region buckets",
      description: "[READ] OpenAPI: GET /ai/v1/buckets/{region} (called as buckets/{region} on /ai/v1).",
      inputSchema: z.object({ region: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ region }) => {
      try {
        return toolResult(
          await ctx.client.aiaasRequest(`buckets/${encodeURIComponent(region)}`, {
            method: "GET",
            idempotent: true,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
