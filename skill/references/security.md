# CDN Firewall & Rate Limit

## Firewall

Paths (CDN Go SDK + FA table): settings GET/PATCH; rules list/get/create/update/delete; reprioritize POST.

Create sample fields (FA): `name`, `note`, `is_enabled`, `action`, `action_details`, `filter_expr`.

## Rate Limit

Paths (CDN Go SDK + EN/FA table): settings GET/PATCH; rules CRUD; reprioritize.

Create sample fields: `url_pattern`, `rate`, `time_duration`, `is_enabled`, `description`, `exclude_sources`, `burst`, `block_duration`, `allowed_methods`, optional `action`/`action_details`.
