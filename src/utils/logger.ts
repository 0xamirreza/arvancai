export type LogLevel = "error" | "warn" | "info" | "debug";

const LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function currentLevel(): LogLevel {
  const raw = (process.env.ARVANCLOUD_LOG_LEVEL ?? "info").toLowerCase();
  if (raw === "error" || raw === "warn" || raw === "info" || raw === "debug") {
    return raw;
  }
  return "info";
}

/** Structured stderr logging — never write to stdout (MCP stdio). Never log secrets. */
export function log(
  level: LogLevel,
  message: string,
  fields: Record<string, unknown> = {},
): void {
  if (LEVELS[level] > LEVELS[currentLevel()]) return;
  const safe = { ...fields };
  for (const key of Object.keys(safe)) {
    const lower = key.toLowerCase();
    if (
      lower.includes("authorization") ||
      lower.includes("api_key") ||
      lower.includes("apikey") ||
      lower.includes("secret") ||
      lower.includes("token") ||
      lower.includes("password")
    ) {
      safe[key] = "[redacted]";
    }
  }
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg: message,
      ...safe,
    }),
  );
}
