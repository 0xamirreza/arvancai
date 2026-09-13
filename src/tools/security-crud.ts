import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";
import { DomainNameSchema } from "../schemas/common.js";

const RuleIdSchema = z.string().min(1).describe("Exact rule id from list/get — never invent");

/**
 * Firewall + Rate Limit CRUD.
 * Paths: official CDN Go SDK HOW-TO + product docs (FA/EN) create samples & operation tables.
 * Create bodies: FA/EN cdn/security/firewall and rate-limit pages.
 */
export function registerSecurityCrudTools(server: McpServer, ctx: ToolContext): void {
  // ---- Firewall settings ----
  server.registerTool(
    "get_firewall_settings",
    {
      title: "Get CDN firewall settings",
      description:
        "[READ] GET /domains/{domain}/firewall/settings (CDN Go SDK; FA firewall API table).",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        return toolResult(
          await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}/firewall/settings`, {
            method: "GET",
            idempotent: true,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "update_firewall_settings",
    {
      title: "Update CDN firewall settings",
      description:
        "[WRITE] PATCH /domains/{domain}/firewall/settings. Offline FA known-bots sample includes skip_global_firewall. Pass only documented fields.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        skip_global_firewall: z.boolean().optional(),
        settings: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Additional documented settings fields if known"),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = { ...(args.settings ?? {}) };
        if (args.skip_global_firewall !== undefined) body.skip_global_firewall = args.skip_global_firewall;
        if (!Object.keys(body).length) return toolError(new Error("Provide at least one settings field"));
        return toolResult(
          await ctx.client.cdnRequest(`domains/${encodeURIComponent(args.domain)}/firewall/settings`, {
            method: "PATCH",
            body,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  // ---- Firewall rules CRUD ----
  server.registerTool(
    "list_firewall_rules",
    {
      title: "List CDN firewall rules",
      description: "[READ] GET /domains/{domain}/firewall/rules (CDN Go SDK FirewallRulesIndex).",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        return toolResult(
          await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}/firewall/rules`, {
            method: "GET",
            idempotent: true,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_firewall_rule",
    {
      title: "Get CDN firewall rule",
      description: "[READ] GET /domains/{domain}/firewall/rules/{id}",
      inputSchema: z.object({ domain: DomainNameSchema, rule_id: RuleIdSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ domain, rule_id }) => {
      try {
        return toolResult(
          await ctx.client.cdnRequest(
            `domains/${encodeURIComponent(domain)}/firewall/rules/${encodeURIComponent(rule_id)}`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "create_firewall_rule",
    {
      title: "Create CDN firewall rule",
      description:
        "[WRITE] POST /domains/{domain}/firewall/rules. Official FA samples: name, note, is_enabled, action (allow|deny|challenge|bypass), action_details, filter_expr.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        name: z.string().min(1),
        note: z.string().optional(),
        is_enabled: z.boolean().optional(),
        action: z.string().describe("allow | deny | challenge | bypass (FA samples)"),
        action_details: z.record(z.string(), z.unknown()).optional(),
        filter_expr: z.string().min(1),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {
          name: args.name,
          action: args.action,
          filter_expr: args.filter_expr,
        };
        if (args.note !== undefined) body.note = args.note;
        if (args.is_enabled !== undefined) body.is_enabled = args.is_enabled;
        if (args.action_details !== undefined) body.action_details = args.action_details;
        return toolResult(
          await ctx.client.cdnRequest(`domains/${encodeURIComponent(args.domain)}/firewall/rules`, {
            method: "POST",
            body,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "update_firewall_rule",
    {
      title: "Update CDN firewall rule",
      description:
        "[WRITE] PATCH /domains/{domain}/firewall/rules/{id}. Requires exact rule_id. Use documented fields from create samples.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        rule_id: RuleIdSchema,
        name: z.string().optional(),
        note: z.string().optional(),
        is_enabled: z.boolean().optional(),
        action: z.string().optional(),
        action_details: z.record(z.string(), z.unknown()).optional(),
        filter_expr: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const { domain, rule_id, ...rest } = args;
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(rest)) if (v !== undefined) body[k] = v;
        if (!Object.keys(body).length) return toolError(new Error("Provide fields to update"));
        return toolResult(
          await ctx.client.cdnRequest(
            `domains/${encodeURIComponent(domain)}/firewall/rules/${encodeURIComponent(rule_id)}`,
            { method: "PATCH", body },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "delete_firewall_rule",
    {
      title: "Delete CDN firewall rule",
      description:
        "[DESTRUCTIVE] DELETE /domains/{domain}/firewall/rules/{id}. Requires exact rule_id — never delete multiple.",
      inputSchema: z.object({ domain: DomainNameSchema, rule_id: RuleIdSchema }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async ({ domain, rule_id }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/firewall/rules/${encodeURIComponent(rule_id)}`,
          { method: "DELETE" },
        );
        return toolResult(data ?? { deleted: true, domain, rule_id });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "reprioritize_firewall_rules",
    {
      title: "Reprioritize CDN firewall rules",
      description:
        "[WRITE] POST /domains/{domain}/firewall/actions/reprioritize (CDN Go SDK). Pass the priority payload exactly as required by the API (product pages list the operation; body schema details may come from API portal).",
      inputSchema: z.object({
        domain: DomainNameSchema,
        body: z.record(z.string(), z.unknown()).describe("Official reprioritize request body"),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ domain, body }) => {
      try {
        return toolResult(
          await ctx.client.cdnRequest(
            `domains/${encodeURIComponent(domain)}/firewall/actions/reprioritize`,
            { method: "POST", body },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  // ---- Rate limit ----
  server.registerTool(
    "get_rate_limit_settings",
    {
      title: "Get rate-limit settings",
      description: "[READ] GET /domains/{domain}/rate-limit/settings (CDN Go SDK; EN/FA rate-limit API table).",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        return toolResult(
          await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}/rate-limit/settings`, {
            method: "GET",
            idempotent: true,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "update_rate_limit_settings",
    {
      title: "Update rate-limit settings",
      description: "[WRITE] PATCH /domains/{domain}/rate-limit/settings",
      inputSchema: z.object({
        domain: DomainNameSchema,
        settings: z.record(z.string(), z.unknown()),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ domain, settings }) => {
      try {
        return toolResult(
          await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}/rate-limit/settings`, {
            method: "PATCH",
            body: settings,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_rate_limit_rules",
    {
      title: "List rate-limit rules",
      description: "[READ] GET /domains/{domain}/rate-limit/rules",
      inputSchema: z.object({ domain: DomainNameSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ domain }) => {
      try {
        return toolResult(
          await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}/rate-limit/rules`, {
            method: "GET",
            idempotent: true,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_rate_limit_rule",
    {
      title: "Get rate-limit rule",
      description: "[READ] GET /domains/{domain}/rate-limit/rules/{id}",
      inputSchema: z.object({ domain: DomainNameSchema, rule_id: RuleIdSchema }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ domain, rule_id }) => {
      try {
        return toolResult(
          await ctx.client.cdnRequest(
            `domains/${encodeURIComponent(domain)}/rate-limit/rules/${encodeURIComponent(rule_id)}`,
            { method: "GET", idempotent: true },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "create_rate_limit_rule",
    {
      title: "Create rate-limit rule",
      description:
        "[WRITE] POST /domains/{domain}/rate-limit/rules. Official samples include url_pattern, rate, time_duration, is_enabled, description, exclude_sources, burst, block_duration, allowed_methods, action, action_details.",
      inputSchema: z.object({
        domain: DomainNameSchema,
        url_pattern: z.string().min(1),
        rate: z.number(),
        time_duration: z.number(),
        is_enabled: z.boolean().optional(),
        description: z.string().optional(),
        exclude_sources: z.array(z.string()).optional(),
        burst: z.number().optional(),
        block_duration: z.number().optional(),
        allowed_methods: z.array(z.string()).optional(),
        action: z.string().optional(),
        action_details: z.record(z.string(), z.unknown()).optional(),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const { domain, ...rest } = args;
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(rest)) if (v !== undefined) body[k] = v;
        return toolResult(
          await ctx.client.cdnRequest(`domains/${encodeURIComponent(domain)}/rate-limit/rules`, {
            method: "POST",
            body,
          }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "update_rate_limit_rule",
    {
      title: "Update rate-limit rule",
      description: "[WRITE] PATCH /domains/{domain}/rate-limit/rules/{id}",
      inputSchema: z.object({
        domain: DomainNameSchema,
        rule_id: RuleIdSchema,
        url_pattern: z.string().optional(),
        rate: z.number().optional(),
        time_duration: z.number().optional(),
        is_enabled: z.boolean().optional(),
        description: z.string().optional(),
        exclude_sources: z.array(z.string()).optional(),
        burst: z.number().optional(),
        block_duration: z.number().optional(),
        allowed_methods: z.array(z.string()).optional(),
        action: z.string().optional(),
        action_details: z.record(z.string(), z.unknown()).optional(),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const { domain, rule_id, ...rest } = args;
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(rest)) if (v !== undefined) body[k] = v;
        if (!Object.keys(body).length) return toolError(new Error("Provide fields to update"));
        return toolResult(
          await ctx.client.cdnRequest(
            `domains/${encodeURIComponent(domain)}/rate-limit/rules/${encodeURIComponent(rule_id)}`,
            { method: "PATCH", body },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "delete_rate_limit_rule",
    {
      title: "Delete rate-limit rule",
      description: "[DESTRUCTIVE] DELETE /domains/{domain}/rate-limit/rules/{id}",
      inputSchema: z.object({ domain: DomainNameSchema, rule_id: RuleIdSchema }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async ({ domain, rule_id }) => {
      try {
        const data = await ctx.client.cdnRequest(
          `domains/${encodeURIComponent(domain)}/rate-limit/rules/${encodeURIComponent(rule_id)}`,
          { method: "DELETE" },
        );
        return toolResult(data ?? { deleted: true, domain, rule_id });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "reprioritize_rate_limit_rules",
    {
      title: "Reprioritize rate-limit rules",
      description:
        "[WRITE] POST /domains/{domain}/rate-limit/actions/reprioritize (CDN Go SDK / EN rate-limit API table).",
      inputSchema: z.object({
        domain: DomainNameSchema,
        body: z.record(z.string(), z.unknown()),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ domain, body }) => {
      try {
        return toolResult(
          await ctx.client.cdnRequest(
            `domains/${encodeURIComponent(domain)}/rate-limit/actions/reprioritize`,
            { method: "POST", body },
          ),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
