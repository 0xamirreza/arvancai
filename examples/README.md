# Example MCP host configs

These JSON snippets show a minimal `arvancai` entry. Prefer `arvancai setup` which writes absolute `node` + bin paths for GUI apps.

| File | Host |
| ---- | ---- |
| `cursor-mcp.json` | Cursor (`~/.cursor/mcp.json` or project `.cursor/mcp.json`) |
| `claude-desktop-mcp.json` | Claude Desktop |
| `codex-mcp.json` | Codex |
| `windsurf-mcp.json` | Windsurf |
| `opencode-mcp.json` | OpenCode |

## Optional env

Classic hosts (Cursor / Claude / Codex / Windsurf) use `env`:

```json
"env": {
  "ARVANCLOUD_API_KEY": "<MU-KEY>",
  "ARVANCLOUD_READ_ONLY": "1",
  "ARVANCLOUD_OFFICIAL_MCP": "1",
  "ARVANCLOUD_OFFICIAL_MCP_TOOLSETS": "logs",
  "ARVANCLOUD_S3_ACCESS_KEY_ID": "...",
  "ARVANCLOUD_S3_SECRET_ACCESS_KEY": "..."
}
```

OpenCode uses `type: "local"`, `command` as an **array**, `enabled`, and `environment` (not `env` / `args`). See `opencode-mcp.json` and https://opencode.ai/docs/mcp-servers/.

Do **not** add a second remote server for `https://mcp.arvancloud.ir` unless you disabled the bridge (`ARVANCLOUD_OFFICIAL_MCP=0`). See `docs/bridge-official-mcp.md`.
