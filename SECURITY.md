# Security

## Credentials

- Use Machine User keys with least privilege IAM policies.
- Configure via `ARVANCLOUD_API_KEY` only (or process env from the MCP host).
- Never commit `.env` or keys.
- Logs redact authorization/secret-like fields; never print the API key.

## MCP boundaries

- No shell execution tools.
- No arbitrary URL fetch / SSRF-style tools.
- No unrestricted ArvanCloud HTTP proxy (`raw_api`).
- Destructive tools are explicitly named and validated.

## Operational risk

| Action | Risk |
| ------ | ---- |
| `delete_dns_record` | Removes DNS resolution for that record |
| `purge_cache` (`all`) | Can cause origin load spike / brief stale-content miss storms |
| `update_ssl_settings` (HSTS) | Hard to reverse until max-age expires (official docs warn) |

## Reporting

Treat this as infrastructure automation. Prefer read-only machine users for audit agents.
