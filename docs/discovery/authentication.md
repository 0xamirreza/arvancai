# Authentication

## Machine User API key (CDN, Cloud Server, VOD, etc.)

**Official source:** https://docs.arvancloud.ir/en/accounts/iam/machine-user  
**Offline FA:** `../arvancloud-docs/fa/accounts/iam/machine-user/`  
**Usage samples:** https://docs.arvancloud.ir/en/developer-tools/api/api-usage · offline `developer-tools/api/api-usage/`  
**Hosted MCP:** https://docs.arvancloud.ir/fa/developer-tools/mcp/

### Mechanism

1. Create a **Machine User** in the ArvanCloud panel (Settings → Workspace Management → Machine User).
2. Add access keys of type **API Key** and/or **HMAC Key** (FA machine-user docs).
3. For CDN/ECC/VOD management APIs, use the **API Key**.

### What arvancai sends

| Target | Header |
| ------ | ------ |
| Local napi / ECC / VOD / Edge / CaaS / AI / Storage mgmt | `Authorization: Apikey <uuid>` |
| CloudLogs ingest | same |
| Hosted MCP bridge (`mcp.arvancloud.ir`) | `Arvancloud-Api-Key: apikey <uuid>` |

`ARVANCLOUD_API_KEY` may contain:

- bare UUID
- `Apikey <uuid>` / `apikey <uuid>`
- `Bearer <token>` (stripped to uuid then re-prefixed as `Apikey`)

The client **normalizes** to the canonical forms above (`src/client/auth.ts`).

Product docs and SDK samples historically disagree (`Authorization: <MU-KEY>`, `Apikey …`, `Bearer …`). Canonical `Apikey` matches community-verified smoke checks and Fluent Bit CloudLogs / hosted MCP docs.

### Unauthenticated response

Documented in API Usage:

```json
{ "message": "Unauthenticated." }
```

### Least privilege

Machine Users can be scoped via **access policies** in IAM. Prefer a dedicated machine user with only the product permissions required. For audit agents also set `ARVANCLOUD_READ_ONLY=1`.

## Object Storage (separate auth)

**Official source:** https://docs.arvancloud.ir/en/developer-tools/api/api-usage  
**Offline FA machine-user:** HMAC keys are documented as usable **only for Object Storage APIs**.

Object Storage S3 tools use **AWS Signature** style auth via `@aws-sdk/client-s3` with:

- `ARVANCLOUD_S3_ACCESS_KEY_ID`
- `ARVANCLOUD_S3_SECRET_ACCESS_KEY`
- optional `ARVANCLOUD_S3_ENDPOINT` / `ARVANCLOUD_S3_REGION`

Separately, FA `object-storage/metrics` documents bucket metrics via Machine User Apikey on `storage.arvanapis.ir` — used by `get_bucket_metrics` / list buckets management tools.

## Secrets handling (project policy)

- Never hardcode keys
- Never commit `.env`
- Never log `Authorization` / `Arvancloud-Api-Key` or key values
- Never return credentials from MCP tools
