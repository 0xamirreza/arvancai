import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";

const LogEntrySchema = z.object({
  logType: z.string().min(1).describe("e.g. fluentbit, app"),
  timestamp: z
    .string()
    .optional()
    .describe("RFC3339 UTC timestamp; omit to let the service assign"),
  severity: z.string().optional().describe("e.g. INFO, ERROR"),
  resource: z
    .object({ type: z.string().min(1) })
    .optional()
    .describe('e.g. { "type": "general" }'),
  payload: z.record(z.string(), z.unknown()).describe("Log payload object"),
});

/**
 * CloudLogs write — documented by official Fluent Bit output plugin (ArvanCloud).
 * POST https://napi.arvancloud.ir/logging/v1/entries/write
 * https://github.com/fluent/fluent-bit/pull/11095
 *
 * Management of spaces/sinks remains Terraform-only (no public OpenAPI on portal).
 */
export function registerCloudLogsTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "write_cloud_logs",
    {
      title: "Write CloudLogs entries",
      description:
        "[WRITE] Ingest logs via POST /logging/v1/entries/write (Fluent Bit ArvanCloud CloudLogs plugin). Body: { logs: [{ logType, timestamp?, severity?, resource?, payload }] }. Auth: Apikey header. Not a full CloudLogs management API.",
      inputSchema: z.object({
        logs: z.array(LogEntrySchema).min(1),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ logs }) => {
      try {
        const body = {
          logs: logs.map((entry) => {
            const row: Record<string, unknown> = {
              logType: entry.logType,
              payload: entry.payload,
            };
            if (entry.timestamp !== undefined) row.timestamp = entry.timestamp;
            if (entry.severity !== undefined) row.severity = entry.severity;
            if (entry.resource !== undefined) row.resource = entry.resource;
            return row;
          }),
        };
        return toolResult(
          await ctx.client.loggingRequest("entries/write", {
            method: "POST",
            body,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
