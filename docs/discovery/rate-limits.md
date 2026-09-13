# Rate Limits

## API consumer rate limits (calling napi.arvancloud.ir)

**Status: UNKNOWN / NOT DOCUMENTED** in the official API Usage and CDN product docs reviewed on 2026-09-13.

No official numeric quotas, burst sizes, or Retry-After contracts for the management API were found in:

- https://docs.arvancloud.ir/en/developer-tools/api/api-usage
- CDN Go SDK HOW-TO

## CDN Rate Limit *product* feature

The page https://docs.arvancloud.ir/en/cdn/security/rate-limit documents **customer-facing** rate limiting rules for domains (WAF-adjacent product), with management endpoints under `/domains/{domain}/rate-limit/...`.

That is **not** documentation of how many management API calls an automation client may send.

## Implementation policy

Because official API rate-limit numbers are undocumented:

- Do **not** invent numeric quotas.
- On HTTP **429**, if present, respect `Retry-After` when supplied by the server; otherwise use a conservative backoff.
- Avoid uncontrolled retry storms.
- Log rate-limit events without secrets.
