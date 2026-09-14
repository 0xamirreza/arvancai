import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { toolError, toolResult, assertWritable } from "./helpers.js";
import type { ArvanCloudConfig } from "../client/auth.js";

function requireS3(config: ArvanCloudConfig): S3Client {
  if (!config.s3AccessKeyId || !config.s3SecretAccessKey) {
    throw new Error(
      "Object Storage requires ARVANCLOUD_S3_ACCESS_KEY_ID and ARVANCLOUD_S3_SECRET_ACCESS_KEY (HMAC/Access+Secret from Machine User / Object Storage). See FA machine-user + SDK credentials docs.",
    );
  }
  return new S3Client({
    region: config.s3Region || "default",
    endpoint: config.s3Endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.s3AccessKeyId,
      secretAccessKey: config.s3SecretAccessKey,
    },
  });
}

async function streamToString(body: unknown): Promise<string> {
  if (!body) return "";
  if (typeof body === "string") return body;
  // Node.js Readable / web stream
  const chunks: Buffer[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const chunk of body as any) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Object Storage tools grounded in:
 * - FA/EN API Usage S3 Signature samples (get/list/create bucket)
 * - Official SDK docs under developer-tools/sdk/object-storage/*
 * - FA object-storage/metrics for metrics API
 */
export function registerObjectStorageTools(
  server: McpServer,
  opts: { config: ArvanCloudConfig; apiRequest: (url: string, init: { method: string }) => Promise<unknown> },
): void {
  server.registerTool(
    "list_buckets",
    {
      title: "List Object Storage buckets",
      description:
        "[READ] S3 ListBuckets via official AWS-compatible SDK pattern (FA developer-tools/sdk/object-storage/list-bucket).",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        const s3 = requireS3(opts.config);
        const out = await s3.send(new ListBucketsCommand({}));
        return toolResult({
          buckets: (out.Buckets ?? []).map((b) => ({
            name: b.Name,
            creation_date: b.CreationDate,
          })),
        });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "create_bucket",
    {
      title: "Create Object Storage bucket",
      description:
        "[WRITE] S3 CreateBucket. Official API Usage curl + SDK create-bucket docs. ACL may be private|public-read per SDK sample.",
      inputSchema: z.object({
        bucket: z.string().min(1),
        acl: z.enum(["private", "public-read"]).optional(),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ bucket, acl }) => {
      try {
        assertWritable({ readOnly: opts.config.readOnly });
        const s3 = requireS3(opts.config);
        const out = await s3.send(
          new CreateBucketCommand({
            Bucket: bucket,
            ...(acl ? { ACL: acl } : {}),
          }),
        );
        return toolResult({ bucket, location: out.Location, metadata: out.$metadata });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "head_bucket",
    {
      title: "Check bucket exists",
      description: "[READ] S3 HeadBucket (FA SDK head-bucket).",
      inputSchema: z.object({ bucket: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ bucket }) => {
      try {
        const s3 = requireS3(opts.config);
        await s3.send(new HeadBucketCommand({ Bucket: bucket }));
        return toolResult({ bucket, exists: true });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "delete_bucket",
    {
      title: "Delete Object Storage bucket",
      description:
        "[DESTRUCTIVE] S3 DeleteBucket (FA SDK delete-bucket). Bucket must be empty per product docs.",
      inputSchema: z.object({ bucket: z.string().min(1) }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async ({ bucket }) => {
      try {
        assertWritable({ readOnly: opts.config.readOnly });
        const s3 = requireS3(opts.config);
        await s3.send(new DeleteBucketCommand({ Bucket: bucket }));
        return toolResult({ deleted: true, bucket });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_objects",
    {
      title: "List objects in a bucket",
      description:
        "[READ] S3 ListObjectsV2. Official API Usage listObjects sample + SDK object-list.",
      inputSchema: z.object({
        bucket: z.string().min(1),
        prefix: z.string().optional(),
        max_keys: z.number().int().positive().max(1000).optional(),
        continuation_token: z.string().optional(),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const s3 = requireS3(opts.config);
        const out = await s3.send(
          new ListObjectsV2Command({
            Bucket: args.bucket,
            Prefix: args.prefix,
            MaxKeys: args.max_keys,
            ContinuationToken: args.continuation_token,
          }),
        );
        return toolResult({
          bucket: args.bucket,
          contents: (out.Contents ?? []).map((o) => ({
            key: o.Key,
            size: o.Size,
            last_modified: o.LastModified,
            etag: o.ETag,
          })),
          is_truncated: out.IsTruncated,
          next_continuation_token: out.NextContinuationToken,
        });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "head_object",
    {
      title: "Head object metadata",
      description: "[READ] S3 HeadObject (FA SDK head-object).",
      inputSchema: z.object({
        bucket: z.string().min(1),
        key: z.string().min(1),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ bucket, key }) => {
      try {
        const s3 = requireS3(opts.config);
        const out = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        return toolResult({
          bucket,
          key,
          content_length: out.ContentLength,
          content_type: out.ContentType,
          etag: out.ETag,
          last_modified: out.LastModified,
          metadata: out.Metadata,
        });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_object_text",
    {
      title: "Download object as text (size-capped)",
      description:
        "[READ] S3 GetObject for text-ish content. Caps at max_bytes (default 256KiB) to avoid dumping large binaries into the agent context. Official API Usage getObject.",
      inputSchema: z.object({
        bucket: z.string().min(1),
        key: z.string().min(1),
        max_bytes: z.number().int().positive().max(2_000_000).optional(),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ bucket, key, max_bytes }) => {
      try {
        const lim = max_bytes ?? 262_144;
        const s3 = requireS3(opts.config);
        const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        if ((head.ContentLength ?? 0) > lim) {
          return toolError(
            new Error(
              `Object size ${head.ContentLength} exceeds max_bytes=${lim}. Use head_object or raise max_bytes cautiously.`,
            ),
          );
        }
        const out = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        const text = await streamToString(out.Body);
        return toolResult({ bucket, key, content_type: out.ContentType, body_text: text });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "put_object_text",
    {
      title: "Upload text object",
      description:
        "[WRITE] S3 PutObject with string body (FA SDK upload-object). For binary uploads use other clients; this tool is text-oriented for agent safety.",
      inputSchema: z.object({
        bucket: z.string().min(1),
        key: z.string().min(1),
        body: z.string(),
        content_type: z.string().optional(),
        acl: z.enum(["private", "public-read"]).optional(),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        assertWritable({ readOnly: opts.config.readOnly });
        const s3 = requireS3(opts.config);
        const out = await s3.send(
          new PutObjectCommand({
            Bucket: args.bucket,
            Key: args.key,
            Body: args.body,
            ContentType: args.content_type ?? "text/plain; charset=utf-8",
            ...(args.acl ? { ACL: args.acl } : {}),
          }),
        );
        return toolResult({ bucket: args.bucket, key: args.key, etag: out.ETag });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "delete_object",
    {
      title: "Delete object",
      description: "[DESTRUCTIVE] S3 DeleteObject (FA SDK delete-object). Requires exact bucket+key.",
      inputSchema: z.object({
        bucket: z.string().min(1),
        key: z.string().min(1),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async ({ bucket, key }) => {
      try {
        assertWritable({ readOnly: opts.config.readOnly });
        const s3 = requireS3(opts.config);
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        return toolResult({ deleted: true, bucket, key });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_bucket_metrics",
    {
      title: "Get Object Storage bucket metrics",
      description:
        "[READ] OpenAPI storage/1.0.0 + FA metrics: GET https://storage.arvanapis.ir/v1/buckets/{bucketName}/metrics",
      inputSchema: z.object({ bucket: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ bucket }) => {
      try {
        const base = opts.config.storageApiBaseUrl.replace(/\/$/, "");
        const data = await opts.apiRequest(`${base}/buckets/${encodeURIComponent(bucket)}/metrics`, {
          method: "GET",
        });
        return toolResult(data);
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "list_storage_api_buckets",
    {
      title: "List buckets via Storage management API",
      description:
        "[READ] OpenAPI Object Storage API 1.0.0: GET /v1/buckets (storage.arvanapis.ir) — optional status=all|shared|owned, page, perPage. Uses Machine User key (not S3 HMAC).",
      inputSchema: z.object({
        status: z.enum(["all", "shared", "owned"]).optional(),
        page: z.number().int().positive().optional(),
        perPage: z.number().int().positive().optional(),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const base = opts.config.storageApiBaseUrl.replace(/\/$/, "");
        const q = new URLSearchParams();
        if (args.status) q.set("status", args.status);
        if (args.page !== undefined) q.set("page", String(args.page));
        if (args.perPage !== undefined) q.set("perPage", String(args.perPage));
        const qs = q.toString();
        const data = await opts.apiRequest(`${base}/buckets${qs ? `?${qs}` : ""}`, {
          method: "GET",
        });
        return toolResult(data);
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_storage_report",
    {
      title: "Get Object Storage usage report",
      description: "[READ] OpenAPI: GET /v1/reports/storage on storage.arvanapis.ir",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        const base = opts.config.storageApiBaseUrl.replace(/\/$/, "");
        const data = await opts.apiRequest(`${base}/reports/storage`, { method: "GET" });
        return toolResult(data);
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
