import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";
import { DomainNameSchema } from "../schemas/common.js";

export function registerTroubleshootTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_troubleshoots",
    {
      title: "List CDN troubleshoots",
      description:
        "[READ] List troubleshoot runs for a domain. Official CDN API: GET /domains/{domain}/troubleshoots",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/troubleshoots`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "get_latest_troubleshoot",
    {
      title: "Get latest CDN troubleshoot",
      description:
        "[READ] Get the latest troubleshoot for a domain. Official: GET /domains/{domain}/troubleshoots/latest",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/troubleshoots/latest`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "create_troubleshoot",
    {
      title: "Create CDN troubleshoot",
      description:
        "[WRITE] Start a new troubleshoot for a domain. Official: POST /domains/{domain}/troubleshoots. Body fields beyond empty POST are UNKNOWN / NOT DOCUMENTED in product samples — send empty object unless you have verified fields.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        body: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Optional JSON body if documented for your use case"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain, body }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/troubleshoots`,
          { method: "POST", body: body ?? {} },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );
}
