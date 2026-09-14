# Services

| Product | API | MCP |
| ------- | --- | --- |
| CDN / DNS / Security | `cdn/4.0` | Yes (named + `invoke_cdn_api`) |
| DNS zone import/export | `cdn/4.0` …/dns-records/import\|export | `import_dns_zone` / `export_dns_zone` |
| Cloud Server | `ecc/v1` + `ecc.{region}.arvanapis.ir/v3` | Yes |
| Region quota | `ecc/v1` …/quota | `get_region_quota` |
| DBaaS (partial) | `ecc/v1` …/databases* | flavors + create only |
| VOD / LIVE / Ads | `vod\|live\|vads/2.0` | Yes (curated; Live = `/streams`) |
| Edge Computing | `edge-computing/v1` | Yes (OpenAPI-backed) |
| Object Storage | S3 + `storage.arvanapis.ir` | Yes |
| Cloud Container | `caas/v2/zones/{zone}` | Curated K8s reads |
| AI-as-a-Service | `ai/v1` | Curated reads |
| CloudLogs ingest | `logging/v1` | `write_cloud_logs` |
| CloudLogs management | hosted MCP `logs` | Bridged from `mcp.arvancloud.ir` |
| Drive / VPC card / Accounts / Changelog | — | No OpenAPI on portal |

See also [gotchas.md](gotchas.md) and [dns.md](dns.md) for TLS/acme.sh and Iran DNS notes.
