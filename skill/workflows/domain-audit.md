# Workflow: Domain audit

1. `list_domains` (or resource `arvancloud://domains`) if domain unknown.
2. `get_domain` + `check_domain_nameservers`.
3. Optionally confirm public publish: `dig SOA <domain> @8.8.8.8` (panel `active` ≠ published).
4. `list_dns_records` — note duplicates, missing apex/www, cloud flags. Optional: `export_dns_zone`.
5. `get_ssl_settings` + `get_caching_settings`.
6. Produce a read-only report; no writes unless requested. Prefer `ARVANCLOUD_READ_ONLY=1` for audit sessions.
