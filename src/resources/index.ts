import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/server";
import type { ArvanCloudClient } from "../client/arvancloud-client.js";

export function registerResources(server: McpServer, client: ArvanCloudClient): void {
  server.registerResource(
    "domains",
    "arvancloud://domains",
    {
      description:
        "Read-only list of CDN domains (GET /cdn/4.0/domains). Useful context before DNS/CDN changes.",
      mimeType: "application/json",
    },
    async (uri) => {
      const data = await client.cdnRequest("domains", { method: "GET", idempotent: true });
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "domain",
    new ResourceTemplate("arvancloud://domains/{domain}", { list: undefined }),
    {
      description: "Read-only CDN domain detail. Official: GET /cdn/4.0/domains/{domain}",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const domain = String(variables.domain);
      const data = await client.cdnRequest(`domains/${encodeURIComponent(domain)}`, {
        method: "GET",
        idempotent: true,
      });
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "domain-dns",
    new ResourceTemplate("arvancloud://domains/{domain}/dns", { list: undefined }),
    {
      description:
        "Read-only DNS records for a domain. Official: GET /cdn/4.0/domains/{domain}/dns-records",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const domain = String(variables.domain);
      const data = await client.cdnRequest(
        `domains/${encodeURIComponent(domain)}/dns-records`,
        { method: "GET", idempotent: true },
      );
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "cdn-edge-ips",
    "arvancloud://cdn/edge-ips",
    {
      description:
        "Public ArvanCloud CDN edge IP list (https://www.arvancloud.ir/fa/ips.txt) — same source as github.com/arvancloud/ar-ipwhitelist.",
      mimeType: "text/plain",
    },
    async (uri) => {
      const res = await fetch("https://www.arvancloud.ir/fa/ips.txt");
      if (!res.ok) {
        throw new Error(`Failed to download IP list: HTTP ${res.status}`);
      }
      const text = await res.text();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/plain",
            text,
          },
        ],
      };
    },
  );

  server.registerResource(
    "official-github-sdks",
    "arvancloud://meta/github-org",
    {
      description:
        "Index of useful public (mostly archived) github.com/arvancloud repositories relevant to APIs/SDKs.",
      mimeType: "application/json",
    },
    async (uri) => {
      const data = {
        org: "https://github.com/orgs/arvancloud/repositories",
        note: "All listed repos were archived as of 2026-09; still useful as historical API/SDK references.",
        useful: [
          {
            repo: "https://github.com/arvancloud/cdn-go",
            use: "CDN Go SDK / OpenAPI-generated client — aligns with cdn/4.0",
          },
          {
            repo: "https://github.com/arvancloud/ecc-go-client",
            use: "IaaS/ECC Go client — aligns with ecc/v1 OpenAPI",
          },
          {
            repo: "https://github.com/arvancloud/ar-prometheus-exporter",
            use: "CDN report paths used by get_cdn_*_report tools",
          },
          {
            repo: "https://github.com/arvancloud/ar-ipwhitelist",
            use: "CDN edge IP list URL → arvancloud://cdn/edge-ips",
          },
          {
            repo: "https://github.com/arvancloud/vodapisdk",
            use: "VOD PHP SDK (historical)",
          },
          {
            repo: "https://github.com/arvancloud/live-php-sdk",
            use: "LIVE PHP SDK (historical)",
          },
          {
            repo: "https://github.com/arvancloud/cli",
            use: "Legacy CLI (archived)",
          },
          {
            repo: "https://github.com/arvancloud/terraform-provider-arvan",
            use: "Terraform resources incl. areas without full REST OpenAPI (e.g. logs)",
          },
          {
            repo: "https://github.com/arvancloud/ArvanCloudS3",
            use: "Object Storage / S3 helpers (archived)",
          },
        ],
        not_api: [
          "nginx forks, WAF internals, UI components, WHMCS/cPanel plugins, paas language samples",
        ],
      };
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );
}
