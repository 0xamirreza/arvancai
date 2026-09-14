---
name: arvancai
description: >-
  Operate ArvanCloud via the arvancai MCP server (CDN/DNS, Cloud Server, Storage,
  VOD/Live/Ads, Edge, CaaS, AIaaS, DBaaS partial, CloudLogs ingest + official Logs MCP bridge).
  Use when the user asks about ArvanCloud — only with official OpenAPI/docs-backed tools.
  Install: npm i -g arvancai.
---

# ArvanCloud Agent Skill

Companion MCP: **`arvancai`** (npm: `npm install -g arvancai`) **v0.6.1**. Official API portal: [https://www.arvancloud.ir/fa/dev/api](https://www.arvancloud.ir/fa/dev/api).

**Do not invent** endpoints, zones, regions, or IDs.

## Coverage model

1. **Named tools** — preferred for common safe workflows (DNS, cache, list servers, CDN reports, …).
2. **OpenAPI invokers** — full official surface, path must match allowlist:
   `invoke_cdn_api`, `invoke_storage_api`, `invoke_iaas_v1_api`, `invoke_iaas_v3_api`, `invoke_vod_api`, `invoke_live_api`, `invoke_vads_api`, `invoke_edge_api`, `invoke_caas_api`, `invoke_aiaas_api`.
3. **CloudLogs ingest** — `write_cloud_logs` (Fluent Bit write API).
4. **Official hosted MCP bridge** — tools/prompts from [mcp.arvancloud.ir](https://mcp.arvancloud.ir) (today: Logs spaces/sinks/forwarders; more toolsets as Arvan enables them). Same `ARVANCLOUD_API_KEY`. Soft-fail if unreachable. Disable: `ARVANCLOUD_OFFICIAL_MCP=0`.
5. **No REST OpenAPI yet** — Drive, dedicated VPC product card, Accounts management, Developer-tools hub, Changelog → see `docs/discovery/no-rest-products.md`. Do not invent.

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
| CloudLogs management | hosted MCP toolset `logs` | Bridged tools (e.g. `logs_space_list`, sinks, forwarders) + prompt `logs_route_domain_logs` |
| CDN edge IPs | ips.txt | resource `arvancloud://cdn/edge-ips` |
| Drive / VPC product / Accounts / Changelog | — | **Blocked** or Terraform-only |

## Operational workflow

```text
Understand request → pick product → READ with exact IDs/zones → WRITE only if explicit → verify
```

For Logs management, prefer bridged official tools (`logs_*`) over inventing REST calls.

## Safety rules

1. Never invent `record_id`, domain, region, zone, namespace, or UUIDs.
2. Prefer READ first.
3. Destructive tools (`delete_*`, `purge=all`, delete Space/Sink/Forwarder) only on unambiguous requests — confirm before delete.
4. CaaS: require real `zone` (`ir-tbz-sh1` / `ir-thr-ba1` from OpenAPI) + `namespace` from the user/account — do not guess.
5. Credentials in env only (`ARVANCLOUD_API_KEY`; S3 HMAC for S3 tools).
6. Set `ARVANCLOUD_READ_ONLY=1` when the user only wants inventory / diagnosis.

## Auth

- Local napi/OpenAPI tools: `Authorization: Apikey <uuid>` (env may be bare UUID or already prefixed; client normalizes).
- Bridged hosted MCP: same key as `Arvancloud-Api-Key: apikey <UUID>` (see [MCP docs](https://docs.arvancloud.ir/fa/developer-tools/mcp/)).
- Optional: `ARVANCLOUD_READ_ONLY=1` blocks mutating calls.

## Gotchas

See [gotchas.md](references/gotchas.md) — Iran DNS forged IPs, active-but-unpublished domains, no wallet API, OpenAPI vs ReDoc.

## TLS / Let's Encrypt

DNS-01 wildcard via `acme.sh` + `dns_arvan`: see [dns.md](references/dns.md) (TLS section). Prefer MCP DNS tools for manual TXT; use acme.sh for issuance/renewal automation.

## References

- [services.md](references/services.md)
- [openapi-bases.md](references/openapi-bases.md)
- [dns.md](references/dns.md) · [cdn.md](references/cdn.md) · [security.md](references/security.md)
- [storage.md](references/storage.md) · [edge.md](references/edge.md) · [cloud-server.md](references/cloud-server.md)
- [caas.md](references/caas.md) · [aiaas.md](references/aiaas.md) · [video.md](references/video.md)
- [troubleshooting.md](references/troubleshooting.md) · [gotchas.md](references/gotchas.md)

## Workflows

- [dns-change.md](workflows/dns-change.md)
- [domain-audit.md](workflows/domain-audit.md)
- [incident-troubleshooting.md](workflows/incident-troubleshooting.md)
