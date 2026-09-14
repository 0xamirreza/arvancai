# Workflow: DNS change

1. Clarify the change (type, name, value, cloud flag). For zone file bulk load, use `import_dns_zone` only after explicit user confirmation.
2. Confirm the domain is on the account (`list_domains` / `get_domain`) and, for public DNS-01 work, that it is published (`dig SOA <domain> @8.8.8.8`).
3. `list_dns_records` (or `export_dns_zone` for a BIND snapshot).
4. If updating/deleting, select exact `record_id` from the list (or `get_dns_record`).
5. Show the user the intended payload; refuse if ambiguous. Respect `ARVANCLOUD_READ_ONLY=1` if set.
6. Call `create_dns_record` / `update_dns_record` / `delete_dns_record` / `set_dns_record_cloud` / `import_dns_zone`.
7. `list_dns_records` or `get_dns_record` to verify.
8. Remind that DNS TTL / registrar NS may delay external visibility. Iran DNS filtering may return forged `10.10.34.*` IPs — use a public resolver for checks (see `references/gotchas.md`).
