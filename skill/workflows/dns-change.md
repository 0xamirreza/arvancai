# Workflow: DNS change

1. Clarify the change (type, name, value, cloud flag).
2. `list_dns_records` for the domain.
3. If updating/deleting, select exact `record_id` from the list (or `get_dns_record`).
4. Show the user the intended payload; refuse if ambiguous.
5. Call `create_dns_record` / `update_dns_record` / `delete_dns_record` / `set_dns_record_cloud`.
6. `list_dns_records` or `get_dns_record` to verify.
7. Remind that DNS TTL / registrar NS may delay external visibility.
