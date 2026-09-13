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
| `npm test` | Vitest unit tests (mocked HTTP) |

## Layout

```text
src/client/     ArvanCloud HTTP client, auth, errors
src/tools/      MCP tools by service
src/resources/  MCP resources
src/prompts/    MCP prompts
src/schemas/    Zod validation
skill/          Agent skill
docs/           Discovery + traceability
tests/          Unit tests
```

## Adding a tool

1. Verify the endpoint in official docs or CDN Go SDK HOW-TO.
2. Add a row to `docs/discovery/api-inventory.md` and `docs/traceability.md`.
3. Implement via `ArvanCloudClient` (no ad-hoc fetch in tools).
4. Classify READ / WRITE / DESTRUCTIVE in description + annotations.
5. Add unit tests for validation and error paths.
6. Update Skill references if user-facing.
