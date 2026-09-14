import { authHeaders, loggingAuthHeaders, type ArvanCloudConfig } from "./auth.js";
import { ArvanCloudError, classifyHttpStatus } from "./errors.js";
import { log } from "../utils/logger.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method: HttpMethod;
  /** Absolute URL or path relative to base */
  url: string;
  body?: unknown;
  /** Multipart body (e.g. DNS zone import). Mutually exclusive with JSON `body`. */
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined>;
  /** Extra/override headers (merged after default auth). */
  headers?: Record<string, string>;
  /** When true, allow one retry for network/5xx/429 (GET/idempotent only unless forceRetry) */
  idempotent?: boolean;
  forceRetry?: boolean;
  correlationId?: string;
  /** Accept plain-text success bodies (e.g. BIND zone export). Default json. */
  accept?: "json" | "text";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(base: string, pathOrUrl: string, query?: RequestOptions["query"]): string {
  const url = pathOrUrl.startsWith("http")
    ? new URL(pathOrUrl)
    : new URL(pathOrUrl.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`);

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const asInt = Number(header);
  if (!Number.isNaN(asInt)) return asInt * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

export class ArvanCloudClient {
  constructor(private readonly config: ArvanCloudConfig) {}

  get readOnly(): boolean {
    return this.config.readOnly;
  }

  get cdnBaseUrl(): string {
    return this.config.cdnBaseUrl;
  }

  get eccBaseUrl(): string {
    return this.config.eccBaseUrl;
  }

  get vodBaseUrl(): string {
    return this.config.vodBaseUrl;
  }

  get edgeBaseUrl(): string {
    return this.config.edgeBaseUrl;
  }

  get liveBaseUrl(): string {
    return this.config.liveBaseUrl;
  }

  get vadsBaseUrl(): string {
    return this.config.vadsBaseUrl;
  }

  get aiaasBaseUrl(): string {
    return this.config.aiaasBaseUrl;
  }

  get caasZonesBaseUrl(): string {
    return this.config.caasZonesBaseUrl;
  }

  async cdnRequest<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    return this.request<T>({
      ...options,
      url: buildUrl(this.config.cdnBaseUrl, path, options.query),
    });
  }

  async eccRequest<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    return this.request<T>({
      ...options,
      url: buildUrl(this.config.eccBaseUrl, path, options.query),
    });
  }

  /** IaaS OpenAPI 3.0: https://ecc.{region}.arvanapis.ir/v3/... */
  async eccV3Request<T = unknown>(
    region: string,
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    const base = this.config.eccV3BaseUrlTemplate.replace("{region}", region);
    return this.request<T>({
      ...options,
      url: buildUrl(base, path, options.query),
    });
  }

  async vodRequest<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    return this.request<T>({
      ...options,
      url: buildUrl(this.config.vodBaseUrl, path, options.query),
    });
  }

  async liveRequest<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    return this.request<T>({
      ...options,
      url: buildUrl(this.config.liveBaseUrl, path, options.query),
    });
  }

  async vadsRequest<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    return this.request<T>({
      ...options,
      url: buildUrl(this.config.vadsBaseUrl, path, options.query),
    });
  }

  async edgeRequest<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    return this.request<T>({
      ...options,
      url: buildUrl(this.config.edgeBaseUrl, path, options.query),
    });
  }

  async aiaasRequest<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    return this.request<T>({
      ...options,
      url: buildUrl(this.config.aiaasBaseUrl, path, options.query),
    });
  }

  /** CaaS OpenAPI paas/1.25: {caasZonesBase}/{zone}/api/v1/... */
  async caasRequest<T = unknown>(
    zone: string,
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    const base = `${this.config.caasZonesBaseUrl}/${encodeURIComponent(zone)}`;
    return this.request<T>({
      ...options,
      url: buildUrl(base, path, options.query),
    });
  }

  async storageApiRequest<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    return this.request<T>({
      ...options,
      url: buildUrl(this.config.storageApiBaseUrl, path, options.query),
    });
  }

  /** CloudLogs ingestion — Fluent Bit / official integrations use /logging/v1/entries/write */
  async loggingRequest<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "url"> & { method: HttpMethod },
  ): Promise<T> {
    return this.request<T>({
      ...options,
      url: buildUrl(this.config.loggingBaseUrl, path, options.query),
      headers: {
        ...loggingAuthHeaders(this.config.apiKey),
        ...(options.headers ?? {}),
      },
    });
  }

  async request<T = unknown>(options: RequestOptions): Promise<T> {
    if (this.config.readOnly && options.method !== "GET") {
      throw new ArvanCloudError(
        "read_only",
        `ARVANCLOUD_READ_ONLY=1 blocks ${options.method} requests. Unset the env to allow writes.`,
      );
    }

    const correlationId = options.correlationId ?? crypto.randomUUID();
    const canRetry =
      options.forceRetry === true ||
      options.idempotent === true ||
      options.method === "GET";

    const maxAttempts = canRetry ? 3 : 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const started = Date.now();
      try {
        const headers: Record<string, string> = {
          ...authHeaders(this.config.apiKey),
          "X-Request-Id": correlationId,
          ...(options.headers ?? {}),
        };

        let body: string | FormData | undefined;
        if (options.formData) {
          body = options.formData;
          delete headers["Content-Type"];
        } else if (options.body !== undefined) {
          headers["Content-Type"] = "application/json";
          body = JSON.stringify(options.body);
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

        let response: Response;
        try {
          response = await fetch(options.url, {
            method: options.method,
            headers,
            body,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timer);
        }

        const latencyMs = Date.now() - started;
        const text = await response.text();
        let parsed: unknown = undefined;
        if (text) {
          if (options.accept === "text" && response.ok) {
            parsed = text;
          } else {
            try {
              parsed = JSON.parse(text);
            } catch {
              if (response.ok) {
                if (options.accept === "text") {
                  parsed = text;
                } else {
                  throw new ArvanCloudError("malformed_response", "API returned non-JSON body", {
                    status: response.status,
                    details: { preview: text.slice(0, 200) },
                  });
                }
              }
            }
          }
        }

        if (!response.ok) {
          const errClass = classifyHttpStatus(response.status);
          let message = `HTTP ${response.status}`;
          if (
            parsed &&
            typeof parsed === "object" &&
            "message" in parsed &&
            typeof (parsed as { message: unknown }).message === "string"
          ) {
            message = (parsed as { message: string }).message;
          }

          const retryAfterMs = parseRetryAfter(response.headers.get("retry-after"));
          const err = new ArvanCloudError(errClass, message, {
            status: response.status,
            details: parsed,
            retryAfterMs,
          });

          log("warn", "arvancloud_api_error", {
            correlationId,
            method: options.method,
            status: response.status,
            errorClass: errClass,
            latencyMs,
            attempt,
          });

          if (
            canRetry &&
            attempt < maxAttempts &&
            (response.status === 429 || response.status >= 500)
          ) {
            const wait = retryAfterMs ?? Math.min(2000 * attempt, 8000);
            await sleep(wait);
            lastError = err;
            continue;
          }
          throw err;
        }

        log("info", "arvancloud_api_ok", {
          correlationId,
          method: options.method,
          status: response.status,
          latencyMs,
          attempt,
        });

        return parsed as T;
      } catch (err) {
        if (err instanceof ArvanCloudError) throw err;

        const isAbort =
          err instanceof Error &&
          (err.name === "AbortError" || err.message.includes("aborted"));

        const wrapped = new ArvanCloudError(
          isAbort ? "timeout" : "network",
          isAbort ? "Request timed out" : "Network error talking to ArvanCloud API",
          { cause: err },
        );

        log("warn", "arvancloud_api_transport_error", {
          correlationId,
          method: options.method,
          errorClass: wrapped.className,
          attempt,
        });

        if (canRetry && attempt < maxAttempts) {
          await sleep(Math.min(1000 * attempt, 4000));
          lastError = wrapped;
          continue;
        }
        throw wrapped;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new ArvanCloudError("unknown", "Request failed after retries");
  }
}
