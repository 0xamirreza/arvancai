# Object Storage

**OpenAPI:** [storage/1.0.0](https://www.arvancloud.ir/api/storage/1.0.0) · management API `https://storage.arvanapis.ir`  
**S3:** region endpoint e.g. `https://s3.ir-thr-at1.arvanstorage.ir` (HMAC keys).

| Tool | Auth | Notes |
| ---- | ---- | ----- |
| `list_buckets` / object CRUD | S3 HMAC | Needs `ARVANCLOUD_S3_*` |
| `list_storage_api_buckets` | Machine User | OpenAPI GET `/v1/buckets` |
| `get_bucket_metrics` | Machine User | GET `/v1/buckets/{name}/metrics` |
| `get_storage_report` | Machine User | GET `/v1/reports/storage` |
