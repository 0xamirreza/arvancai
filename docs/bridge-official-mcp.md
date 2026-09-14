# Official hosted MCP bridge

ArvanCloud ships a remote MCP at [https://mcp.arvancloud.ir](https://mcp.arvancloud.ir)  
(docs: [FA MCP overview](https://docs.arvancloud.ir/fa/developer-tools/mcp/), [quickstart](https://docs.arvancloud.ir/fa/developer-tools/mcp/quickstart/), [client setup](https://docs.arvancloud.ir/fa/developer-tools/mcp/client-setup/), [examples](https://docs.arvancloud.ir/fa/developer-tools/mcp/examples/)).

**arvancai** connects to that server over Streamable HTTP and re-registers its tools/prompts/resources into the same local stdio server — so agents see **one** MCP surface.

## Why

| Local OpenAPI tools | Hosted MCP |
| ------------------- | ---------- |
| CDN, DNS, IaaS, Storage, Video, Edge, CaaS, AI | Cloud Logs management (spaces / sinks / forwarders) |
| Strong OpenAPI coverage | Toolsets marked “coming soon” for CDN/IaaS/… |

Bridging fills Logs management without inventing undocumented REST.

## Behaviour

1. On server start (unless disabled), connect with:
   - `Arvancloud-Api-Key: apikey <UUID>` (from `ARVANCLOUD_API_KEY`)
   - `X-Mcp-Toolsets: all` (override via env)
2. `tools/list` → register each tool locally; call forwards to the remote.
3. Same for prompts and fixed-URI resources.
4. Soft-fail on connect/timeout errors (default timeout 5s).
5. Local tool names win on collision.
6. With `ARVANCLOUD_READ_ONLY=1`, bridged tools that look write-like (or lack `readOnlyHint: true`) return an error instead of calling remote.

## Env

| Variable | Default | Meaning |
| -------- | ------- | ------- |
| `ARVANCLOUD_OFFICIAL_MCP` | on | Set `0` / `false` / `off` to disable |
| `ARVANCLOUD_OFFICIAL_MCP_URL` | `https://mcp.arvancloud.ir` | Override endpoint |
| `ARVANCLOUD_OFFICIAL_MCP_TOOLSETS` | `all` | e.g. `logs` or `logs,cdn` when available |
| `ARVANCLOUD_OFFICIAL_MCP_TIMEOUT_MS` | `5000` | Connect timeout |

## Implementation

- `src/bridge/official-mcp.ts` — client + registration
- `src/bridge/json-schema-to-zod.ts` — remote JSON Schema → Zod for `registerTool`

## Relation to dual MCP config

You can still add a separate Cursor entry for `url: https://mcp.arvancloud.ir` as in Arvan’s docs. With arvancai’s bridge enabled, that is **redundant** for Logs and doubles tool noise — prefer a single `arvancai` server.
