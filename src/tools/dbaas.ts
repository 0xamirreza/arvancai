import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";
import { RegionSchema } from "../schemas/common.js";

/**
 * Managed Database — paths from IaaS OpenAPI 1.0 (iaas-1.0.json), not a separate portal card.
 * Base: https://napi.arvancloud.ir/ecc/v1
 */
export function registerDbaasTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_database_flavors",
    {
      title: "List DBaaS flavors",
      description:
        "[READ] OpenAPI IaaS 1.0: GET /regions/{region}/databases/flavors (ecc/v1).",
      inputSchema: z.object({ region: RegionSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ region }) => {
      try {
        return toolResult(
          await ctx.client.eccRequest(
            `regions/${encodeURIComponent(region)}/databases/flavors`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "create_database",
    {
      title: "Create DBaaS instance",
      description:
        "[WRITE] OpenAPI IaaS 1.0 CreateDatabaseRequest: POST /regions/{region}/databases with datastoreType + flavorRef from list_database_flavors — do not invent values.",
      inputSchema: z.object({
        region: RegionSchema,
        datastoreType: z.string().min(1),
        flavorRef: z.string().min(1),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        return toolResult(
          await ctx.client.eccRequest(`regions/${encodeURIComponent(args.region)}/databases`, {
            method: "POST",
            body: {
              datastoreType: args.datastoreType,
              flavorRef: args.flavorRef,
            },
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
