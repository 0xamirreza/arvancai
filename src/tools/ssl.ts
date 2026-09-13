import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";
import { DomainNameSchema } from "../schemas/common.js";

export function registerSslTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "get_ssl_settings",
    {
      title: "Get SSL/HTTPS settings",
      description:
        "[READ] Get domain SSL settings. Official: GET /cdn/4.0/domains/{domain}/ssl",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}/ssl`, {
          method: "GET",
          idempotent: true,
        });
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "update_ssl_settings",
    {
      title: "Update SSL/HTTPS settings",
      description:
        "[WRITE] Patch SSL settings. Official: PATCH /cdn/4.0/domains/{domain}/ssl. Documented fields: ssl_status, https_redirect, replace_http, tls_version, hsts_status, hsts_max_age, hsts_subdomain, hsts_preload. HSTS changes can be hard to reverse until max-age expires.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        ssl_status: z.boolean().optional(),
        https_redirect: z.boolean().optional(),
        replace_http: z.boolean().optional(),
        tls_version: z.string().optional(),
        hsts_status: z.boolean().optional(),
        hsts_max_age: z.string().optional(),
        hsts_subdomain: z.boolean().optional(),
        hsts_preload: z.boolean().optional(),
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
          return toolError(new Error("Provide at least one SSL field to update"));
        }
        const data = await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}/ssl`, {
          method: "PATCH",
          body,
        });
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );
}
