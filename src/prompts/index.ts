import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "inspect_domain",
    {
      description:
        "Read-only workflow: inspect a CDN domain (domain detail, DNS, SSL, caching, NS check).",
      argsSchema: z.object({
        domain: z.string().describe("Exact domain name e.g. example.com"),
      }),
    },
    ({ domain }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Inspect ArvanCloud CDN domain "${domain}" using READ tools only.`,
              "1) get_domain",
              "2) check_domain_nameservers",
              "3) list_dns_records",
              "4) get_ssl_settings",
              "5) get_caching_settings",
              "Summarize status, risks, and anything needing follow-up. Do not invent record IDs or change anything.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "audit_dns",
    {
      description: "Audit DNS records for a domain for duplicates, missing roots, and cloud flags.",
      argsSchema: z.object({
        domain: z.string().describe("Exact domain name"),
      }),
    },
    ({ domain }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Audit DNS for "${domain}".`,
              "Use list_dns_records (and get_dns_record for specifics).",
              "Check: duplicate names/types, missing apex/www, unexpected cloud=true, TTL anomalies.",
              "Do not modify records unless the user explicitly asks after the audit.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "review_dns_change",
    {
      description: "Safe DNS change workflow: read → validate → change → verify.",
      argsSchema: z.object({
        domain: z.string().describe("Domain"),
        intent: z.string().describe("What change is requested"),
      }),
    },
    ({ domain, intent }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Proposed DNS change for "${domain}": ${intent}`,
              "Follow: understand → identify resource IDs via list/get → validate → perform write/destructive tool → verify with list/get.",
              "Never guess record_id. Refuse ambiguous deletes.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "troubleshoot_cdn",
    {
      description: "CDN incident workflow using troubleshoot APIs plus state reads.",
      argsSchema: z.object({
        domain: z.string().describe("Domain"),
        symptom: z.string().describe("User-reported symptom"),
      }),
    },
    ({ domain, symptom }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Troubleshoot CDN for "${domain}". Symptom: ${symptom}`,
              "1) get_domain, check_domain_nameservers, list_dns_records, get_ssl_settings, get_caching_settings",
              "2) get_latest_troubleshoot; if needed create_troubleshoot",
              "3) Report likely causes and next actions. Avoid destructive purge unless explicitly requested.",
            ].join("\n"),
          },
        },
      ],
    }),
  );
}
