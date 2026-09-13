import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";
import { DomainNameSchema } from "../schemas/common.js";

/** Verified from offline FA: cdn/dns-records/dnssec, change-default-ns, acceleration, security/* */
export function registerOfflineEnrichedCdnTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    "get_dnssec",
    {
      title: "Get DNSSEC status",
      description:
        "[READ] Get DNSSEC status. Official CDN API: GET /domains/{domain}/dns-records/dnssec (CDN Go SDK). Offline FA also documents update actions.",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/dns-records/dnssec`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "update_dnssec",
    {
      title: "Enable or disable DNSSEC",
      description:
        "[WRITE] Update DNSSEC. Offline FA (cdn/dns-records/dnssec): PUT /domains/{domain}/dns-records/dnssec/actions body {\"enable\":true|false}.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        enable: z.boolean(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain, enable }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/dns-records/dnssec/actions`,
          { method: "PUT", body: { enable } },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "set_domain_nameservers",
    {
      title: "Set custom domain nameservers",
      description:
        "[WRITE] Set custom NS keys. Offline FA (cdn/dns-records/change-default-ns): PUT /domains/{domain}/ns-keys body {\"ns_keys\":[...]}",
      inputSchema: z.object({
        domain: DomainNameSchema,
        ns_keys: z.array(z.string().min(1)).min(1),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain, ns_keys }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/ns-keys`,
          { method: "PUT", body: { ns_keys } },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "use_optional_nameservers",
    {
      title: "Switch to optional ArvanCloud NS keys",
      description:
        "[WRITE] Use optional NS keys (.net/.com style). Offline FA: POST /domains/{domain}/ns-keys/use-optional-keys",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/ns-keys/use-optional-keys`,
          { method: "POST", body: {} },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "get_acceleration",
    {
      title: "Get CDN acceleration settings",
      description:
        "[READ] GET /domains/{domain}/acceleration (CDN Go SDK). Offline FA documents PATCH bodies for CSS/JS optimization.",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/acceleration`,
          { method: "GET", idempotent: true },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "update_acceleration",
    {
      title: "Update CDN acceleration settings",
      description:
        "[WRITE] Offline FA (cdn/acceleration): PATCH /domains/{domain}/acceleration e.g. {\"status\":\"on\",\"extensions\":[\"css\"]}",
      inputSchema: z.object({
        domain: DomainNameSchema,
        status: z.enum(["on", "off"]).optional(),
        extensions: z.array(z.string()).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const { domain, ...patch } = args;
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(patch)) if (v !== undefined) body[k] = v;
        if (!Object.keys(body).length) return toolError(new Error("Provide status and/or extensions"));
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/acceleration`,
          { method: "PATCH", body },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "update_image_resize",
    {
      title: "Update image resize settings",
      description:
        "[WRITE] Offline FA (cdn/acceleration): PATCH /domains/{domain}/image-resize e.g. {\"status\":\"on\"}",
      inputSchema: z.object({
        domain: DomainNameSchema,
        status: z.enum(["on", "off"]),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain, status }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/image-resize`,
          { method: "PATCH", body: { status } },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "update_ddos_protection_mode",
    {
      title: "Update DDoS protection mode",
      description:
        "[WRITE] Offline FA (cdn/security/ddos): PATCH /domains/{domain}/ddos with protection_mode (cookie|javascript|recaptcha|captcha). Note: CDN Go SDK lists /ddos/settings — this tool follows FA product docs path /ddos.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        protection_mode: z
          .string()
          .describe("Documented samples: cookie, javascript, recaptcha, captcha"),
        captcha_service: z.string().optional(),
        ttl: z.number().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = { protection_mode: args.protection_mode };
        if (args.captcha_service !== undefined) body.captcha_service = args.captcha_service;
        if (args.ttl !== undefined) body.ttl = args.ttl;
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(args.domain)}/ddos`,
          { method: "PATCH", body },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "update_waf_mode",
    {
      title: "Update WAF mode",
      description:
        "[WRITE] Offline FA / EN WAF docs: PATCH /domains/{domain}/waf with mode off|detect|protect. Note: CDN Go SDK lists /waf/settings — this tool follows product docs path /waf.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        mode: z.enum(["off", "detect", "protect"]),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ domain, mode }) => {
      try {
        const data = await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}/waf`, {
          method: "PATCH",
          body: { mode },
        });
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.registerTool(
    "update_origin_connection_settings",
    {
      title: "Update origin / load-balancer connection settings",
      description:
        "[WRITE] Offline FA (https-settings + advanced-settings): PATCH /domains/{domain}/load-balancers/settings. Documented fields include protocol (http|https|auto), method, keepalive, max_fails, fail_timeout, next_upstream_tcp.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        protocol: z.enum(["http", "https", "auto"]).optional(),
        method: z.string().optional(),
        keepalive: z.string().optional(),
        max_fails: z.number().optional(),
        fail_timeout: z.string().optional(),
        next_upstream_tcp: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const { domain, ...patch } = args;
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(patch)) if (v !== undefined) body[k] = v;
        if (!Object.keys(body).length) return toolError(new Error("Provide at least one settings field"));
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/load-balancers/settings`,
          { method: "PATCH", body },
        );
        return toolResult(data);
      } catch (err) {
        return toolError(err);
      }
    },
  );
}
