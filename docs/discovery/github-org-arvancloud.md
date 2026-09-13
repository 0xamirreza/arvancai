# github.com/arvancloud repositories (reviewed 2026-09-13)

Org: [https://github.com/orgs/arvancloud/repositories](https://github.com/orgs/arvancloud/repositories) — **51 public repos, all archived**.

## Added to MCP from useful repos

| Repo | What we took |
| ---- | ------------ |
| [ar-prometheus-exporter](https://github.com/arvancloud/ar-prometheus-exporter) | Named CDN report tools (`get_cdn_*_report`) matching exporter paths under `cdn/4.0` |
| [ar-ipwhitelist](https://github.com/arvancloud/ar-ipwhitelist) | Resource `arvancloud://cdn/edge-ips` ← `https://www.arvancloud.ir/fa/ips.txt` |
| [cdn-go](https://github.com/arvancloud/cdn-go) / [ecc-go-client](https://github.com/arvancloud/ecc-go-client) | Already covered by portal OpenAPI + `invoke_*` |
| [vodapisdk](https://github.com/arvancloud/vodapisdk) / [live-php-sdk](https://github.com/arvancloud/live-php-sdk) | Align with existing VOD/LIVE OpenAPI |
| [terraform-provider-arvan](https://github.com/arvancloud/terraform-provider-arvan) | Reference for products without REST OpenAPI (logs management) — not executable HTTP inventory |
| [cli](https://github.com/arvancloud/cli) | Legacy; no new endpoints extracted for MCP |

## Skipped (not management REST for our MCP)

nginx/OpenResty forks, WAF internals, UI packages, WHMCS/cPanel/WordPress/Drupal plugins, PaaS language samples, ACME forks, Telegram lottery, etc.

## Also added (web research, not GitHub org)

| Source | MCP |
| ------ | --- |
| Fluent Bit ArvanCloud CloudLogs plugin | `write_cloud_logs` → `POST /logging/v1/entries/write` |

MCP resource index: `arvancloud://meta/github-org`
