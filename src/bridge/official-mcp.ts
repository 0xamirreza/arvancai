import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import type { McpServer } from "@modelcontextprotocol/server";
import { jsonSchemaToZod, jsonSchemaToZodShape } from "./json-schema-to-zod.js";
import { log } from "../utils/logger.js";
import { officialMcpApiKeyHeader } from "../client/auth.js";
import { isLikelyWriteToolName } from "../tools/helpers.js";

export type OfficialBridgeOptions = {
  apiKey: string;
  url?: string;
  toolsets?: string;
  /** Connect timeout in ms (default 8000). */
  timeoutMs?: number;
  /** When true, refuse non-read bridged tool calls. */
  readOnly?: boolean;
  /** Already-registered local tool names — collisions prefer local. */
  reservedToolNames?: Set<string>;
  reservedPromptNames?: Set<string>;
  reservedResourceUris?: Set<string>;
};

export type OfficialBridgeResult = {
  connected: boolean;
  tools: number;
  prompts: number;
  resources: number;
  skippedTools: string[];
  error?: string;
};

const DEFAULT_URL = "https://mcp.arvancloud.ir";
const DEFAULT_TOOLSETS = "all";

function isEnabled(env: NodeJS.ProcessEnv): boolean {
  const raw = env.ARVANCLOUD_OFFICIAL_MCP?.trim().toLowerCase();
  if (raw === "0" || raw === "false" || raw === "off" || raw === "no") return false;
  return true;
}

/**
 * Bridge ArvanCloud's hosted MCP (`mcp.arvancloud.ir`) into this local server.
 * Covers Cloud Logs management (spaces/sinks/forwarders) and future official toolsets.
 * Fails soft: local tools keep working if the remote is unreachable.
 */
