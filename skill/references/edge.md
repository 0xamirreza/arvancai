# Edge Computing

**OpenAPI:** [ec/1.0](https://www.arvancloud.ir/api/ec/1.0) · `docs/discovery/openapi/ec-1.0.yaml`  
**Base (default):** `https://napi.arvancloud.ir/edge-computing/v1`  
Override: `ARVANCLOUD_EDGE_BASE_URL` (older FA samples used `.../edge-computing/1.0`).

| Tool | Method | Path |
| ---- | ------ | ---- |
| `list_edge_computes` | GET | `/edge-computes` |
| `get_edge_compute` | GET | `/edge-computes/{id}` |
| `list_edge_routes` | GET | `/edge-computes/{id}/routes` |
| `create_edge_route` | POST | `/edge-computes/{id}/routes` (domain, url, status) |
| `update_edge_route` | PUT | `/edge-computes/{id}/routes/{route_id}` |
| `delete_edge_route` | DELETE | `/edge-computes/{id}/routes/{route_id}` |
| `list_edge_plans` | GET | `/plans` |
| `list_edge_templates` | GET | `/templates` |
| `get_edge_namespace` | GET | `/namespace` |
| `list_edge_deployments` | GET | `/edge-computes/{id}/deployments` |
| `list_edge_env_variables` | GET | `/edge-computes/{id}/env-variables` |
| `set_edge_env_variable` | POST | `/edge-computes/{id}/env-variables` |
| `deploy_edge_compute` | POST | `/edge-computes/deploy` |

Auth: `Authorization` ApiKey.
