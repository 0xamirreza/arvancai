#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createServer, SERVER_NAME, SERVER_VERSION } from "./server/create-server.js";
import { log } from "./utils/logger.js";

function main(): void {
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
