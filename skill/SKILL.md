---
name: arvancai
description: >-
  Operate ArvanCloud via the arvancai MCP server (CDN/DNS, Cloud Server, Storage,
  VOD/Live/Ads, Edge, CaaS, AIaaS, DBaaS partial). Use when the user asks about
  ArvanCloud — only with official OpenAPI/docs-backed tools. Install: npm i -g arvancai.
---

# ArvanCloud Agent Skill

Companion MCP: **`arvancai`** (npm: `npm install -g arvancai`) **v0.5**. Official API portal: [https://www.arvancloud.ir/fa/dev/api](https://www.arvancloud.ir/fa/dev/api).

**Do not invent** endpoints, zones, regions, or IDs.

## Coverage model

1. **Named tools** — preferred for common safe workflows (DNS, cache, list servers, CDN reports, …).
2. **OpenAPI invokers** — full official surface, path must match allowlist:
   `invoke_cdn_api`, `invoke_storage_api`, `invoke_iaas_v1_api`, `invoke_iaas_v3_api`, `invoke_vod_api`, `invoke_live_api`, `invoke_vads_api`, `invoke_edge_api`, `invoke_caas_api`, `invoke_aiaas_api`.
3. **Integrations without portal OpenAPI** — `write_cloud_logs` (Fluent Bit CloudLogs write API).
4. **No REST OpenAPI yet** — Drive, dedicated VPC product card, Accounts management, Developer-tools hub, Changelog → see `docs/discovery/no-rest-products.md`. Do not invent.

## Service discovery

| User need | Base / OpenAPI | MCP tools |
| --------- | -------------- | --------- |
| CDN / DNS / Security | `cdn/4.0` | Named CDN tools + reports + `invoke_cdn_api` |
| CDN analytics | reports/* | `get_cdn_traffic_report`, visitors, geo, response-time, status, high-request-ips |
| Cloud Server | `ecc/v1` + iaas `3.0.0` | Named ECC tools + iaas invokers |
| DBaaS | partial in iaas-1.0 | `list_database_flavors`, `create_database` + iaas invoker |
| Object Storage | S3 + storage OpenAPI | S3 tools + `invoke_storage_api` |
| VOD / LIVE / Ads | `vod\|live\|vads/2.0` | Named reads + full `invoke_*` |
| Edge Computing | `edge-computing/v1` | Named tools + `invoke_edge_api` |
| Cloud Container | `caas/v2/zones/{zone}` | Named reads + `invoke_caas_api` |
| AI / AIaaS | `ai/v1` | Named reads + `invoke_aiaas_api` |
| CloudLogs ingest | `logging/v1` | `write_cloud_logs` |
| CDN edge IPs | ips.txt | resource `arvancloud://cdn/edge-ips` |
| Drive / VPC product / Accounts / Changelog | — | **Blocked** or Terraform-only |

## Operational workflow

```text
Understand request → pick product → READ with exact IDs/zones → WRITE only if explicit → verify
```

## Safety rules

1. Never invent `record_id`, domain, region, zone, namespace, or UUIDs.
2. Prefer READ first.
3. Destructive tools (`delete_*`, `purge=all`) only on unambiguous requests.
4. CaaS: require real `zone` (`ir-tbz-sh1` / `ir-thr-ba1` from OpenAPI) + `namespace` from the user/account — do not guess.
5. Credentials in env only (`ARVANCLOUD_API_KEY`; S3 HMAC for S3 tools).

## Auth

Machine User key as `Authorization` header (OpenAPI ApiKey / api_key schemes).

## References

- [services.md](references/services.md)
- [openapi-bases.md](references/openapi-bases.md)
- [dns.md](references/dns.md) · [cdn.md](references/cdn.md) · [security.md](references/security.md)
- [storage.md](references/storage.md) · [edge.md](references/edge.md) · [cloud-server.md](references/cloud-server.md)
- [caas.md](references/caas.md) · [aiaas.md](references/aiaas.md) · [video.md](references/video.md)
- [troubleshooting.md](references/troubleshooting.md)

## Workflows

- [dns-change.md](workflows/dns-change.md)
- [domain-audit.md](workflows/domain-audit.md)
- [incident-troubleshooting.md](workflows/incident-troubleshooting.md)
