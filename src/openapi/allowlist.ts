import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type AllowedOp = { method: string; path: string };

export type Allowlist = {
  product: string;
  source: string;
  title?: string;
  version?: string;
  operations: AllowedOp[];
};

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadAllowlist(product: string): Allowlist {
  const raw = readFileSync(join(__dirname, "allowlists", `${product}.json`), "utf8");
  return JSON.parse(raw) as Allowlist;
}

/** Normalize OpenAPI / request paths for comparison. */
export function normalizePath(path: string): string {
  let p = path.trim();
  if (!p.startsWith("/")) p = `/${p}`;
  // collapse duplicate slashes
  p = p.replace(/\/{2,}/g, "/");
  // strip trailing slash except root
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function isParamSegment(seg: string): boolean {
  return (seg.startsWith("{") && seg.endsWith("}")) || seg.startsWith(":");
}

/** True when concrete path matches an OpenAPI path template (supports `{id}` and `:id`). */
export function pathMatchesTemplate(template: string, concrete: string): boolean {
  const tParts = normalizePath(template).split("/").filter(Boolean);
  const cParts = normalizePath(concrete).split("/").filter(Boolean);
  if (tParts.length !== cParts.length) return false;
  for (let i = 0; i < tParts.length; i++) {
    if (isParamSegment(tParts[i]!)) continue;
    if (tParts[i] !== cParts[i]) return false;
  }
  return true;
}

export function findAllowedOp(
  allowlist: Allowlist,
  method: string,
  concretePath: string,
): AllowedOp | undefined {
  const m = method.toUpperCase();
  const path = normalizePath(concretePath);
  return allowlist.operations.find(
    (op) => op.method === m && pathMatchesTemplate(op.path, path),
  );
}
