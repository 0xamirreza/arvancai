# arvancai

**ArvanCloud MCP server + Agent Skill** — manage ArvanCloud from any MCP-capable agent/IDE  
(Cursor, Windsurf, Claude Desktop/Code, Codex, OpenCode, …).

```bash
npm install -g arvancai
```

Requires **Node.js ≥ 20** and an ArvanCloud **Machine User** API key:  
https://docs.arvancloud.ir/en/accounts/iam/machine-user

```text
Any Agent / IDE  ──►  Skill (optional workflows)  +  MCP (tools)
                              │
                              ▼
                    arvancai (stdio MCP server)
                              │
                              ▼
                 ArvanCloud official APIs (napi / OpenAPI)
```

---

## 1) Install (one line)

```bash
npm install -g arvancai
```

Check:

```bash
arvancai --help 2>/dev/null || which arvancai
# binary path, e.g. /usr/local/bin/arvancai
```

The process speaks **MCP over stdio** (JSON-RPC on stdout; logs on stderr). Do not run it as a normal CLI chat — wire it into an MCP client.

---

## 2) Set API key

```bash
export ARVANCLOUD_API_KEY="your-machine-user-key"
```

Optional Object Storage (S3 HMAC):

```bash
export ARVANCLOUD_S3_ACCESS_KEY_ID="..."
export ARVANCLOUD_S3_SECRET_ACCESS_KEY="..."
```

See `.env.example` for all overrides.

---

## 3) Connect any MCP client

Use the same pattern everywhere: **command = `arvancai`**, env = `ARVANCLOUD_API_KEY`.

### Cursor

`~/.cursor/mcp.json` (or project `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "arvancai": {
      "command": "arvancai",
      "env": {
        "ARVANCLOUD_API_KEY": "<MU-KEY>"
      }
    }
  }
}
```

Skill (Cursor Agent Skills): copy the packaged `skill/` folder into your skills directory  
(e.g. `~/.cursor/skills/arvancai/` or project `.cursor/skills/arvancai/`).  
After global install, find it with:

```bash
npm root -g
# then: $(npm root -g)/arvancai/skill
```

### Windsurf

MCP settings (Cascade / MCP servers) — same stdio shape:

```json
{
  "mcpServers": {
    "arvancai": {
      "command": "arvancai",
      "env": {
        "ARVANCLOUD_API_KEY": "<MU-KEY>"
      }
    }
  }
}
```

### Claude Desktop

Edit Claude config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "arvancai": {
      "command": "arvancai",
      "env": {
        "ARVANCLOUD_API_KEY": "<MU-KEY>"
      }
    }
  }
}
```

### Claude Code / Codex / OpenCode / other MCP hosts

Any host that supports **MCP stdio** servers:

| Field | Value |
| ----- | ----- |
| command | `arvancai` (or absolute path from `which arvancai`) |
| args | _(none)_ |
| env | `ARVANCLOUD_API_KEY` |

Example configs also live in `examples/` after install:

```bash
ls "$(npm root -g)/arvancai/examples"
```

If the host cannot find a global binary (GUI apps on macOS), use the full path:

```bash
which arvancai
```

```json
"command": "/usr/local/bin/arvancai"
```

Or:

```json
"command": "npx",
"args": ["-y", "arvancai"]
```

---

## 4) Skill vs MCP

| Piece | Role | Portability |
| ----- | ---- | ----------- |
| **MCP (`arvancai`)** | Tools / resources / prompts over the MCP protocol | Works on **all** MCP clients |
| **Skill (`skill/SKILL.md`)** | Agent playbook (when to call which tool, safety rules) | Best on Cursor-style Agent Skills; elsewhere paste/link as project instructions |

MCP alone is enough for tool calling. Skill improves agent behavior where the host supports skills/rules.

---

## Publish checklist (maintainers — از صفر)

بعد از ثبت‌نام در [npmjs.com](https://www.npmjs.com):

```bash
# 1) Login
npm login

# 2) Confirm name is free
npm view arvancai

# 3) From this repo
cd arvancloud-mcp   # or your clone
npm install
npm run build
npm test

# 4) Publish (public)
npm publish --access public

# 5) Verify
npm install -g arvancai
which arvancai
```

اگر `npm view arvancai` نسخه‌ای نشان داد و مال تو نیست، نام دیگری انتخاب کن یا از scope استفاده کن: `@youruser/arvancai`.

> `package.json` الان `"name": "arvancai"` است. فیلد `repository` را در صورت نیاز به ریپوی واقعی خودت عوض کن.

---

## Coverage (short)

Official portal: https://www.arvancloud.ir/fa/dev/api

| Area | Status |
| ---- | ------ |
| CDN / DNS / Security / reports | Yes (+ `invoke_cdn_api`) |
| Cloud Server (ECC) / partial DBaaS | Yes |
| Object Storage (S3 + management API) | Yes |
| VOD / LIVE / Video Ads | Yes |
| Edge Computing | Yes |
| Cloud Container (CaaS) | Yes |
| AI-as-a-Service | Yes |
| CloudLogs ingest | `write_cloud_logs` |
| Drive / full Logs mgmt / Accounts / Changelog | No public REST OpenAPI |

Details: `docs/discovery/`, `skill/SKILL.md`.

---

## Security

- Never commit API keys.
- Prefer READ tools first; destructive tools need exact IDs.
- See [SECURITY.md](SECURITY.md).

---

## Local development

```bash
npm install
npm run build
npm test
export ARVANCLOUD_API_KEY=...
npm start
```

## License

MIT
