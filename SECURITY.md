# Security

## Credentials

- Use Machine User keys with least privilege IAM policies.
- Configure via `ARVANCLOUD_API_KEY` only (or process env from the MCP host).
- Never commit `.env` or keys.
- Logs redact authorization/secret-like fields; never print the API key.
- Object Storage S3 uses separate HMAC env vars (`ARVANCLOUD_S3_*`), never the Machine User key for SigV4.

## Auth on the wire

| Target | Header |
| ------ | ------ |
| Local napi / OpenAPI HTTP | `Authorization: Apikey <uuid>` (normalized from env) |
| Hosted MCP bridge | `Arvancloud-Api-Key: apikey <uuid>` |

Do not log either header.

## MCP boundaries

- No shell execution tools.
- No arbitrary URL fetch / SSRF-style tools.
- No unrestricted ArvanCloud HTTP proxy (`raw_api`).
- OpenAPI invokers only allow paths in mirrored allowlists.
- Destructive tools are explicitly named and validated.
- Hosted MCP tools are re-exported through the bridge; treat them with the same caution as panel/API writes (confirm before delete Space/Sink/Forwarder).

## Read-only mode

Set `ARVANCLOUD_READ_ONLY=1` for audit agents:

- Blocks POST / PUT / PATCH / DELETE on the HTTP client
- Blocks S3 create/put/delete bucket & object
- Refuses non-read bridged official MCP tools

Prefer a Machine User with read-scoped IAM **and** `ARVANCLOUD_READ_ONLY=1` when possible.

## Operational risk

| Action | Risk |
| ------ | ---- |
| `delete_dns_record` | Removes DNS resolution for that record |
| `import_dns_zone` | May create many records at once |
| `purge_cache` (`all`) | Origin load spike / brief stale-content miss storms |
| `update_ssl_settings` (HSTS) | Hard to reverse until max-age expires (official docs warn) |
| Bridged Logs delete Space/Sink/Forwarder | May be irreversible — confirm first |

## Reporting

Treat this as infrastructure automation. Prefer read-only machine users for audit agents.