export async function bridgeOfficialMcp(
  server: McpServer,
  options: OfficialBridgeOptions,
  env: NodeJS.ProcessEnv = process.env,
): Promise<OfficialBridgeResult> {
  if (!isEnabled(env)) {
    return { connected: false, tools: 0, prompts: 0, resources: 0, skippedTools: [], error: "disabled" };
  }

  const url = (options.url ?? env.ARVANCLOUD_OFFICIAL_MCP_URL ?? DEFAULT_URL).replace(/\/$/, "");
  const toolsets =
    options.toolsets ??
    (env.ARVANCLOUD_OFFICIAL_MCP_TOOLSETS?.trim() || DEFAULT_TOOLSETS);
  const timeoutMs = options.timeoutMs ?? Number(env.ARVANCLOUD_OFFICIAL_MCP_TIMEOUT_MS ?? 5_000);
  const reservedTools = options.reservedToolNames ?? new Set<string>();
  const reservedPrompts = options.reservedPromptNames ?? new Set<string>();
  const reservedUris = options.reservedResourceUris ?? new Set<string>();

  const client = new Client({ name: "arvancai-bridge", version: "1.0.0" });
  const skippedTools: string[] = [];
  let tools = 0;
  let prompts = 0;
  let resources = 0;

  try {
    const transport = new StreamableHTTPClientTransport(new URL(url), {
      requestInit: {
        headers: {
          "Arvancloud-Api-Key": officialMcpApiKeyHeader(options.apiKey),
          "X-Mcp-Toolsets": toolsets,
        },
      },
    });

    await Promise.race([
      client.connect(transport),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`official MCP connect timeout after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);

    const listed = await client.listTools();
    for (const tool of listed.tools) {
      if (reservedTools.has(tool.name)) {
        skippedTools.push(tool.name);
        continue;
      }
      reservedTools.add(tool.name);
      const inputSchema = jsonSchemaToZod(tool.inputSchema ?? { type: "object", properties: {} });
      const description = [
        tool.description?.trim() || `Official ArvanCloud MCP tool: ${tool.name}`,
        "[source: mcp.arvancloud.ir]",
      ].join(" ");

      try {
        server.registerTool(
          tool.name,
          {
            title: tool.title ?? tool.name,
            description,
            inputSchema,
            ...(tool.annotations ? { annotations: tool.annotations } : {}),
          },
          async (args) => {
            try {
              const ann = tool.annotations as
                | { readOnlyHint?: boolean; destructiveHint?: boolean }
                | undefined;
              const blocked =
                options.readOnly &&
                (ann?.readOnlyHint === false ||
                  ann?.destructiveHint === true ||
                  (ann?.readOnlyHint !== true && isLikelyWriteToolName(tool.name)));
              if (blocked) {
                return {
                  isError: true,
                  content: [
                    {
                      type: "text" as const,
                      text: JSON.stringify({
                        error: "read_only",
                        message: `ARVANCLOUD_READ_ONLY=1 blocks official MCP tool "${tool.name}".`,
                      }),
                    },
                  ],
                };
              }
              return await client.callTool({
                name: tool.name,
                arguments: (args ?? {}) as Record<string, unknown>,
              });
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              return {
                isError: true,
                content: [{ type: "text" as const, text: `Official MCP tool failed: ${message}` }],
              };
            }
          },
        );
        tools += 1;
      } catch {
        skippedTools.push(tool.name);
      }
    }

    try {
      const promptList = await client.listPrompts();
      for (const prompt of promptList.prompts) {
        if (reservedPrompts.has(prompt.name)) continue;
        reservedPrompts.add(prompt.name);
        const shape: Record<string, ReturnType<typeof jsonSchemaToZod>> = {};
        if (prompt.arguments?.length) {
          for (const arg of prompt.arguments) {
            const base = jsonSchemaToZod({
              type: "string",
              description: arg.description,
            });
            shape[arg.name] = arg.required ? base : base.optional();
          }
        } else {
          Object.assign(shape, jsonSchemaToZodShape({ type: "object", properties: {} }));
        }

        try {
          server.registerPrompt(
            prompt.name,
            {
              title: prompt.title,
              description: [prompt.description ?? prompt.name, "[source: mcp.arvancloud.ir]"].join(" "),
              argsSchema: shape,
            },
            async (args) => {
              const result = await client.getPrompt({
                name: prompt.name,
                arguments: Object.fromEntries(
                  Object.entries(args ?? {}).map(([k, v]) => [k, v == null ? "" : String(v)]),
                ),
              });
              return {
                description: result.description,
                messages: result.messages,
              };
            },
          );
          prompts += 1;
        } catch {
          /* local prompt wins on name collision */
        }
      }
    } catch (err) {
      log("warn", "official_mcp_prompts_failed", {
        message: err instanceof Error ? err.message : String(err),
      });
    }

    try {
      const resourceList = await client.listResources();
      for (const resource of resourceList.resources) {
        if (reservedUris.has(resource.uri)) continue;
        reservedUris.add(resource.uri);
        const name = resource.name || resource.uri.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 64);
        try {
          server.registerResource(
            `official_${name}`,
            resource.uri,
            {
              description: [resource.description ?? resource.name, "[source: mcp.arvancloud.ir]"].join(
                " ",
              ),
              mimeType: resource.mimeType,
            },
            async (uri) => client.readResource({ uri: uri.href }),
          );
          resources += 1;
        } catch {
          /* skip colliding resources */
        }
      }
    } catch (err) {
      log("warn", "official_mcp_resources_failed", {
        message: err instanceof Error ? err.message : String(err),
      });
    }

    log("info", "official_mcp_bridged", { url, toolsets, tools, prompts, resources, skippedTools });
    return { connected: true, tools, prompts, resources, skippedTools };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("warn", "official_mcp_bridge_failed", { url, toolsets, message });
    try {
      await client.close();
    } catch {
      /* ignore */
    }
    return { connected: false, tools: 0, prompts: 0, resources: 0, skippedTools, error: message };
  }
}
