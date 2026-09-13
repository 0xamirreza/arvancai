import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";
import { DomainNameSchema } from "../schemas/common.js";

export function registerDomainTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_domains",
    {
      title: "List CDN domains",
      description:
        "[READ] List domains registered in the ArvanCloud CDN account. Official: GET /cdn/4.0/domains",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async () => {
      try {
        const data = await ctx.client.cdnRequest("domains", { method: "GET", idempotent: true });
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "get_domain",
    {
      title: "Get CDN domain",
      description:
        "[READ] Get information for one CDN domain. Official: GET /cdn/4.0/domains/{domain}",
      inputSchema: z.object({
        domain: DomainNameSchema.describe("Exact domain name, e.g. example.com"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}`, {
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
    "register_domain",
    {
      title: "Register CDN domain",
      description:
        "[WRITE] Register a domain for CDN/DNS service. Official: POST /cdn/4.0/domains/dns-service. domain_type full = NS delegation; partial = CNAME setup.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        domain_type: z.enum(["full", "partial"]).describe("full=NS delegation, partial=CNAME setup"),
        plan_level: z.number().int().min(1).max(3).optional().describe("Optional plan level when documented for partial setup"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {
          domain: args.domain,
          domain_type: args.domain_type,
        };
        if (args.plan_level !== undefined) body.plan_level = args.plan_level;
        const data = await ctx.client.cdnRequest("domains/dns-service", {
          method: "POST",
          body,
        });
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "set_domain_plan",
    {
      title: "Set CDN domain plan",
      description:
        "[WRITE] Set domain plan_level (1=basic, 2=growth, 3=professional per domain docs). Official: PUT /cdn/4.0/domains/{domain}/plan",
      inputSchema: z.object({
        domain: DomainNameSchema,
        plan_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.string()]),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain, plan_level }) => {
      try {
        const data = await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}/plan`, {
          method: "PUT",
          body: { plan_level },
        });
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "check_domain_nameservers",
    {
      title: "Check domain nameservers",
      description:
        "[READ] Check whether domain NS keys indicate activation. Official: GET /cdn/4.0/domains/{domain}/ns-keys/check",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/ns-keys/check`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );
}
