import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";

/** VOD tools verified in offline FA developer-tools/api/api-usage */
export function registerVodTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_vod_channels",
    {
      title: "List VOD channels",
      description:
        "[READ] Official FA/EN API Usage: GET https://napi.arvancloud.ir/vod/2.0/channels",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async () => {
      try {
        const data = await ctx.client.vodRequest("channels", { method: "GET", idempotent: true });
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "list_vod_videos",
    {
      title: "List videos in a VOD channel",
      description:
        "[READ] Offline FA API Usage: GET /vod/2.0/channels/{channel-id}/videos",
      inputSchema: z.object({
        channel_id: z.string().min(1).describe("Exact channel id from list_vod_channels"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ channel_id }) => {
      try {
        const data = await ctx.client.vodRequest(
          `channels/${encodeURIComponent(channel_id)}/videos`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "get_vod_channel",
    {
      title: "Get VOD channel",
      description: "[READ] OpenAPI Arvan VOD 2.0: GET /channels/{channel}",
      inputSchema: z.object({ channel_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ channel_id }) => {
      try {
        return toolResult(
          await ctx.client.vodRequest(`channels/${encodeURIComponent(channel_id)}`, {
            method: "GET",
            idempotent: true,
          }),
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "get_vod_video",
    {
      title: "Get VOD video",
      description: "[READ] OpenAPI: GET /videos/{video}",
      inputSchema: z.object({ video_id: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ video_id }) => {
      try {
        return toolResult(
          await ctx.client.vodRequest(`videos/${encodeURIComponent(video_id)}`, {
            method: "GET",
            idempotent: true,
          }),
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "list_vod_tags",
    {
      title: "List VOD tags",
      description: "[READ] OpenAPI: GET /tags",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(await ctx.client.vodRequest("tags", { method: "GET", idempotent: true }));
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "get_vod_domain",
    {
      title: "Get VOD domain settings",
      description: "[READ] OpenAPI: GET /domain",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        return toolResult(
          await ctx.client.vodRequest("domain", { method: "GET", idempotent: true }),
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "create_vod_channel",
    {
      title: "Create VOD channel",
      description:
        "[WRITE] Official FA/EN API Usage + OpenAPI: POST /vod/2.0/channels with documented fields (title, description, secure_link_*, ads_enabled, present_type, campaign_id).",
      inputSchema: z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        secure_link_enabled: z.boolean().optional(),
        secure_link_key: z.string().optional(),
        secure_link_with_ip: z.boolean().optional(),
        ads_enabled: z.boolean().optional(),
        present_type: z.string().optional(),
        campaign_id: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = { title: args.title };
        for (const key of [
          "description",
          "secure_link_enabled",
          "secure_link_key",
          "secure_link_with_ip",
          "ads_enabled",
          "present_type",
          "campaign_id",
        ] as const) {
          if (args[key] !== undefined) body[key] = args[key];
        }
        const data = await ctx.client.vodRequest("channels", { method: "POST", body });
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );
}
