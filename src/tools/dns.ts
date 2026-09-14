import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";
import {
  CreateDnsRecordSchema,
  DomainNameSchema,
  RecordIdSchema,
  UpdateDnsRecordSchema,
} from "../schemas/common.js";

export function registerDnsTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "list_dns_records",
    {
      title: "List DNS records",
      description:
        "[READ] List DNS records for a domain. Official: GET /cdn/4.0/domains/{domain}/dns-records",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/dns-records`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "get_dns_record",
    {
      title: "Get DNS record",
      description:
        "[READ] Get one DNS record by id. Official: GET /cdn/4.0/domains/{domain}/dns-records/{id}. Never invent record_id — obtain from list_dns_records.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        record_id: RecordIdSchema,
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain, record_id }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/dns-records/${encodeURIComponent(record_id)}`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "create_dns_record",
    {
      title: "Create DNS record",
      description:
        "[WRITE] Create a DNS record. Official: POST /cdn/4.0/domains/{domain}/dns-records. value shape depends on type (see docs/adding-records). Inspect current records before creating duplicates.",
      inputSchema: CreateDnsRecordSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const { domain, ...rest } = args;
        const body: Record<string, unknown> = {
          type: rest.type,
          name: rest.name,
          value: rest.value,
        };
        if (rest.ttl !== undefined) body.ttl = rest.ttl;
        if (rest.cloud !== undefined) body.cloud = rest.cloud;
        if (rest.upstream_https !== undefined) body.upstream_https = rest.upstream_https;
        if (rest.ip_filter_mode !== undefined) body.ip_filter_mode = rest.ip_filter_mode;
        if (rest.matching_type !== undefined) body.matching_type = rest.matching_type;
        if (rest.selector !== undefined) body.selector = rest.selector;
        if (rest.usage !== undefined) body.usage = rest.usage;

        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/dns-records`,
          { method: "POST", body },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "update_dns_record",
    {
      title: "Update DNS record",
      description:
        "[WRITE] Update an existing DNS record. Official: PUT /cdn/4.0/domains/{domain}/dns-records/{id}. Requires exact record_id. Read current state first.",
      inputSchema: UpdateDnsRecordSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const { domain, record_id, ...rest } = args;
        const body: Record<string, unknown> = {
          type: rest.type,
          name: rest.name,
          value: rest.value,
        };
        if (rest.ttl !== undefined) body.ttl = rest.ttl;
        if (rest.cloud !== undefined) body.cloud = rest.cloud;
        if (rest.upstream_https !== undefined) body.upstream_https = rest.upstream_https;
        if (rest.ip_filter_mode !== undefined) body.ip_filter_mode = rest.ip_filter_mode;
        if (rest.matching_type !== undefined) body.matching_type = rest.matching_type;
        if (rest.selector !== undefined) body.selector = rest.selector;
        if (rest.usage !== undefined) body.usage = rest.usage;

        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/dns-records/${encodeURIComponent(record_id)}`,
          { method: "PUT", body },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "delete_dns_record",
    {
      title: "Delete DNS record",
      description:
        "[DESTRUCTIVE] Permanently delete one DNS record. Official: DELETE /cdn/4.0/domains/{domain}/dns-records/{id}. Requires exact record_id — never infer or delete multiple.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        record_id: RecordIdSchema,
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async ({ domain, record_id }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/dns-records/${encodeURIComponent(record_id)}`,
          { method: "DELETE" },
        );
        return toolResult(data ?? { deleted: true, domain, record_id });
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "set_dns_record_cloud",
    {
      title: "Toggle DNS record cloud (CDN proxy)",
      description:
        "[WRITE] Toggle cloud/proxy status for a DNS record. Official: PUT /cdn/4.0/domains/{domain}/dns-records/{id}/cloud",
      inputSchema: z.object({
        domain: DomainNameSchema,
        record_id: RecordIdSchema,
        cloud: z.boolean().describe("true = traffic via ArvanCloud CDN; false = DNS only"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain, record_id, cloud }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/dns-records/${encodeURIComponent(record_id)}/cloud`,
          { method: "PUT", body: { cloud } },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "export_dns_zone",
    {
      title: "Export DNS zone",
      description:
        "[READ] Export DNS records as a zone file. Official: GET /cdn/4.0/domains/{domain}/dns-records/export",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest<string | unknown>(
          `domains/${encodeURIComponent(domain)}/dns-records/export`,
          { method: "GET", idempotent: true, accept: "text" },
        );
        return toolResult(
          typeof data === "string" ? { domain, zone: data } : { domain, data },
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "import_dns_zone",
    {
      title: "Import DNS zone (BIND)",
      description:
        "[WRITE] Import a BIND-style zone file via multipart field f_zone_file. Official: POST /cdn/4.0/domains/{domain}/dns-records/import. Confirm with the user before importing — may create many records.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        zone_file: z
          .string()
          .min(1)
          .describe("Full BIND zone file text contents (multipart field name: f_zone_file)"),
        filename: z
          .string()
          .optional()
          .describe("Optional upload filename, default zone.txt"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain, zone_file, filename }) => {
      try {
        const form = new FormData();
        form.append(
          "f_zone_file",
          new Blob([zone_file], { type: "text/plain" }),
          filename?.trim() || "zone.txt",
        );
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/dns-records/import`,
          { method: "POST", formData: form },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );
}
