export function printHelp(): void {
  const text = `
arvancai — ArvanCloud MCP server + Agent Skill

Usage:
  arvancai                 Start MCP server over stdio (for IDE/agent hosts)
  arvancai setup           Wire MCP + Skill into Cursor and other clients
  arvancai setup --all     Also create configs for hosts not yet installed
  arvancai --help          Show this help

Environment:
  ARVANCLOUD_API_KEY              Machine User API key (written into MCP configs on setup)
  ARVANCLOUD_S3_ACCESS_KEY_ID     Optional Object Storage HMAC
  ARVANCLOUD_S3_SECRET_ACCESS_KEY Optional Object Storage HMAC
  ARVANCLOUD_OFFICIAL_MCP         Bridge hosted mcp.arvancloud.ir (default on; set 0 to disable)
  ARVANCLOUD_OFFICIAL_MCP_TOOLSETS Toolsets header (default all; e.g. logs)
  ARVANCLOUD_READ_ONLY=1          Block mutating HTTP/S3/bridged write tools
  ARVANCAI_SKIP_SETUP=1           Skip postinstall auto-setup
  ARVANCAI_AUTO_SETUP=1           Force postinstall setup (local installs)

After global install, setup runs automatically. Re-run anytime:
  export ARVANCLOUD_API_KEY=...
  arvancai setup

Docs: https://github.com/0xamirreza/arvancai
`.trim();
  // Help must not go to MCP stdout protocol — use stderr.
  console.error(text);
}
