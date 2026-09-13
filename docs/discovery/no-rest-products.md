# Products without public REST OpenAPI

These checklist items **cannot** be fully implemented as MCP HTTP tools without inventing APIs. Offline FA docs + portal OpenAPI (2026-09-13) were checked.

| Product | What exists | Why MCP incomplete |
| ------- | ----------- | ------------------ |
| آروان‌درایو | Panel/product docs under `fa/drive` | No `napi`/`arvanapis` REST samples or OpenAPI on [FA API portal](https://www.arvancloud.ir/fa/dev/api) |
| لاگ ابری | Terraform `cloudlogs_*`; **ingestion** via Fluent Bit → `write_cloud_logs` (`POST /logging/v1/entries/write`) | Management OpenAPI still missing; write tool added from Fluent Bit contract |
| شبکه ابری خصوصی (VPC) | Terraform `vpc_*`; partial **IaaS** network attach paths | No dedicated VPC OpenAPI card; use `invoke_iaas_v1_api` / `invoke_iaas_v3_api` for documented network ops only |
| حساب کاربری | IAM / machine-user docs | Auth via `ARVANCLOUD_API_KEY` only — no Accounts management OpenAPI |
| ابزار توسعه‌دهندگان | Docs hub (CLI/SDK/Terraform) | Meta product — MCP itself is the integration layer; no single “dev tools” REST API |
| گزارش تغییرات | `fa/changelog` HTML | Changelog is documentation, not a management API (mentions `cdn-metrics` URLs historically) |

## What we did instead for OpenAPI products

`invoke_*_api` tools expose **100% of operations** listed in mirrored OpenAPI allowlists (`src/openapi/allowlists/`), rejecting anything not in the official spec:

| Tool | Ops |
| ---- | --- |
| `invoke_cdn_api` | 238 |
| `invoke_storage_api` | 58 |
| `invoke_iaas_v1_api` | 136 |
| `invoke_iaas_v3_api` | 45 |
| `invoke_vod_api` | 54 |
| `invoke_live_api` | 36 |
| `invoke_vads_api` | 29 |
| `invoke_edge_api` | 25 |
| `invoke_caas_api` | 299 |
| `invoke_aiaas_api` | 43 |

Named curated tools remain preferred for common safe workflows.
