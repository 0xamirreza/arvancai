import type { ArvanCloudClient } from "../client/arvancloud-client.js";
import { ArvanCloudError } from "../client/errors.js";

export function toolResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function toolError(err: unknown) {
  if (err instanceof ArvanCloudError) {
    return {
      isError: true as const,
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(err.toJSON(), null, 2),
        },
      ],
    };
  }
  const message = err instanceof Error ? err.message : String(err);
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: JSON.stringify({ error: "unknown", message }, null, 2) }],
  };
}

export type ToolContext = {
  client: ArvanCloudClient;
};

/** Block S3 / non-HTTP writers when ARVANCLOUD_READ_ONLY=1. */
export function assertWritable(client: { readOnly: boolean }): void {
  if (client.readOnly) {
    throw new ArvanCloudError(
      "read_only",
      "ARVANCLOUD_READ_ONLY=1 blocks mutating operations. Unset the env to allow writes.",
    );
  }
}

/** Heuristic: bridged official tools that look write-like under read-only mode. */
export function isLikelyWriteToolName(name: string): boolean {
  return (
    /^(create|update|delete|set|write|purge|remove|put|post|patch|deploy|enable|disable|import|add)/i.test(
      name,
    ) ||
    /_(create|update|delete|set|write|purge|remove|put|import|add)$/i.test(name) ||
    /_(create|update|delete|set|write|purge|remove|import)_/i.test(name)
  );
}
