# Architecture Proposal

Date: 2026-09-13

## Language choice

| Option | Pros | Cons |
| ------ | ---- | ---- |
| **TypeScript + `@modelcontextprotocol/server`** | Strongest MCP SDK maturity; Zod schemas; stdio hosting | Node runtime required |
| Python | Good MCP SDK | Slightly weaker typing for tool schemas |
| Go | Official CDN Go SDK exists | MCP Go ecosystem less convenient for skill packaging |

**Decision:** TypeScript (MCP server package + Zod).

## Supported services (v1)

| Service | Scope | Rationale |
| ------- | ----- | --------- |
| CDN Domains | list/get/register/plan/ns-check | Priority #1; fully verified |
| CDN DNS | list/get/create/update/delete/cloud | Priority #1; verified |
| CDN Caching | get/update/purge | Priority #2; verified |
| CDN SSL | get/update settings | Verified product samples |
| CDN Troubleshoot | list/latest/create | Useful ops; SDK-verified paths |
| Cloud Server | list servers, list images (READ) | Verified samples; create deferred (body incomplete) |

Deferred: Object Storage (S3 auth), VOD, Firewall/WAF/DDoS full CRUD, Load Balancers, Containers, DBaaS.

## MCP tools (semantic)

### Domains — risk labels

| Tool | Risk | Maps to |
| ---- | ---- | ------- |
| `list_domains` | READ | GET `/domains` |
| `get_domain` | READ | GET `/domains/{domain}` |
| `register_domain` | WRITE | POST `/domains/dns-service` |
| `set_domain_plan` | WRITE | PUT `/domains/{domain}/plan` |
| `check_domain_nameservers` | READ | GET `/domains/{domain}/ns-keys/check` |

### DNS

| Tool | Risk | Maps to |
| ---- | ---- | ------- |
| `list_dns_records` | READ | GET `.../dns-records` |
| `get_dns_record` | READ | GET `.../dns-records/{id}` |
| `create_dns_record` | WRITE | POST `.../dns-records` |
| `update_dns_record` | WRITE | PUT `.../dns-records/{id}` |
| `delete_dns_record` | DESTRUCTIVE | DELETE `.../dns-records/{id}` |
| `set_dns_record_cloud` | WRITE | PUT `.../dns-records/{id}/cloud` |

### Caching

| Tool | Risk | Maps to |
| ---- | ---- | ------- |
| `get_caching_settings` | READ | GET `.../caching` |
| `update_caching_settings` | WRITE | PATCH `.../caching` |
| `purge_cache` | DESTRUCTIVE | POST `.../caching/purge` |

### SSL

| Tool | Risk | Maps to |
| ---- | ---- | ------- |
| `get_ssl_settings` | READ | GET `.../ssl` |
| `update_ssl_settings` | WRITE | PATCH `.../ssl` |

### Troubleshoot

| Tool | Risk | Maps to |
| ---- | ---- | ------- |
| `list_troubleshoots` | READ | GET `.../troubleshoots` |
| `get_latest_troubleshoot` | READ | GET `.../troubleshoots/latest` |
| `create_troubleshoot` | WRITE | POST `.../troubleshoots` |

### Cloud Server

| Tool | Risk | Maps to |
| ---- | ---- | ------- |
| `list_servers` | READ | GET `/ecc/v1/regions/{region}/servers` |
| `list_images` | READ | GET `/ecc/v1/regions/{region}/images` |

**No** `raw_api` / arbitrary HTTP proxy tool.

## MCP resources

| URI | Why |
| --- | --- |
| `arvancloud://domains` | Snapshot of domain list for agent context |
| `arvancloud://domains/{domain}` | Domain detail |
| `arvancloud://domains/{domain}/dns` | DNS record list for a domain |

Resources are read-only mirrors of GET tools.

## MCP prompts

| Prompt | Purpose |
| ------ | ------- |
| `inspect_domain` | Guided read-only domain + DNS + SSL + cache inspection |
| `audit_dns` | DNS inventory and anomaly checklist |
| `review_dns_change` | Pre/post change verification workflow |
| `troubleshoot_cdn` | Use troubleshoot APIs + state reads |

## Safety model

1. Explicit resource IDs for destructive tools (`record_id`, exact `domain`).
2. `purge_cache` requires `purge` enum `all` | `individual`; individual requires non-empty `purge_urls`.
3. No multi-delete helpers.
4. Writes/destructive tools annotate risk in descriptions.
5. Secrets only via env; redacted logging.
6. Retries: GET/idempotent safe; POST/PUT/PATCH/DELETE no automatic retry except 429 with Retry-After.

## Auth architecture

```
ARVANCLOUD_API_KEY ──► Authorization header (as-is)
ARVANCLOUD_CDN_BASE_URL (optional, default napi .../cdn/4.0)
ARVANCLOUD_ECC_BASE_URL (optional, default napi .../ecc/v1)
```

## Skill structure

```
skill/
  SKILL.md
  references/{services,dns,cdn,cloud-server,troubleshooting}.md
  workflows/{dns-change,domain-audit,incident-troubleshooting}.md
```

Object-storage / networking reference files omitted until tools exist.
