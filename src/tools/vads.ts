import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";

/** Video Ads — OpenAPI https://www.arvancloud.ir/api/vads/2.0 */
export function registerVadsTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_vads_channels",
    {
      title: "List Video Ads channels",
      description: "[READ] OpenAPI VADS 2.0: GET /channels (host napi.arvancloud.ir/vads/2.0).",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.vadsRequest("channels", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_vads_channel",
    {
      title: "Get Video Ads channel",
      description: "[READ] OpenAPI: GET /channels/{channel}",
      inputSchema: z.object({ channel_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ channel_id }) => {
      try {
        return toolResult(
          await ctx.client.vadsRequest(`channels/${encodeURIComponent(channel_id)}`, {
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
    "list_vads_channel_campaigns",
    {
      title: "List campaigns for a Video Ads channel",
      description: "[READ] OpenAPI: GET /channels/{channel}/campaigns",
      inputSchema: z.object({ channel_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ channel_id }) => {
      try {
        return toolResult(
          await ctx.client.vadsRequest(
            `channels/${encodeURIComponent(channel_id)}/campaigns`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_vads_campaign",
    {
      title: "Get Video Ads campaign",
      description: "[READ] OpenAPI: GET /campaigns/{campaign}",
      inputSchema: z.object({ campaign_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ campaign_id }) => {
      try {
        return toolResult(
          await ctx.client.vadsRequest(`campaigns/${encodeURIComponent(campaign_id)}`, {
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
    "get_vads_domain",
    {
      title: "Get Video Ads domain",
      description: "[READ] OpenAPI: GET /domain",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.vadsRequest("domain", { method: "GET", idempotent: true }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
