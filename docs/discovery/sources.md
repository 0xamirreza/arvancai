# Official Documentation Sources

Discovery date: 2026-09-13 (updated same day with offline FA corpus)

## Primary sources (official)

| Source | URL | Role |
| ------ | --- | ---- |
| Product docs (EN) | https://docs.arvancloud.ir/en/ | Product + API usage guides |
| Product docs (FA) | https://docs.arvancloud.ir/fa/ | Same official corpus |
| **Offline FA crawl** | `../arvancloud-docs/fa/` | Local mirror of FA docs — used as primary enrichment source |
| API Usage (EN/FA) | https://docs.arvancloud.ir/en/developer-tools/api/api-usage · offline `developer-tools/api/api-usage/` | Auth + CDN/ECC/VOD/Object Storage samples |
| Machine User (FA) | offline `accounts/iam/machine-user/` | API Keys + HMAC Keys |
| CDN Domain / DNS / Caching / HTTPS / Security | offline `cdn/**` | Rich curl bodies |
| Edge Computing routes | offline `edge-computing/trigger/path/` | `edge-computing/1.0` API |
| Object Storage metrics | offline `object-storage/metrics/` | `storage.arvanapis.ir` |
| AI-as-a-Service | offline `aiaas/api-usage/` | OpenAI-compatible chat completions on endpoint URL |

## Official API surface reference (OpenAPI-derived SDK docs)

| Source | URL | Notes |
| ------ | --- | ----- |
| CDN Go SDK HOW-TO | https://git.arvancloud.ir/arvancloud/cdn-go-sdk/-/blob/main/docs/HOW-TO.md | CDN **4.0**; API label **4.181.1** |

Product docs (especially FA offline) are preferred for **request body examples**. SDK HOW-TO is preferred for **full endpoint inventory**.

## Base URLs verified

| Service | Base URL | Verified in |
| ------- | -------- | ----------- |
| CDN / DNS / Security | `https://napi.arvancloud.ir/cdn/4.0` | EN+FA API Usage, FA CDN pages, SDK |
| Cloud Server (ECC) | `https://napi.arvancloud.ir/ecc/v1` | EN+FA API Usage |
| Video Platform (VOD) | `https://napi.arvancloud.ir/vod/2.0` | EN+FA API Usage |
| CDN Metrics | `https://napi.arvancloud.ir/cdn-metrics/v1` | FA metric-exporter / changelog |
| Edge Computing | `https://napi.arvancloud.ir/edge-computing/1.0` | FA edge-computing path docs |
| Object Storage S3 | `https://s3.<region>.arvanstorage.ir` | FA/EN API Usage (AWS Signature / HMAC) |
| Object Storage metrics | `https://storage.arvanapis.ir/v1` | FA object-storage/metrics |

## Offline extraction outputs

See `offline-fa-corpus.md`, `offline-fa-api-ops.md`.

## Intentionally not used as source of truth

- Third-party CLIs / GitHub forks
- Blog posts / Stack Overflow
- Unofficial API wrappers
- LLM prior knowledge without doc verification
