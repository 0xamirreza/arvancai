# Unknowns / Not Documented

Items that must **not** be invented in code or Skill content.

| Topic | Status | Impact |
| ----- | ------ | ------ |
| Management API rate-limit quotas | UNKNOWN | Conservative 429 handling only |
| Exact pagination for every list | Partial (OpenAPI where present) | Pass verified query params only |
| AIaaS absolute host | Spec has `basePath: /ai/v1` without `host` | MCP default `https://napi.arvancloud.ir/ai/v1` (same napi pattern); override via env |
| AIaaS chat/completions URL | User-specific endpoint | Use endpoint from `list_ai_endpoints` — not hard-coded |
| CaaS auth scheme in OpenAPI | No `securitySchemes` in paas-1.25 | Same Machine User `Authorization` as other napi APIs |
| Edge path version | OpenAPI `edge-computing/v1`; older FA samples `1.0` | Default is `v1`; override `ARVANCLOUD_EDGE_BASE_URL` |
| Full DBaaS instance list/delete | Only create + flavors in iaas-1.0 | Partial tools only |
| Drive / Logs **management** OpenAPI | Not on FA portal product grid | Ingest via `write_cloud_logs`; management via hosted MCP bridge |
| WAF/DDoS path FA vs SDK | FA `/waf`,`/ddos` vs SDK `/waf/settings` | Tools follow FA product paths |
| Authorization header prefix variants | Samples disagree | **Resolved for arvancai:** always send `Authorization: Apikey <uuid>` |
| CDN webhook event catalog | UNKNOWN | No webhook tools |
| Wallet / billing API | Not in any published OpenAPI | Panel-only; do not invent endpoints |
| Hosted MCP toolset roadmap | CDN/IaaS/… marked «به‌زودی» | Bridge uses `X-Mcp-Toolsets` (default `all`) so new sets appear when Arvan enables them |

## Scope deferrals

- Full CDN OpenAPI surface (156 paths) — subset already in MCP; rest via `invoke_cdn_api`
- Full CaaS K8s write/apply surface
- Full IaaS v3 write surface (create server v3 body differs from v1)
- Live/VADS stream/campaign writes (reads first)
- Object Storage management beyond buckets list/metrics/report
- Native Logs management REST (use bridge; no portal OpenAPI yet)
