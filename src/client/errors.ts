export type ErrorClass =
  | "authentication"
  | "authorization"
  | "validation"
  | "not_found"
  | "conflict"
  | "rate_limit"
  | "server"
  | "network"
  | "timeout"
  | "malformed_response"
  | "read_only"
  | "unknown";

export class ArvanCloudError extends Error {
  readonly className: ErrorClass;
  readonly status?: number;
  readonly details?: unknown;
  readonly retryAfterMs?: number;

  constructor(
    className: ErrorClass,
    message: string,
    opts: { status?: number; details?: unknown; retryAfterMs?: number; cause?: unknown } = {},
  ) {
    super(message, opts.cause !== undefined ? { cause: opts.cause } : undefined);
    this.name = "ArvanCloudError";
    this.className = className;
    this.status = opts.status;
    this.details = sanitizeDetails(opts.details);
    this.retryAfterMs = opts.retryAfterMs;
  }

  toJSON(): Record<string, unknown> {
    return {
      error: this.className,
      message: this.message,
      status: this.status,
      details: this.details,
      retryAfterMs: this.retryAfterMs,
    };
  }
}

function sanitizeDetails(details: unknown): unknown {
  if (details == null) return details;
  const text = JSON.stringify(details);
  if (!text) return details;
  // Strip anything that looks like Authorization header values.
  return JSON.parse(
    text.replace(/("authorization"\s*:\s*")[^"]+"/gi, '$1[redacted]"'),
  );
}

export function classifyHttpStatus(status: number): ErrorClass {
  if (status === 401) return "authentication";
  if (status === 403) return "authorization";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422 || status === 400) return "validation";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "server";
  return "unknown";
}
