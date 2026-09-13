# Architecture

See also `docs/architecture-proposal.md`.

## Layers

```text
MCP tools / resources / prompts
        ↓
Service modules (domains, dns, caching, ssl, troubleshoot, cloud-server)
        ↓
ArvanCloudClient (auth, HTTP, retries, error normalization, logging)
        ↓
Official ArvanCloud HTTP APIs
```

## API versions (documented)

| Adapter | Base URL | Version path |
| ------- | -------- | ------------ |
| CDN | `https://napi.arvancloud.ir/cdn/4.0` | CDN **4.0** (SDK API label 4.181.1) |
| ECC | `https://napi.arvancloud.ir/ecc/v1` | **v1** |

Optional env overrides: `ARVANCLOUD_CDN_BASE_URL`, `ARVANCLOUD_ECC_BASE_URL`.

## Safety

- Semantic tools only (no arbitrary URL/HTTP proxy).
- Destructive ops require precise IDs / explicit purge mode.
- Retries only for GET/idempotent or forced cases; respect Retry-After on 429 when present.

## Skill

`skill/SKILL.md` teaches tool selection and safe workflows for agents using this MCP server.
