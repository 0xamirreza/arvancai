# Development

## Prerequisites

- Node.js ≥ 20
- npm (if your default registry is slow/unreachable, use `--registry https://registry.npmjs.org/`)

## Setup

```bash
npm install --registry https://registry.npmjs.org/
cp .env.example .env
npm run build
```

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled stdio MCP server |
| `npm run dev` | Run via `tsx` |
| `npm run typecheck` / `npm run lint` | TypeScript checks |
| `npm test` | Vitest unit tests (mocked HTTP; bridge disabled via env in tests) |

## Layout

```text
src/client/     ArvanCloud HTTP client, auth, errors
src/bridge/     Official hosted MCP bridge (Streamable HTTP)
src/tools/      MCP tools by service
src/resources/  MCP resources
src/prompts/    MCP prompts
src/openapi/    Allowlists for invoke_* tools
src/schemas/    Zod validation
src/cli/        setup / help / package paths
skill/          Agent skill + references + workflows
docs/           Discovery, bridge notes, traceability
tests/          Unit tests
examples/       Sample MCP host configs
```

## Environment (dev)

See `.env.example`. Common flags:

- `ARVANCLOUD_OFFICIAL_MCP=0` — skip hosted bridge (faster local startup / offline)
- `ARVANCLOUD_READ_ONLY=1` — refuse mutating calls while testing agents

## Adding a tool

1. Verify the endpoint in official OpenAPI (`docs/discovery/openapi/`) or product docs.
2. Add a row to `docs/discovery/api-inventory.md` and `docs/traceability.md`.
3. Implement via `ArvanCloudClient` (no ad-hoc fetch in tools). Use `formData` / `accept: "text"` when needed.
4. Classify READ / WRITE / DESTRUCTIVE in description + annotations.
5. Add unit tests for validation and error paths.
6. Update Skill references (`skill/references/…`) if user-facing.

## Bridge changes

- Prefer soft-fail behaviour; never make local tools depend on hosted MCP availability.
- Keep JSON Schema → Zod conversion conservative (`passthrough` objects).
- Document env knobs in `.env.example`, `README.md`, and `docs/bridge-official-mcp.md`.

## Docs checklist before release

- [ ] `README.md` coverage table
- [ ] `ARCHITECTURE.md` / `SECURITY.md`
- [ ] `docs/traceability.md` for new named tools
- [ ] `skill/SKILL.md` + relevant references
- [ ] `.env.example` / `src/cli/help.ts`
