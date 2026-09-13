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
