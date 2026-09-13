import { z } from "zod";

/** Domain name used in CDN path segments — no protocol/path. */
export const DomainNameSchema = z
  .string()
  .min(1)
  .max(253)
  .regex(/^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/, {
    message: "Invalid domain name",
  });

/** Exact record id from list/get — format not fully documented; never invent. */
export const RecordIdSchema = z
  .string()
  .min(1)
  .describe("Exact DNS record id returned by list_dns_records / get_dns_record");

export const DnsRecordTypeSchema = z.enum([
  "A",
  "AAAA",
  "CNAME",
  "ANAME",
  "NS",
  "MX",
  "SRV",
  "TXT",
  "CAA",
  "TLSA",
  "PTR",
]);

export const IpFilterModeSchema = z
  .object({
    count: z.enum(["single", "multi"]).optional(),
    geo_filter: z.string().optional(),
    order: z.string().optional(),
  })
  .optional();

export const CreateDnsRecordSchema = z.object({
  domain: DomainNameSchema,
  type: DnsRecordTypeSchema,
  name: z.string().min(1).max(253),
  value: z.unknown().describe("Type-specific value object/array as documented for the record type"),
  ttl: z.number().int().positive().optional(),
  cloud: z.boolean().optional(),
  upstream_https: z.string().optional(),
  ip_filter_mode: IpFilterModeSchema,
  matching_type: z.string().optional(),
  selector: z.string().optional(),
  usage: z.string().optional(),
});

export const UpdateDnsRecordSchema = CreateDnsRecordSchema.extend({
  record_id: RecordIdSchema,
});

export const CacheStatusSchema = z.enum(["off", "uri", "query_string"]);

export const PurgeCacheSchema = z
  .object({
    domain: DomainNameSchema,
    purge: z.enum(["all", "individual"]),
    purge_urls: z.array(z.string().url()).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.purge === "individual") {
      if (!val.purge_urls || val.purge_urls.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "purge_urls is required and must be non-empty when purge=individual",
          path: ["purge_urls"],
        });
      }
    }
    if (val.purge === "all" && val.purge_urls && val.purge_urls.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Do not pass purge_urls when purge=all (refuses ambiguous broad+scoped purge)",
        path: ["purge_urls"],
      });
    }
  });

export const RegionSchema = z
  .string()
  .min(1)
  .describe("Cloud Server region id from official docs, e.g. ir-thr-c2");
