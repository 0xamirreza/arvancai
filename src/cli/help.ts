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
