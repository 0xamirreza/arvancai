# Operational gotchas

## Auth

- Canonical header for napi / ECC / VOD / …: `Authorization: Apikey <uuid>`.
- `arvancai` normalizes bare UUID, `apikey …`, and `Apikey …` to that form.
- Hosted MCP bridge uses `Arvancloud-Api-Key: apikey <uuid>` (see MCP docs).
- Wrong/missing/under-permissioned key → `{"message":"Unauthenticated."}` or product 403. Check IAM rules on the Machine User, not just the env name.

## Specs vs docs HTML

- Fetch OpenAPI from `https://www.arvancloud.ir/api-docs/<file>` (e.g. `cdn-4.0.yml`). ReDoc pages under `/api/{product}/…` often time out.
- Human guides on `docs.arvancloud.ir` sit behind CDN cookies; bare `curl -L` can 307-loop. Seed cookies first if scraping.

## DNS / Iran

- Forged filter IPs: `10.10.34.34`, `10.10.34.35`, `10.10.34.36`.
- Empty SOA/NS → usually unpublished/broken delegation, not filtering.
- Panel `active` ≠ publicly published — verify with `dig SOA <domain> @8.8.8.8` before DNS-01.

## Read-only mode

Set `ARVANCLOUD_READ_ONLY=1` to block all mutating HTTP (POST/PUT/PATCH/DELETE) from local tools and to refuse non-read bridged official MCP tools. GET inventory still works.

## No billing API

Wallet balance is panel-only. Do not invent payment/wallet endpoints.
