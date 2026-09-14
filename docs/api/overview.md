# API notes

Primary product documentation: https://docs.arvancloud.ir/en/developer-tools/api/api-usage

OpenAPI specs (preferred over ReDoc HTML): https://www.arvancloud.ir/api-docs/  
Mirrored under `docs/discovery/openapi/`.

CDN Go SDK HOW-TO (historical path catalog): often referenced alongside OpenAPI for CDN.

Official **hosted MCP** (Logs management + future toolsets):  
https://docs.arvancloud.ir/fa/developer-tools/mcp/ — bridged by arvancai; see `docs/bridge-official-mcp.md`.

Contract rules for this package:

1. Prefer portal OpenAPI allowlists for `invoke_*_api`.
2. Named tools must map to verified methods/paths (`docs/traceability.md`).
3. Do not invent Drive / wallet / unpublished Logs management REST — use panel, Terraform, or the hosted MCP bridge.
