import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Resolve installed package root (contains package.json + skill/ + bin/). */
export function packageRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // dist/cli → ../../  or src/cli when run via tsx
  const candidates = [
    path.resolve(here, "../.."),
    path.resolve(here, "../../.."),
  ];
  for (const root of candidates) {
    if (existsSync(path.join(root, "package.json")) && existsSync(path.join(root, "skill", "SKILL.md"))) {
      return root;
    }
  }
  return path.resolve(here, "../..");
}

export function skillSourceDir(): string {
  return path.join(packageRoot(), "skill");
}

export function binEntryPath(): string {
  return path.join(packageRoot(), "bin", "arvancai.js");
}
