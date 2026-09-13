# Traceability

Each implemented MCP capability maps to official documentation.

## Auth

| Item | Value |
| ---- | ----- |
| Mechanism | Machine User access key in `Authorization` header |
| Docs | https://docs.arvancloud.ir/en/accounts/iam/machine-user |
| Samples | https://docs.arvancloud.ir/en/developer-tools/api/api-usage |

## list_domains

| Field | Value |
| ----- | ----- |
| Official | https://docs.arvancloud.ir/en/developer-tools/api/api-usage |
| HTTP | GET `https://napi.arvancloud.ir/cdn/4.0/domains` |
| Auth | MU key |
| Input | none |
| Output | JSON API response (pass-through) |

## get_domain

| Field | Value |
| ----- | ----- |
| Official | CDN Go SDK HOW-TO DomainAPI DomainsShow |
| HTTP | GET `/cdn/4.0/domains/{domain}` |
| Auth | MU key |

## register_domain

| Field | Value |
| ----- | ----- |
| Official | https://docs.arvancloud.ir/en/cdn/domain/ + API Usage |
| HTTP | POST `/cdn/4.0/domains/dns-service` |
| Body | `domain`, `domain_type` (`full`\|`partial`), optional `plan_level` |

## set_domain_plan

| Field | Value |
| ----- | ----- |
| Official | https://docs.arvancloud.ir/en/cdn/domain/ |
| HTTP | PUT `/cdn/4.0/domains/{domain}/plan` |
| Body | `plan_level` (1/2/3 documented) |

## check_domain_nameservers

| Field | Value |
| ----- | ----- |
| Official | CDN Go SDK HOW-TO DomainsNameserversCheck |
| HTTP | GET `/cdn/4.0/domains/{domain}/ns-keys/check` |

## list_dns_records / get_dns_record / create / update / delete / cloud

| Tool | Method | Path | Docs |
| ---- | ------ | ---- | ---- |
| list | GET | `/domains/{domain}/dns-records` | API Usage + SDK |
| get | GET | `/domains/{domain}/dns-records/{id}` | SDK |
| create | POST | `/domains/{domain}/dns-records` | https://docs.arvancloud.ir/en/cdn/dns-records/adding-records |
| update | PUT | `/domains/{domain}/dns-records/{id}` | SDK (product edit page describes UI semantics) |
| delete | DELETE | `/domains/{domain}/dns-records/{id}` | SDK |
| cloud | PUT | `/domains/{domain}/dns-records/{id}/cloud` | SDK |

## Caching tools

| Tool | Method | Path | Docs |
| ---- | ------ | ---- | ---- |
| get | GET | `/domains/{domain}/caching` | SDK |
| update | PATCH | `/domains/{domain}/caching` | https://docs.arvancloud.ir/en/cdn/caching/ |
| purge | POST | `/domains/{domain}/caching/purge` | https://docs.arvancloud.ir/en/cdn/caching/ |

## SSL tools

| Tool | Method | Path | Docs |
| ---- | ------ | ---- | ---- |
| get | GET | `/domains/{domain}/ssl` | SDK |
| update | PATCH | `/domains/{domain}/ssl` | https://docs.arvancloud.ir/en/cdn/https-settings/ |

## Troubleshoot tools

CDN Go SDK TroubleshootAPI — GET/POST under `/domains/{domain}/troubleshoots`.

## Cloud Server tools

| Tool | Method | Path | Docs |
| ---- | ------ | ---- | ---- |
| list_servers | GET | `/ecc/v1/regions/{region}/servers` | API Usage |
| list_images | GET | `/ecc/v1/regions/{region}/images` | API Usage |

## Resources / prompts

Resources mirror GET domain/DNS endpoints above. Prompts encode safe workflows over those tools only.
