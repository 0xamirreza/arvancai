import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";
import { RegionSchema } from "../schemas/common.js";

export function registerCloudServerTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_servers",
    {
      title: "List Cloud Server instances",
      description:
        "[READ] List instances in a data center region. Official: GET /ecc/v1/regions/{region}/servers. Example region from docs: ir-thr-c2.",
      inputSchema: z.object({ region: RegionSchema }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ region }) => {
      try {
        const data = await ctx.client.eccRequest(
          `regions/${encodeURIComponent(region)}/servers`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "list_images",
    {
      title: "List Cloud Server images",
      description:
        "[READ] List images/OS available in a region. Official: GET /ecc/v1/regions/{region}/images.",
      inputSchema: z.object({ region: RegionSchema }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ region }) => {
      try {
        const data = await ctx.client.eccRequest(
          `regions/${encodeURIComponent(region)}/images`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "get_server",
    {
      title: "Get Cloud Server instance",
      description:
        "[READ] OpenAPI IaaS 1.0: GET /regions/{region}/servers/{id} (ecc/v1).",
      inputSchema: z.object({
        region: RegionSchema,
        server_id: z.string().min(1),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ region, server_id }) => {
      try {
        return toolResult(
          await ctx.client.eccRequest(
            `regions/${encodeURIComponent(region)}/servers/${encodeURIComponent(server_id)}`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "list_flavors",
    {
      title: "List Cloud Server flavors (IaaS v3)",
      description:
        "[READ] OpenAPI iaas/3.0.0: GET https://ecc.{region}.arvanapis.ir/v3/flavors",
      inputSchema: z.object({ region: RegionSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ region }) => {
      try {
        return toolResult(
          await ctx.client.eccV3Request(region, "flavors", { method: "GET", idempotent: true }),
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "list_networks",
    {
      title: "List Cloud Server networks",
      description:
        "[READ] OpenAPI IaaS 1.0: GET /regions/{region}/networks (ecc/v1).",
      inputSchema: z.object({ region: RegionSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ region }) => {
      try {
        return toolResult(
          await ctx.client.eccRequest(`regions/${encodeURIComponent(region)}/networks`, {
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
    "create_server",
    {
      title: "Create Cloud Server instance",
      description:
        "[WRITE] Offline FA API Usage + OpenAPI IaaS 1.0: POST /ecc/v1/regions/{region}/servers with name, network_id, flavor_id, image_id, security_groups[{name}], ssh_key, key_name, count. Obtain IDs from list tools — never invent UUIDs.",
      inputSchema: z.object({
        region: RegionSchema,
        name: z.string().min(1),
        network_id: z.string().min(1),
        flavor_id: z.string().min(1),
        image_id: z.string().min(1),
        security_groups: z
          .array(z.object({ name: z.string().min(1) }))
          .min(1)
          .describe('Security group entries: [{ "name": "<sg-id-or-name>" }]'),
        ssh_key: z.boolean().optional(),
        key_name: z.string().optional(),
        count: z.number().int().positive().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {
          name: args.name,
          network_id: args.network_id,
          flavor_id: args.flavor_id,
          image_id: args.image_id,
          security_groups: args.security_groups,
        };
        if (args.ssh_key !== undefined) body.ssh_key = args.ssh_key;
        if (args.key_name !== undefined) body.key_name = args.key_name;
        if (args.count !== undefined) body.count = args.count;
        const data = await ctx.client.eccRequest(
          `regions/${encodeURIComponent(args.region)}/servers`,
          { method: "POST", body },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "power_on_server",
    {
      title: "Power on Cloud Server",
      description:
        "[WRITE] OpenAPI IaaS 1.0: POST /regions/{region}/servers/{id}/power-on",
      inputSchema: z.object({ region: RegionSchema, server_id: z.string().min(1) }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ region, server_id }) => {
      try {
        return toolResult(
          await ctx.client.eccRequest(
            `regions/${encodeURIComponent(region)}/servers/${encodeURIComponent(server_id)}/power-on`,
            { method: "POST" },
          ),
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "power_off_server",
    {
      title: "Power off Cloud Server",
      description:
        "[WRITE] OpenAPI IaaS 1.0: POST /regions/{region}/servers/{id}/power-off",
      inputSchema: z.object({ region: RegionSchema, server_id: z.string().min(1) }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ region, server_id }) => {
      try {
        return toolResult(
          await ctx.client.eccRequest(
            `regions/${encodeURIComponent(region)}/servers/${encodeURIComponent(server_id)}/power-off`,
            { method: "POST" },
          ),
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "reboot_server",
    {
      title: "Reboot Cloud Server",
      description:
        "[WRITE] OpenAPI IaaS 1.0: POST /regions/{region}/servers/{id}/reboot",
      inputSchema: z.object({ region: RegionSchema, server_id: z.string().min(1) }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ region, server_id }) => {
      try {
        return toolResult(
          await ctx.client.eccRequest(
            `regions/${encodeURIComponent(region)}/servers/${encodeURIComponent(server_id)}/reboot`,
            { method: "POST" },
          ),
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "list_servers_v3",
    {
      title: "List Cloud Servers (IaaS API v3)",
      description:
        "[READ] OpenAPI iaas/3.0.0: GET https://ecc.{region}.arvanapis.ir/v3/servers",
      inputSchema: z.object({
        region: RegionSchema,
        page: z.number().int().positive().optional(),
        perPage: z.number().int().positive().optional(),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ region, page, perPage }) => {
      try {
        return toolResult(
          await ctx.client.eccV3Request(region, "servers", {
            method: "GET",
            idempotent: true,
            query: { page, perPage },
          }),
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );
}
