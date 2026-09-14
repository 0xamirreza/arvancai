# Architecture

See also `docs/architecture-proposal.md` and `docs/bridge-official-mcp.md`.

## Layers

```text
IDE / Agent
    │
    ▼
arvancai stdio MCP (McpServer)
    │
    ├── Local tools / resources / prompts
    │       └── ArvanCloudClient
    │               ├── Auth: Authorization: Apikey <uuid>
    │               ├── Retries (GET / idempotent), Retry-After
    │               ├── ARVANCLOUD_READ_ONLY → block mutating methods
    │               └── napi + regional OpenAPI hosts
    │
    └── Official hosted MCP bridge (default on)
            └── Streamable HTTP → https://mcp.arvancloud.ir
                    headers: Arvancloud-Api-Key, X-Mcp-Toolsets
```

Bridge soft-fails if the hosted MCP is unreachable; local OpenAPI tools keep working.

## Auth

| Surface | Header |
| ------- | ------ |
| napi / ECC / VOD / Storage mgmt / … | `Authorization: Apikey <uuid>` |
| CloudLogs ingest (`write_cloud_logs`) | same canonical `Apikey` form |
| Hosted MCP bridge | `Arvancloud-Api-Key: apikey <uuid>` |

`ARVANCLOUD_API_KEY` may be bare UUID or already prefixed; the client normalizes.

## API versions (documented)

| Adapter | Base URL | Notes |
| ------- | -------- | ----- |
| CDN | `https://napi.arvancloud.ir/cdn/4.0` | DNS, cache, SSL, security, reports |
| ECC v1 | `https://napi.arvancloud.ir/ecc/v1` | Servers, quota, power actions |
| ECC v3 | `https://ecc.{region}.arvanapis.ir/v3` | Prefer for inventory / flavors |
| VOD / Live / VADS | `napi.../vod|live|vads/2.0` | Live uses `/streams` (not `/channels`) |
| Edge | `napi.../edge-computing/v1` | |
| CaaS | `napi.../caas/v2/zones/{zone}` | |
| AIaaS | `napi.../ai/v1` | |
| Storage mgmt | `https://storage.arvanapis.ir/v1` | |
| Logging ingest | `napi.../logging/v1` | Write path only |
| Hosted MCP | `https://mcp.arvancloud.ir` | Logs management today |

Optional env overrides: see `.env.example`.

## Safety

- Semantic / allowlisted tools only (no arbitrary URL proxy).
- OpenAPI invokers (`invoke_*_api`) reject paths outside mirrored allowlists.
- Destructive ops require precise IDs / explicit purge mode.
- `ARVANCLOUD_READ_ONLY=1` blocks POST/PUT/PATCH/DELETE, S3 writes, and non-read bridged tools.
- Retries only for GET/idempotent or forced cases; respect Retry-After on 429 when present.
- Name collisions: local tools win over bridged tools with the same name.

## Packages of note

| Path | Role |
| ---- | ---- |
| `src/client/` | HTTP client, auth, errors |
| `src/bridge/` | Official MCP client bridge + JSON Schema → Zod |
| `src/tools/` | Named MCP tools by product |
| `src/openapi/allowlists/` | Invoker allowlists from portal specs |
| `skill/` | Agent Skill + references/workflows |

## Skill

`skill/SKILL.md` teaches tool selection, TLS/acme.sh, Iran DNS gotchas, and safe workflows.
