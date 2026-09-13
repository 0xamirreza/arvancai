# CDN domains, caching, SSL

## Domains

**Docs:** https://docs.arvancloud.ir/en/cdn/domain/  
**Register:** POST `/domains/dns-service` with `domain`, `domain_type` (`full` | `partial`)  
**Plan:** PUT `/domains/{domain}/plan` with `plan_level` (1/2/3 per docs)

Tools: `list_domains`, `get_domain`, `register_domain`, `set_domain_plan`, `check_domain_nameservers`

## Caching

**Docs:** https://docs.arvancloud.ir/en/cdn/caching/

| Field | Documented values |
| ----- | ----------------- |
| `cache_status` | `off`, `uri` (without query string), `query_string` |
| purge | `{ "purge": "all" }` or `{ "purge": "individual", "purge_urls": ["http://..."] }` |

Tools: `get_caching_settings`, `update_caching_settings`, `purge_cache` (DESTRUCTIVE)

## SSL / HTTPS

**Docs:** https://docs.arvancloud.ir/en/cdn/https-settings/

Documented PATCH fields include: `ssl_status`, `https_redirect`, `replace_http`, `tls_version`, `hsts_*`.

Tools: `get_ssl_settings`, `update_ssl_settings`

**Warning:** HSTS can be difficult to reverse until max-age expires (official warning).
