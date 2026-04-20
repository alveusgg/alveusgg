import * as z from "zod";

export function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export function base64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"));
}

export async function readBodyToBytes(
  body: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.byteLength;
    }
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

export const headerPairsSchema = z.array(z.tuple([z.string(), z.string()]));

export const bytesExprSchema = z.tuple([z.literal("bytes"), z.string()]);

export const bodySchema = z.union([z.null(), z.string(), bytesExprSchema]);

export type SerialisedBody = z.infer<typeof bodySchema>;

export const requestInitSchema = z.object({
  method: z.string().optional(),
  headers: headerPairsSchema.optional(),
  body: bodySchema.optional(),
  mode: z.enum(["cors", "no-cors", "same-origin", "navigate"]).optional(),
  credentials: z.enum(["omit", "same-origin", "include"]).optional(),
  cache: z
    .enum([
      "default",
      "no-store",
      "reload",
      "no-cache",
      "force-cache",
      "only-if-cached",
    ])
    .optional(),
  redirect: z.enum(["follow", "error", "manual"]).optional(),
  referrer: z.string().optional(),
  referrerPolicy: z
    .enum([
      "",
      "no-referrer",
      "no-referrer-when-downgrade",
      "same-origin",
      "origin",
      "strict-origin",
      "origin-when-cross-origin",
      "strict-origin-when-cross-origin",
      "unsafe-url",
    ])
    .optional(),
  integrity: z.string().optional(),
  keepalive: z.boolean().optional(),
});

export type SerialisedRequestInit = z.infer<typeof requestInitSchema>;

export const responseInitSchema = z.object({
  status: z.number().int().min(200).max(599).optional(),
  statusText: z.string().optional(),
  headers: headerPairsSchema.optional(),
});

export type SerialisedResponseInit = z.infer<typeof responseInitSchema>;
