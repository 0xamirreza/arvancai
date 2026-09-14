# Changelog

## 0.6.1

### Features
- Canonical auth: `Authorization: Apikey <uuid>` (normalize bare / Apikey / Bearer env values)
- `ARVANCLOUD_READ_ONLY=1` — block mutating HTTP, S3 writes, and non-read bridged tools
- Named tools: `import_dns_zone`, `export_dns_zone`, `get_region_quota`
- Skill: TLS/acme.sh DNS-01, Iran DNS gotchas, wallet note (`skill/references/dns.md`, `gotchas.md`)

### Docs
- README / ARCHITECTURE / SECURITY / DEVELOPMENT refreshed for bridge + auth + read-only
- `docs/bridge-official-mcp.md` — hosted MCP bridge behaviour
- Traceability, authentication, api-inventory, unknowns, examples README updated

## 0.6.0

- Official hosted MCP bridge to `https://mcp.arvancloud.ir` (Cloud Logs management + future toolsets)
- Soft-fail when remote unreachable; `ARVANCLOUD_OFFICIAL_MCP*` env knobs

## 0.5.x

- Initial npm package: local OpenAPI-backed tools, auto `setup`, Agent Skill
