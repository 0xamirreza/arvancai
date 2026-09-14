export interface ArvanCloudConfig {
  apiKey: string;
  cdnBaseUrl: string;
  eccBaseUrl: string;
  /** Template with `{region}` → e.g. https://ecc.ir-thr-c2.arvanapis.ir/v3 (OpenAPI iaas/3.0.0). */
  eccV3BaseUrlTemplate: string;
  vodBaseUrl: string;
  liveBaseUrl: string;
  vadsBaseUrl: string;
  edgeBaseUrl: string;
  aiaasBaseUrl: string;
  /** CaaS zone root without trailing zone id, e.g. https://napi.arvancloud.ir/caas/v2/zones */
  caasZonesBaseUrl: string;
  storageApiBaseUrl: string;
  /** CloudLogs ingestion base, e.g. https://napi.arvancloud.ir/logging/v1 */
  loggingBaseUrl: string;
  s3Endpoint: string;
  s3Region: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  timeoutMs: number;
  /** When true, block POST/PUT/PATCH/DELETE (local HTTP + bridged non-read tools). */
  readOnly: boolean;
}

function envFlagTrue(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ArvanCloudConfig {
  const apiKey = env.ARVANCLOUD_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "ARVANCLOUD_API_KEY is required. Create a Machine User key in the ArvanCloud panel.",
    );
  }

  return {
    apiKey,
    cdnBaseUrl: (env.ARVANCLOUD_CDN_BASE_URL ?? "https://napi.arvancloud.ir/cdn/4.0").replace(
      /\/$/,
      "",
    ),
    eccBaseUrl: (env.ARVANCLOUD_ECC_BASE_URL ?? "https://napi.arvancloud.ir/ecc/v1").replace(
      /\/$/,
      "",
    ),
    eccV3BaseUrlTemplate: (
      env.ARVANCLOUD_ECC_V3_BASE_URL_TEMPLATE ?? "https://ecc.{region}.arvanapis.ir/v3"
    ).replace(/\/$/, ""),
    vodBaseUrl: (env.ARVANCLOUD_VOD_BASE_URL ?? "https://napi.arvancloud.ir/vod/2.0").replace(
      /\/$/,
      "",
    ),
    liveBaseUrl: (env.ARVANCLOUD_LIVE_BASE_URL ?? "https://napi.arvancloud.ir/live/2.0").replace(
      /\/$/,
      "",
    ),
    vadsBaseUrl: (env.ARVANCLOUD_VADS_BASE_URL ?? "https://napi.arvancloud.ir/vads/2.0").replace(
      /\/$/,
      "",
    ),
    // OpenAPI ec/1.0 lists edge-computing/v1; FA product samples used 1.0 — override if needed.
    edgeBaseUrl: (
      env.ARVANCLOUD_EDGE_BASE_URL ?? "https://napi.arvancloud.ir/edge-computing/v1"
    ).replace(/\/$/, ""),
    aiaasBaseUrl: (env.ARVANCLOUD_AIAAS_BASE_URL ?? "https://napi.arvancloud.ir/ai/v1").replace(
      /\/$/,
      "",
    ),
    caasZonesBaseUrl: (
      env.ARVANCLOUD_CAAS_ZONES_BASE_URL ?? "https://napi.arvancloud.ir/caas/v2/zones"
    ).replace(/\/$/, ""),
    storageApiBaseUrl: (env.ARVANCLOUD_STORAGE_API_BASE_URL ?? "https://storage.arvanapis.ir/v1").replace(
      /\/$/,
      "",
    ),
    loggingBaseUrl: (
      env.ARVANCLOUD_LOGGING_BASE_URL ?? "https://napi.arvancloud.ir/logging/v1"
    ).replace(/\/$/, ""),
    s3Endpoint: (env.ARVANCLOUD_S3_ENDPOINT ?? "https://s3.ir-thr-at1.arvanstorage.ir").replace(
      /\/$/,
      "",
    ),
    s3Region: env.ARVANCLOUD_S3_REGION ?? "default",
    s3AccessKeyId: env.ARVANCLOUD_S3_ACCESS_KEY_ID?.trim() || undefined,
    s3SecretAccessKey: env.ARVANCLOUD_S3_SECRET_ACCESS_KEY?.trim() || undefined,
    timeoutMs: Number(env.ARVANCLOUD_TIMEOUT_MS ?? 30_000),
    readOnly: envFlagTrue(env.ARVANCLOUD_READ_ONLY),
  };
}

/**
 * Strip optional scheme prefixes and return the raw Machine User token.
 */
export function stripApiKeyScheme(apiKey: string): string {
  return apiKey.trim().replace(/^(apikey|api[_\s-]?key|bearer)\s+/i, "");
}

/**
 * Canonical napi/ECC/VOD auth: `Authorization: Apikey <uuid>`.
 * Accepts bare UUID or already-prefixed values.
 */
export function authHeaders(apiKey: string): Record<string, string> {
  return {
    Accept: "application/json",
    Authorization: `Apikey ${stripApiKeyScheme(apiKey)}`,
  };
}

/**
 * CloudLogs ingestion auth as used by official Fluent Bit integration:
 * `Authorization: Apikey <key>` (same canonical form).
 * Source: https://github.com/fluent/fluent-bit/pull/11095
 */
export function loggingAuthHeaders(apiKey: string): Record<string, string> {
  return authHeaders(apiKey);
}

/**
 * Hosted MCP (`mcp.arvancloud.ir`) expects:
 *   Arvancloud-Api-Key: apikey <UUID>
 * Docs: https://docs.arvancloud.ir/fa/developer-tools/mcp/quickstart/
 */
export function officialMcpApiKeyHeader(apiKey: string): string {
  return `apikey ${stripApiKeyScheme(apiKey)}`;
}
