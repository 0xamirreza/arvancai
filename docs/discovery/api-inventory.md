# API Inventory

**CDN base:** `https://napi.arvancloud.ir/cdn/4.0`  
**Auth column:** MU = Machine User `Authorization` header (see authentication.md)  
**Verified:** `docs` = product docs curl/sample; `sdk` = official CDN Go SDK HOW-TO; `both` = both

Destructive = irreversible delete / purge-all / revoke-style operations.

## CDN — Domains

| Service | Operation | HTTP Method | Endpoint | Auth | Destructive | Verified |
| ------- | --------- | ----------- | -------- | ---- | ----------- | -------- |
| CDN | List domains | GET | `/domains` | MU | No | both |
| CDN | Get domain | GET | `/domains/{domain}` | MU | No | sdk |
| CDN | Register domain (dns-service) | POST | `/domains/dns-service` | MU | No | both |
| CDN | Set domain plan | PUT | `/domains/{domain}/plan` | MU | No | docs |
| CDN | Clone domain config | POST | `/domains/{domain}/clone` | MU | No | docs |
| CDN | Delete domain | DELETE | `/domains/{domain}` | MU | Yes | sdk |
| CDN | Hold domain | POST | `/domains/{domain}/hold` | MU | No* | sdk |
| CDN | Unhold domain | POST | `/domains/{domain}/unhold` | MU | No | sdk |
| CDN | Check NS keys | GET | `/domains/{domain}/ns-keys/check` | MU | No | sdk |
| CDN | Set custom NS | PUT | `/domains/{domain}/ns-keys` | MU | No | docs |
| CDN | Use optional NS | POST | `/domains/{domain}/ns-keys/use-optional-keys` | MU | No | docs |
| CDN | Reset NS keys | DELETE | `/domains/{domain}/ns-keys` | MU | No | sdk |
| CDN | CNAME setup check | GET | `/domains/{domain}/cname-setup/check` | MU | No | sdk |

\*Hold may disrupt CDN service — treat as high-risk write.

## CDN — DNS

| Service | Operation | HTTP Method | Endpoint | Auth | Destructive | Verified |
| ------- | --------- | ----------- | -------- | ---- | ----------- | -------- |
| CDN/DNS | List DNS records | GET | `/domains/{domain}/dns-records` | MU | No | both |
| CDN/DNS | Get DNS record | GET | `/domains/{domain}/dns-records/{id}` | MU | No | sdk |
| CDN/DNS | Create DNS record | POST | `/domains/{domain}/dns-records` | MU | No | both |
| CDN/DNS | Update DNS record | PUT | `/domains/{domain}/dns-records/{id}` | MU | No | sdk |
| CDN/DNS | Delete DNS record | DELETE | `/domains/{domain}/dns-records/{id}` | MU | Yes | sdk |
| CDN/DNS | Toggle cloud (proxy) | PUT | `/domains/{domain}/dns-records/{id}/cloud` | MU | No | sdk |
| CDN/DNS | Get DNSSEC | GET | `/domains/{domain}/dns-records/dnssec` | MU | No | sdk |
| CDN/DNS | Update DNSSEC | PUT | `/domains/{domain}/dns-records/dnssec/actions` | MU | No | sdk |
| CDN/DNS | Export BIND | GET | `/domains/{domain}/dns-records/export` | MU | No | sdk |
| CDN/DNS | Import BIND | POST | `/domains/{domain}/dns-records/import` | MU | No | sdk |

## CDN — Caching

| Service | Operation | HTTP Method | Endpoint | Auth | Destructive | Verified |
| ------- | --------- | ----------- | -------- | ---- | ----------- | -------- |
| CDN | Get caching settings | GET | `/domains/{domain}/caching` | MU | No | sdk |
| CDN | Update caching settings | PATCH | `/domains/{domain}/caching` | MU | No | both |
| CDN | Purge cache | POST | `/domains/{domain}/caching/purge` | MU | Yes* | both |
| CDN | Deprecated purge | DELETE | `/domains/{domain}/caching` | MU | Yes | sdk |

\*Purge-all is disruptive; individual URL purge is scoped but still DESTRUCTIVE to cache state.

## CDN — SSL / HTTPS

