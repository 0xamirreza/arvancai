import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ToolContext } from "./helpers.js";
import { toolError, toolResult } from "./helpers.js";
import { DomainNameSchema } from "../schemas/common.js";

/** Periods used by official arvancloud/ar-prometheus-exporter + CDN OpenAPI reports. */
const PeriodSchema = z
  .enum(["1h", "3h", "6h", "12h", "24h", "7d", "30d"])
  .default("3h")
  .describe("Report period (ar-prometheus-exporter METRICS_PERIOD)");

/**
 * CDN domain reports — paths from CDN OpenAPI 4.x and used by
 * https://github.com/arvancloud/ar-prometheus-exporter
 */
export function registerCdnReportTools(server: McpServer, ctx: ToolContext): void {
  const report = (
    name: string,
    title: string,
    suffix: string,
    description: string,
  ) => {
    server.registerTool(
      name,
      {
        title,
        description,
        inputSchema: z.object({
          domain: DomainNameSchema,
          period: PeriodSchema,
        }),
        annotations: { readOnlyHint: true, openWorldHint: true },
      },
      async ({ domain, period }) => {
        try {
          return toolResult(
            await ctx.client.cdnRequest(
              `domains/${encodeURIComponent(domain)}/reports/${suffix}`,
              { method: "GET", idempotent: true, query: { period } },
            ),
          );
        } catch (e) {
          return toolError(e);
        }
      },
    );
  };

  report(
    "get_cdn_traffic_report",
    "CDN traffic/requests report",
    "traffics",
    "[READ] OpenAPI + ar-prometheus-exporter: GET /domains/{domain}/reports/traffics?period=",
  );
  report(
    "get_cdn_visitors_report",
    "CDN unique visitors report",
    "visitors",
    "[READ] OpenAPI + ar-prometheus-exporter: GET /domains/{domain}/reports/visitors?period=",
  );
  report(
    "get_cdn_geo_report",
    "CDN geo traffic map report",
    "traffics/map",
    "[READ] OpenAPI + ar-prometheus-exporter: GET /domains/{domain}/reports/traffics/map?period=",
  );
  report(
    "get_cdn_response_time_report",
    "CDN response-time report",
    "response-time",
    "[READ] OpenAPI + ar-prometheus-exporter: GET /domains/{domain}/reports/response-time?period=",
  );
  report(
    "get_cdn_status_report",
    "CDN HTTP status-code report",
    "status",
    "[READ] OpenAPI + ar-prometheus-exporter: GET /domains/{domain}/reports/status?period=",
  );
  report(
    "get_cdn_high_request_ips",
    "CDN high-request IPs report",
    "high-request-ips",
    "[READ] OpenAPI + ar-prometheus-exporter: GET /domains/{domain}/reports/high-request-ips?period= (Professional+ plans)",
  );
}
