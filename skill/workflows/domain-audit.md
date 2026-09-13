# Workflow: Domain audit

1. `list_domains` (or resource `arvancloud://domains`) if domain unknown.
2. `get_domain` + `check_domain_nameservers`.
3. `list_dns_records` — note duplicates, missing apex/www, cloud flags.
4. `get_ssl_settings` + `get_caching_settings`.
5. Produce a read-only report; no writes unless requested.
