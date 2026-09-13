# arvancai

**ArvanCloud MCP server + Agent Skill** — manage ArvanCloud from any MCP-capable agent/IDE  
(Cursor, Windsurf, Claude Desktop/Code, Codex, OpenCode, and more).

[![npm](https://img.shields.io/npm/v/arvancai.svg)](https://www.npmjs.com/package/arvancai)
[![GitHub](https://img.shields.io/badge/github-0xamirreza%2Farvancai-blue)](https://github.com/0xamirreza/arvancai)

```bash
npm install -g arvancai
```

**Repository:** https://github.com/0xamirreza/arvancai  
**npm:** https://www.npmjs.com/package/arvancai

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

## 1) Install (auto-wires clients)

```bash
export ARVANCLOUD_API_KEY="your-machine-user-key"   # optional but recommended
npm install -g arvancai
```

On **global** install, `arvancai` automatically:

- merges itself into **Cursor** `~/.cursor/mcp.json` (keeps your other MCP servers)
- copies the **Agent Skill** to `~/.cursor/skills/arvancai/`
- wires **Windsurf / Claude Desktop / Codex / OpenCode** when their config directories already exist

Re-run anytime (e.g. after setting the API key):

```bash
export ARVANCLOUD_API_KEY="your-machine-user-key"
arvancai setup
```

Force every known host path (even if the app is not installed yet):

```bash
arvancai setup --all
```

Skip auto-setup during install:

```bash
ARVANCAI_SKIP_SETUP=1 npm install -g arvancai
```

Check CLI (this must print help — it must **not** hang):

```bash
arvancai --help
which arvancai
```

Then **reload Cursor** (or reopen MCP settings) so `arvancai` shows up under MCP and Skills.

With no arguments, `arvancai` speaks **MCP over stdio** (for IDEs). Do not use it as a chat CLI.

---

## 2) API key & extras

```bash
export ARVANCLOUD_API_KEY="your-machine-user-key"
```

Optional Object Storage (S3 HMAC):

```bash
export ARVANCLOUD_S3_ACCESS_KEY_ID="..."
export ARVANCLOUD_S3_SECRET_ACCESS_KEY="..."
```

See [`.env.example`](.env.example). If setup ran without a key, configs keep `<MU-KEY>` until you re-run `arvancai setup` with the env set.

---

## 3) Manual MCP (optional)

Auto-setup is enough for most users. Manual shape (also under [`examples/`](examples/)):

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

GUI apps that lack your shell `PATH` are fine: `arvancai setup` writes an absolute `node` + `bin/arvancai.js` path.

---

## 4) Skill vs MCP

| Piece | Role | Portability |
| ----- | ---- | ----------- |
| **MCP (`arvancai`)** | Tools / resources / prompts over the MCP protocol | Works on **all** MCP clients |
| **Skill (`skill/SKILL.md`)** | Agent playbook (when to call which tool, safety rules) | Best on Cursor-style Agent Skills; elsewhere paste/link as project instructions |

MCP alone is enough for tool calling. Skill improves agent behavior where the host supports skills/rules.

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

Details: [`docs/discovery/`](docs/discovery/), [`skill/SKILL.md`](skill/SKILL.md).

---

## Security

- Never commit API keys.
- Prefer READ tools first; destructive tools need exact IDs.
- See [SECURITY.md](SECURITY.md).

---

## Local development

```bash
git clone https://github.com/0xamirreza/arvancai.git
cd arvancai
npm install
npm run build
npm test
export ARVANCLOUD_API_KEY=...
npm start
# wire this checkout into clients:
ARVANCAI_AUTO_SETUP=1 node scripts/postinstall.mjs
# or:
node dist/index.js setup
```

## License

MIT
