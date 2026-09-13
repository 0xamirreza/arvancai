# Offline FA documentation corpus

**Path:** `/home/arsedighi/Desktop/Dev/ArvanCloud AI/arvancloud-docs/fa`  
**Origin:** official `https://docs.arvancloud.ir/fa/` (local crawl)

This corpus is used as a **first-class official source** alongside English docs and the CDN Go SDK HOW-TO.

## Artifacts produced from the crawl

| File | Purpose |
| ---- | ------- |
| `offline-fa-api-ops.md` | Table of curl operations extracted from FA HTML |
| `offline-fa-ops.json` | Machine-readable extraction |
| `offline-fa-extract.json` | Earlier page-level extract |

## Crawler HTML caveat

Some pages split `https://` into `https : //` inside `<pre>` blocks. Extractions normalize this before parsing.

## Important findings not as clear in EN API Usage

1. **ECC create server body** is fully sampled (FA API Usage): `name`, `network_id`, `flavor_id`, `image_id`, `security_groups`, `ssh_key`, `key_name`, `count`; region example `nl-ams-su1`.
2. **VOD** includes `GET /vod/2.0/channels/{channel-id}/videos` (FA API Usage).
3. **Machine User** supports **API Keys** and **HMAC Keys**; HMAC is documented as usable **only for Object Storage APIs**.
4. **Edge Computing** REST base: `https://napi.arvancloud.ir/edge-computing/1.0/` (route create/update samples).
5. **Object Storage metrics** control API: `GET https://storage.arvanapis.ir/v1/buckets/{bucketName}/metrics` with Apikey auth.
6. Product FA pages include detailed bodies for acceleration, image-resize, DNSSEC (`enable`), NS keys, DDoS `protection_mode`, WAF `mode`, firewall rules, rate-limit rules, metric exporters, dynamic-fields lists, custom pages, log forwarders.

## Path conflicts to note

| Topic | FA product docs | CDN Go SDK HOW-TO |
| ----- | --------------- | ----------------- |
| WAF mode patch | `PATCH .../waf` | `PATCH .../waf/settings` |
| DDoS mode patch | `PATCH .../ddos` | `PATCH .../ddos/settings` |

MCP tools that expose these use the **product documentation paths** from the FA corpus and record the SDK alternate in traceability.

## Normalization bug watch

Naive replacement of `/domains/{name}` can turn `/domains/dns-service` into `/domains/{domain}`. Prefer explicit allowlisting for special paths (`dns-service`, `claims`, `transfer`, `order`, `lookup`).