| Service | Operation | HTTP Method | Endpoint | Auth | Destructive | Verified |
| ------- | --------- | ----------- | -------- | ---- | ----------- | -------- |
| CDN | Get SSL settings | GET | `/domains/{domain}/ssl` | MU | No | sdk |
| CDN | Update SSL settings | PATCH | `/domains/{domain}/ssl` | MU | No | both |
| CDN | List certificates | GET | `/domains/{domain}/ssl/certificates` | MU | No | sdk |
| CDN | Upload certificate | POST | `/domains/{domain}/ssl/certificates` | MU | No | docs |
| CDN | Delete unused certificate | DELETE | `/domains/{domain}/ssl/certificates/{certificateId}` | MU | Yes | sdk |

## CDN — Security / Firewall / WAF / Rate Limit / DDoS

Full CRUD paths inventoried in CDN Go SDK HOW-TO (classes: FirewallAPI, WAFAPI, RateLimitingAPI, DDoSAPI, AccountLevelFirewallAPI). Product docs confirm WAF and Rate Limit samples. **Not exposed as MCP tools in v1** (see architecture-proposal).

## CDN — Other (inventoried, deferred)

Per CDN Go SDK HOW-TO: Acceleration, Active Health Check, Aggregated Reports, CDN Apps, Custom Pages, Host Header Whitelist, Lists (dynamic-fields), Load Balancing, Log Forwarders, Metric Exporters, Page Rules, Plans, Redirect, Reports, Response Transforms, Secondary DNS, Transport Layer Proxy, Troubleshoot.

## Cloud Server (ECC)

| Service | Operation | HTTP Method | Endpoint | Auth | Destructive | Verified |
| ------- | --------- | ----------- | -------- | ---- | ----------- | -------- |
| ECC | List servers | GET | `/regions/{region}/servers` | MU | No | docs |
| ECC | List images | GET | `/regions/{region}/images` | MU | No | docs |
| ECC | Create server | POST | `/regions/{region}/servers` | MU | No | docs (mentioned; body schema incomplete in API Usage sample) |

Base: `https://napi.arvancloud.ir/ecc/v1`  
Example region from docs: `ir-thr-c2`

## Video Platform (VOD)

| Service | Operation | HTTP Method | Endpoint | Auth | Destructive | Verified |
| ------- | --------- | ----------- | -------- | ---- | ----------- | -------- |
| VOD | List channels | GET | `/channels` | MU | No | docs |
| VOD | Create channel | POST | `/channels` | MU | No | docs |

Base: `https://napi.arvancloud.ir/vod/2.0` — **deferred in v1 tools**

## Object Storage

| Service | Operation | HTTP Method | Endpoint | Auth | Destructive | Verified |
| ------- | --------- | ----------- | -------- | ---- | ----------- | -------- |
| Object Storage | Get object | GET | S3 path on `*.arvanstorage.ir` | AWS Sig | No | docs |
| Object Storage | List objects | GET | bucket host | AWS Sig | No | docs |
| Object Storage | Create bucket | PUT | S3 | AWS Sig | No | docs |

**Deferred in v1** (different credential model).

## Products discovered without full REST inventory in this pass

From https://docs.arvancloud.ir/en/: Cloud Container, Managed Database, Edge Computing, VPC, Drive, Logs, AI-as-a-Service, Developer Terraform refs. Marked for future modules when official HTTP contracts are inventoried like CDN.

## Appendix — Offline FA curl extraction (2026-09-13)

Full extracted operation table: [`offline-fa-api-ops.md`](./offline-fa-api-ops.md)

Notable new bases from FA crawl:

| Service | Base | Offline page |
| ------- | ---- | ------------ |
| Edge Computing | `https://napi.arvancloud.ir/edge-computing/1.0` | `edge-computing/trigger/path/` |
| Object Storage metrics | `https://storage.arvanapis.ir/v1` | `object-storage/metrics/` |
| CDN Metrics scrape | `https://napi.arvancloud.ir/cdn-metrics/v1` | `cdn/analytics/metric-exporter/` |

ECC create body (FA API Usage): `name`, `network_id`, `flavor_id`, `image_id`, `security_groups[{name}]`, `ssh_key`, `key_name`, `count`.
