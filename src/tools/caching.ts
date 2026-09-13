import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";
import { CacheStatusSchema, DomainNameSchema, PurgeCacheSchema } from "../schemas/common.js";

export function registerCachingTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "get_caching_settings",
    {
      title: "Get CDN caching settings",
      description:
        "[READ] Get caching settings for a domain. Official: GET /cdn/4.0/domains/{domain}/caching",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/caching`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "update_caching_settings",
    {
      title: "Update CDN caching settings",
      description:
        "[WRITE] Patch caching settings. Official: PATCH /cdn/4.0/domains/{domain}/caching. Documented fields include cache_status (off|uri|query_string), cache_page_200, cache_page_any, cache_browser, cache_ignore_sc, cache_developer_mode, cache_consistent_uptime.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        cache_status: CacheStatusSchema.optional(),
        cache_page_200: z.string().optional(),
        cache_page_any: z.string().optional(),
        cache_browser: z.string().optional(),
        cache_ignore_sc: z.boolean().optional(),
        cache_developer_mode: z.boolean().optional(),
        cache_consistent_uptime: z.boolean().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const { domain, ...patch } = args;
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(patch)) {
          if (v !== undefined) body[k] = v;
        }
        if (Object.keys(body).length === 0) {
          return toolError(new Error("Provide at least one caching field to update"));
        }
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/caching`,
          { method: "PATCH", body },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "purge_cache",
    {
      title: "Purge CDN cache",
      description:
        "[DESTRUCTIVE] Purge CDN cache. Official: POST /cdn/4.0/domains/{domain}/caching/purge. purge=all clears entire domain cache (service impact). purge=individual requires exact purge_urls. Never broaden scope.",
      inputSchema: PurgeCacheSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> =
          args.purge === "all"
            ? { purge: "all" }
            : { purge: "individual", purge_urls: args.purge_urls };
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(args.domain)}/caching/purge`,
          { method: "POST", body },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );
}
