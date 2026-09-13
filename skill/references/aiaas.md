# AI-as-a-Service

**OpenAPI:** [aiaas/1.0](https://www.arvancloud.ir/api/aiaas/1.0) · `aiaas-1.0.json`  
**Base (MCP default):** `https://napi.arvancloud.ir/ai/v1`

| Tool | Path |
| ---- | ---- |
| `list_ai_providers` | `/providers` |
| `list_ai_models` / `get_ai_model` | `/models` |
| `list_ai_endpoints` / `get_ai_endpoint` | `/endpoints` |
| `list_ai_datasets` | `/datasets` |
| `list_ai_knowledge_bases` | `/knowledge-bases` |
| `list_ai_buckets` | `/buckets/{region}` |

Chat/completions against a user-specific endpoint URL remains out of scope unless the user supplies the endpoint from `list_ai_endpoints`.
