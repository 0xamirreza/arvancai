# DNS (CDN) + TLS certificates

**Docs:** https://docs.arvancloud.ir/en/cdn/dns-records/adding-records  
**API:** `https://napi.arvancloud.ir/cdn/4.0/domains/{domain}/dns-records`

## Tools

| Task | Tool | Risk |
| ---- | ---- | ---- |
| List | `list_dns_records` | READ |
| Get one | `get_dns_record` | READ |
| Create | `create_dns_record` | WRITE |
| Update | `update_dns_record` | WRITE |
| Delete | `delete_dns_record` | DESTRUCTIVE |
| Toggle CDN proxy | `set_dns_record_cloud` | WRITE |
| Import BIND zone | `import_dns_zone` | WRITE |
| Export zone | `export_dns_zone` | READ |

## Record fields (gotchas)

- `name` — **subdomain label only, not FQDN.** Use `@` for apex (`www`, `_acme-challenge`).
- `type` — responses often lowercase (`a`, `txt`, …); create samples may use uppercase.
- `value` — **typed object/array** depending on type (see adding-records docs). Preserve GET shape on updates.
- `cloud` — `true` = proxied via Arvan CDN; `false` = DNS-only.

### Common `value` shapes

```jsonc
// A / AAAA
{ "type": "A", "name": "www", "value": [{ "ip": "1.2.3.4", "country": "" }], "ttl": 3600, "cloud": false }
// CNAME
{ "type": "CNAME", "name": "blog", "value": { "host": "target.example.com" }, "ttl": 3600 }
// TXT (e.g. ACME)
{ "type": "TXT", "name": "_acme-challenge", "value": { "text": "token..." }, "ttl": 120 }
```

## Safety

- Obtain `record_id` only from API responses.
- Editing NS records provided by ArvanCloud for the domain is restricted — be careful.
- Confirm public delegation before DNS-01 (see TLS section).

## TLS — Let's Encrypt wildcard via acme.sh `dns_arvan`

`acme.sh` ships `dns_arvan`, which creates/cleans `_acme-challenge` TXT via the same CDN DNS API.

Token env **must** include the `Apikey ` prefix (same Machine User key):

```bash
# Normalize the same key arvancai uses
RAW="${ARVANCLOUD_API_KEY#apikey }"; RAW="${RAW#Apikey }"
export Arvan_Token="Apikey $RAW"

~/.acme.sh/acme.sh --set-default-ca --server letsencrypt   # once
~/.acme.sh/acme.sh --issue --dns dns_arvan \
  -d example.ir -d '*.example.ir' --server letsencrypt
```

Default cert paths: `~/.acme.sh/<domain>_ecc/` (`fullchain.cer`, `<domain>.key`, …).

Deploy after renew with `acme.sh --install-cert --reloadcmd ...` (store per-domain SSH/reload targets outside the skill — e.g. your own notes or `~/.config/arvan/config.json` if you keep one).

### Before DNS-01

1. List domains live (`list_domains`) — don't trust a remembered list.
2. A domain can be `status: active` in the panel yet **not published** on Arvan authoritative NS. Confirm: `dig SOA <domain> @8.8.8.8`.
3. Let's Encrypt validates from outside Iran; local Iranian DNS quirks don't affect LE, but they confuse local debugging (see Gotchas).

## Gotchas (Iran / DNS)

- Iran's DNS filtering often returns forged IPs `10.10.34.34` / `.35` / `.36` — **not** empty answers. Empty SOA/NS usually means a **delegation/publishing** problem, not censorship.
- Prefer resolving against a public resolver (`@8.8.8.8` / `@1.1.1.1`) when checking publish state.

## Wallet / billing

There is **no wallet or billing REST API** in published OpenAPI. Balance is panel-only (npanel → Wallet / کیف پول). Closest APIs are usage/quota (e.g. `get_region_quota`, Object Storage stats, CDN plans) — not balance.
