import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";

/** Live Streaming — OpenAPI https://www.arvancloud.ir/api/live/2.0 */
export function registerLiveTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_live_streams",
    {
      title: "List LIVE streams",
      description: "[READ] OpenAPI Arvan LIVE 2.0: GET /streams (base napi.../live/2.0).",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.liveRequest("streams", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_live_stream",
    {
      title: "Get LIVE stream",
      description: "[READ] OpenAPI: GET /streams/{stream}",
      inputSchema: z.object({ stream_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ stream_id }) => {
      try {
        return toolResult(
          await ctx.client.liveRequest(`streams/${encodeURIComponent(stream_id)}`, {
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
    "get_live_domain",
    {
      title: "Get LIVE domain settings",
      description: "[READ] OpenAPI: GET /domain",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.liveRequest("domain", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_live_watermarks",
    {
      title: "List LIVE watermarks",
      description: "[READ] OpenAPI: GET /watermarks",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.liveRequest("watermarks", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
