import { z, type ZodTypeAny } from "zod";

type JsonSchema = {
  type?: string | string[];
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  additionalProperties?: boolean | JsonSchema;
};

function withDesc(schema: ZodTypeAny, description?: string): ZodTypeAny {
  return description ? schema.describe(description) : schema;
}

function primaryType(type: string | string[] | undefined): string | undefined {
  if (!type) return undefined;
  return Array.isArray(type) ? type.find((t) => t !== "null") ?? type[0] : type;
}

function propToZod(schema: JsonSchema | undefined): ZodTypeAny {
  if (!schema) return z.unknown();

  if (schema.enum && schema.enum.length > 0) {
    const vals = schema.enum.map(String);
    if (vals.length === 1) return withDesc(z.literal(vals[0]!), schema.description);
    return withDesc(z.enum(vals as [string, ...string[]]), schema.description);
  }

  if (schema.anyOf?.length || schema.oneOf?.length) {
    const alts = (schema.anyOf ?? schema.oneOf ?? []).map(propToZod);
    if (alts.length === 0) return z.unknown();
    if (alts.length === 1) return withDesc(alts[0]!, schema.description);
    return withDesc(z.union(alts as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]), schema.description);
  }

  switch (primaryType(schema.type)) {
    case "string":
      return withDesc(z.string(), schema.description);
    case "number":
    case "integer":
      return withDesc(z.number(), schema.description);
    case "boolean":
      return withDesc(z.boolean(), schema.description);
    case "array":
      return withDesc(z.array(propToZod(schema.items)), schema.description);
    case "object":
      return withDesc(objectToZod(schema), schema.description);
    case "null":
      return withDesc(z.null(), schema.description);
    default:
      return withDesc(z.unknown(), schema.description);
  }
}

function objectToZod(schema: JsonSchema): ZodTypeAny {
  const required = new Set(schema.required ?? []);
  const shape: Record<string, ZodTypeAny> = {};
  for (const [key, prop] of Object.entries(schema.properties ?? {})) {
    const base = propToZod(prop);
    shape[key] = required.has(key) ? base : base.optional();
  }

  let obj = z.object(shape).passthrough();
  if (schema.additionalProperties === false) {
    obj = z.object(shape).strict() as typeof obj;
  }
  return obj;
}

/**
 * Convert a JSON Schema (from remote MCP tools/list) into a Zod schema
 * accepted by `@modelcontextprotocol/server` registerTool/registerPrompt.
 */
export function jsonSchemaToZod(schema: unknown): ZodTypeAny {
  if (!schema || typeof schema !== "object") {
    return z.record(z.string(), z.unknown());
  }
  const s = schema as JsonSchema;
  if (primaryType(s.type) === "object" || s.properties) {
    return objectToZod(s);
  }
  return propToZod(s);
}

/** Prompt argsSchema wants a raw Zod shape `{ field: z.string() }`. */
export function jsonSchemaToZodShape(schema: unknown): Record<string, ZodTypeAny> {
  if (!schema || typeof schema !== "object") return {};
  const s = schema as JsonSchema;
  const required = new Set(s.required ?? []);
  const shape: Record<string, ZodTypeAny> = {};
  for (const [key, prop] of Object.entries(s.properties ?? {})) {
    const base = propToZod(prop);
    shape[key] = required.has(key) ? base : base.optional();
  }
  return shape;
}
