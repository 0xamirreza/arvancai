# Authentication

## Machine User API key (CDN, Cloud Server, VOD, etc.)

**Official source:** https://docs.arvancloud.ir/en/accounts/iam/machine-user  
**Offline FA:** `../arvancloud-docs/fa/accounts/iam/machine-user/`  
**Usage samples:** https://docs.arvancloud.ir/en/developer-tools/api/api-usage · offline `developer-tools/api/api-usage/`

### Mechanism

1. Create a **Machine User** in the ArvanCloud panel (Settings → Workspace Management → Machine User).
2. Add access keys of type **API Key** and/or **HMAC Key** (FA machine-user docs).
3. For CDN/ECC/VOD management APIs, use the **API Key** in the HTTP `Authorization` header.

Official API Usage samples use:

```http
Authorization: <MU-KEY>
Accept: application/json
```

Where `<MU-KEY>` is the Machine User access key.

### Auth schemes in official CDN OpenAPI-derived SDK

CDN Go SDK HOW-TO documents two schemes:

1. **ApiKey** — header name `Authorization`, value = API key string  
2. **UserToken** — HTTP Bearer token authentication  

Product docs samples variously show:

- `Authorization: <MU-KEY>` (API Usage — preferred pattern for machine users)
- `authorization: API KEY 1 2 3 4` (placeholder in CDN feature pages)
- `Authorization: Bearer <Bearer Token>` (some CDN feature samples)
- `Authorization: Apikey 1 2 3 4` (clone-domain sample)

**Implementation decision:** The MCP server accepts `ARVANCLOUD_API_KEY` and sends it as the raw `Authorization` header value (no invented prefix). Operators may set the env var to either the bare key or a documented form such as `Bearer <token>` if their key type requires it.

### Unauthenticated response

Documented in API Usage:

```json
{ "message": "Unauthenticated." }
```

### Least privilege

Machine Users can be scoped via **access policies** in IAM (official machine-user docs). Prefer a dedicated machine user with only the product permissions required by the tools you enable.

## Object Storage (separate auth)

**Official source:** https://docs.arvancloud.ir/en/developer-tools/api/api-usage  
**Offline FA machine-user:** HMAC keys are documented as usable **only for Object Storage APIs**.

Object Storage S3 samples use **AWS Signature** style auth (`Authorization: AWS ${S3KEY}:$signature`) against hosts such as `s3.ir-thr-at1.arvanstorage.ir`.

Separately, FA `object-storage/metrics` documents bucket metrics via:

```http
GET https://storage.arvanapis.ir/v1/buckets/{bucketName}/metrics
Authorization: [apikey]
```

S3 object CRUD tools remain out of default MCP scope (different signing); metrics may be added later with explicit Apikey config. See `unknowns.md`.

## Secrets handling (project policy)

- Never hardcode keys
- Never commit `.env`
- Never log `Authorization` header or key values
- Never return credentials from MCP tools
