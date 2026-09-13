# Container / DBaaS — documentation status

Official portal: [https://www.arvancloud.ir/fa/dev/api](https://www.arvancloud.ir/fa/dev/api). Specs in `openapi/`.

## Cloud Container

**Implemented (curated MCP reads)** from `paas-1.25.json`:

- Base `https://napi.arvancloud.ir/caas/v2/zones/{zone}`
- Tools: pods, deployments, services, configmaps, pod logs

Full K8s surface (134 paths) is **not** mirrored 1:1 — use kubectl for complex apply workflows.

## Managed Database (DBaaS)

**Partial MCP** from `iaas-1.0.json`:

- `GET /regions/{region}/databases/flavors` → `list_database_flavors`
- `POST /regions/{region}/databases` → `create_database` (`datastoreType`, `flavorRef`)

No dedicated DBaaS OpenAPI card; list/delete instance inventory still incomplete.

## Drive / Logs

Still absent from the FA Products API grid OpenAPI set.
