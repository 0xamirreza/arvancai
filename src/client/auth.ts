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
  };
}

/** Authorization header value = Machine User key as documented (API Usage). */
export function authHeaders(apiKey: string): Record<string, string> {
  return {
    Accept: "application/json",
    Authorization: apiKey,
  };
}

/**
 * CloudLogs ingestion auth as used by official Fluent Bit integration:
 * `Authorization: Apikey <key>` when the env value has no scheme prefix.
 * Source: https://github.com/fluent/fluent-bit/pull/11095
 */
export function loggingAuthHeaders(apiKey: string): Record<string, string> {
  const trimmed = apiKey.trim();
  const hasScheme = /^(apikey|api[_\s-]?key|bearer)\s+/i.test(trimmed);
  return {
    Accept: "application/json",
    Authorization: hasScheme ? trimmed : `Apikey ${trimmed}`,
  };
}
