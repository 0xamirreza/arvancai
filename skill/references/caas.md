# Cloud Container (CaaS)

**OpenAPI:** [paas/1.25](https://www.arvancloud.ir/api/paas/1.25) · `paas-1.25.json`  
**Base:** `https://napi.arvancloud.ir/caas/v2/zones/{zone}`  
Zones in OpenAPI servers: `ir-tbz-sh1` (Shahriar), `ir-thr-ba1` (Bamdad).

Curated MCP tools (not full K8s surface):

| Tool | Path |
| ---- | ---- |
| `list_caas_pods` / `get_caas_pod` | `/api/v1/namespaces/{ns}/pods` |
| `get_caas_pod_logs` | `.../pods/{name}/log` |
| `list_caas_deployments` / `get_caas_deployment` | `/apis/apps/v1/namespaces/{ns}/deployments` |
| `list_caas_services` | `/api/v1/namespaces/{ns}/services` |
| `list_caas_configmaps` | `/api/v1/namespaces/{ns}/configmaps` |

Require exact `zone` + `namespace` from the user/project. Prefer kubectl for complex manifests when appropriate.
