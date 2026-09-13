# Troubleshooting

## CDN troubleshoot API

Official CDN Go SDK paths:

- GET `/domains/{domain}/troubleshoots`
- GET `/domains/{domain}/troubleshoots/latest`
- POST `/domains/{domain}/troubleshoots`

Tools: `list_troubleshoots`, `get_latest_troubleshoot`, `create_troubleshoot`

## Practical checklist

1. Confirm domain exists: `get_domain`
2. NS / activation: `check_domain_nameservers`
3. DNS correctness: `list_dns_records`
4. SSL: `get_ssl_settings`
5. Cache / development mode: `get_caching_settings`
6. Run or fetch troubleshoot results
7. Only purge cache if stale content is confirmed and user approves

## Auth failures

Official unauthenticated body: `{ "message": "Unauthenticated." }` — check Machine User key and IAM policies.
