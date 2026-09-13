import { McpServer } from "@modelcontextprotocol/server";
import { ArvanCloudClient } from "../client/arvancloud-client.js";
import { loadConfig } from "../client/auth.js";
import { registerDomainTools } from "../tools/domains.js";
import { registerDnsTools } from "../tools/dns.js";
import { registerCachingTools } from "../tools/caching.js";
import { registerSslTools } from "../tools/ssl.js";
import { registerTroubleshootTools } from "../tools/troubleshoot.js";
import { registerCloudServerTools } from "../tools/cloud-server.js";
import { registerOfflineEnrichedCdnTools } from "../tools/cdn-enriched.js";
import { registerVodTools } from "../tools/vod.js";
import { registerSecurityCrudTools } from "../tools/security-crud.js";
import { registerEdgeTools } from "../tools/edge.js";
import { registerObjectStorageTools } from "../tools/object-storage.js";
import { registerCaasTools } from "../tools/caas.js";
import { registerLiveTools } from "../tools/live.js";
import { registerVadsTools } from "../tools/vads.js";
import { registerAiaasTools } from "../tools/aiaas.js";
import { registerDbaasTools } from "../tools/dbaas.js";
import { registerOpenApiGatewayTools } from "../tools/openapi-gateway.js";
import { registerCloudLogsTools } from "../tools/cloud-logs.js";
import { registerCdnReportTools } from "../tools/cdn-reports.js";
import { registerResources } from "../resources/index.js";
import { registerPrompts } from "../prompts/index.js";

export const SERVER_NAME = "arvancloud-mcp";
export const SERVER_VERSION = "0.5.0";

export function createServer(env: NodeJS.ProcessEnv = process.env): McpServer {
  const config = loadConfig(env);
  const client = new ArvanCloudClient(config);
  const ctx = { client };

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerDomainTools(server, ctx);
  registerDnsTools(server, ctx);
  registerCachingTools(server, ctx);
  registerSslTools(server, ctx);
  registerTroubleshootTools(server, ctx);
  registerOfflineEnrichedCdnTools(server, ctx);
  registerSecurityCrudTools(server, ctx);
  registerCdnReportTools(server, ctx);
  registerCloudServerTools(server, ctx);
  registerDbaasTools(server, ctx);
  registerVodTools(server, ctx);
  registerLiveTools(server, ctx);
  registerVadsTools(server, ctx);
  registerEdgeTools(server, ctx);
  registerCaasTools(server, ctx);
  registerAiaasTools(server, ctx);
  registerCloudLogsTools(server, ctx);
  registerObjectStorageTools(server, {
    config,
    apiRequest: async (url, init) =>
      client.request({
        method: init.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        url,
        idempotent: init.method === "GET",
      }),
  });
  registerOpenApiGatewayTools(server, client);
  registerResources(server, client);
  registerPrompts(server);

  return server;
}
