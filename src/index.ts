#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { printHelp } from "./cli/help.js";
import { runSetup } from "./cli/setup.js";
import { createServer, SERVER_NAME, SERVER_VERSION } from "./server/create-server.js";
import { log } from "./utils/logger.js";

function printSetupResults(
  results: ReturnType<typeof runSetup>,
  apiKeyMissing: boolean,
): void {
  for (const r of results) {
    const line = `[arvancai] ${r.action.padEnd(8)} ${r.path}${r.detail ? ` (${r.detail})` : ""}`;
    console.error(line);
  }
  if (apiKeyMissing) {
    console.error(
      "[arvancai] Set ARVANCLOUD_API_KEY then re-run: arvancai setup\n" +
        "           https://docs.arvancloud.ir/en/accounts/iam/machine-user",
    );
  } else {
    console.error("[arvancai] Setup done. Reload your IDE / MCP host to pick up changes.");
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (args.includes("--help") || args.includes("-h") || cmd === "help") {
    printHelp();
    process.exit(0);
  }

  if (cmd === "setup" || cmd === "install" || cmd === "install-clients") {
    const all = args.includes("--all");
    const apiKey = process.env.ARVANCLOUD_API_KEY?.trim() || "<MU-KEY>";
    const results = runSetup({
      apiKey,
      preferExistingHosts: !all,
    });
    printSetupResults(results, apiKey === "<MU-KEY>");
    process.exit(results.some((r) => r.action === "failed") ? 1 : 0);
  }

  // Default: MCP stdio server (no CLI args).
  if (args.length > 0) {
    console.error(`[arvancai] Unknown command: ${args.join(" ")}`);
    printHelp();
    process.exit(2);
  }

  try {
    serveStdio(() => createServer());
    log("info", "mcp_server_started", {
      server: SERVER_NAME,
      version: SERVER_VERSION,
      transport: "stdio",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("error", "mcp_server_failed", { errorClass: "startup", message });
    process.exit(1);
  }
}

main();
