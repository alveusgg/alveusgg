import { TRPCClientError } from "@trpc/client";
import { z } from "zod";
import type { PresetWebsite } from "./client.ts";

const positionSchema = z.object({
  pan: z.number().finite(),
  tilt: z.number().finite(),
  zoom: z.number().finite(),
  focus: z.number().finite().optional(),
  autofocus: z.enum(["on", "off"]).optional(),
  brightness: z.number().finite().optional(),
  autoiris: z.enum(["on", "off"]).optional(),
});

export const captureSchema = z.object({
  id: z.uuid(),
  camera: z.string(),
  position: positionSchema,
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
  contentType: z.literal("image/jpeg"),
  capturedAt: z.iso.datetime(),
});

export type PresetJob = {
  id: string;
  attempt: number;
  availableAt: number;
  createdAt?: number;
  camera?: string;
  loadDispatched?: boolean;
  receipt?: { camera: string; sha256: string };
};

type Dependencies = {
  website: PresetWebsite;
  control: (
    path: string,
    camera: string,
    init?: RequestInit,
  ) => Promise<Response>;
  persist: (job: PresetJob) => Promise<void>;
  now: () => number;
  upload?: typeof fetch;
  // Only fixed stage names cross this boundary, never request data or URLs.
  onStage?: (stage: string) => void;
};

async function successful(response: Response) {
  // Never include upstream bodies, URLs or headers in errors: upload URLs are
  // credentials, and service errors may contain request details.
  if (!response.ok)
    throw new Error(`Upstream returned HTTP ${response.status}.`);
  return response;
}

async function captureBytes(response: Response, expectedSize: number) {
  if (!response.body) throw new Error("Capture image has no body.");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > expectedSize || size > 10 * 1024 * 1024)
        throw new Error("Capture image exceeds its declared size.");
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  if (size !== expectedSize) throw new Error("Capture image size changed.");
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function acknowledge(job: PresetJob, deps: Dependencies) {
  if (!job.receipt) return;
  deps.onStage?.("receipt-write");
  await successful(
    await deps.control(`/captures/${job.id}/receipt`, job.receipt.camera, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sha256: job.receipt.sha256 }),
    }),
  );
}

export async function runPresetJob(job: PresetJob, deps: Dependencies) {
  if (job.receipt) {
    await acknowledge(job, deps);
    return;
  }
  let operation;
  try {
    deps.onStage?.("operation-read");
    operation = await deps.website.presets.operation.query({ id: job.id });
  } catch (error) {
    // Only the authoritative site's missing operation is terminal. A missing
    // camera image/capture may be transient and must never earn a receipt.
    if (error instanceof TRPCClientError && error.data?.code === "NOT_FOUND")
      return;
    throw error;
  }
  if (operation.action === "load") {
    if (operation.status !== "pending") return;
    if (job.loadDispatched) {
      await deps.website.presets.complete.mutate({
        id: job.id,
        status: "failed",
        error: "Load outcome unknown; it will not be automatically repeated.",
      });
      return;
    }
    if (Date.parse(operation.expiresAt) < deps.now()) {
      await deps.website.presets.complete.mutate({
        id: job.id,
        status: "failed",
        error: "Load expired before it could be dispatched.",
      });
      return;
    }
    const parsedPosition = positionSchema.safeParse(operation.position);
    if (!parsedPosition.success) {
      await deps.website.presets.complete.mutate({
        id: job.id,
        status: "failed",
        error: "Stored preset position is invalid; load was not dispatched.",
      });
      return;
    }
    const position = parsedPosition.data;
    job.loadDispatched = true;
    // Persist BEFORE a movement: a lost response is not permission to move again.
    deps.onStage?.("load-persist");
    await deps.persist(job);
    // The website orders this durable claim against subscriber pauses. A stale
    // operation snapshot cannot authorize movement after a pause has cancelled it.
    deps.onStage?.("load-claim");
    const claim = await deps.website.presets.claimLoad.mutate({ id: job.id });
    if (!claim.claimed) return;
    try {
      deps.onStage?.("load-dispatch");
      const response = await successful(
        await deps.control("/ptz/load", operation.camera, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pan: position.pan,
            tilt: position.tilt,
            zoom: position.zoom,
            ...(position.focus !== undefined && { focus: position.focus }),
            ...(position.autofocus !== undefined && {
              autofocus: position.autofocus,
            }),
          }),
        }),
      );
      await response.arrayBuffer();
    } catch {
      await deps.website.presets.complete.mutate({
        id: job.id,
        status: "failed",
        error: "Load outcome unknown; it will not be automatically repeated.",
      });
      return;
    }
    await deps.website.presets.complete.mutate({
      id: job.id,
      status: "completed",
      result: { accepted: true },
    });
    return;
  }
  if (operation.action !== "save") return;

  deps.onStage?.("capture-read");
  let response = await deps.control(`/captures/${job.id}`, operation.camera);
  if (response.status === 404) {
    if (operation.status !== "pending") return;
    if (Date.parse(operation.expiresAt) < deps.now()) {
      await deps.website.presets.complete.mutate({
        id: job.id,
        status: "failed",
        error: "Save expired before capture; no later screenshot was taken.",
      });
      return;
    }
    deps.onStage?.("capture-create");
    response = await deps.control(`/captures/${job.id}`, operation.camera, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresAt: Date.parse(operation.expiresAt) }),
    });
    if (response.status === 409 || response.status === 410) {
      await deps.website.presets.complete.mutate({
        id: job.id,
        status: "failed",
        error:
          response.status === 409
            ? "Camera changed during capture; save again when stationary."
            : "Save expired before capture; no later screenshot was taken.",
      });
      return;
    }
  }
  await successful(response);
  const capture = captureSchema.parse(await response.json());
  if (capture.id !== job.id || capture.camera !== operation.camera)
    throw new Error("Capture identity does not match the operation.");

  deps.onStage?.("upload-prepare");
  const prepared = await deps.website.presets.prepareCapture.mutate({
    operationId: job.id,
    capture,
  });
  if (!prepared.delivered) {
    deps.onStage?.("image-read");
    const image = await successful(
      await deps.control(`/captures/${job.id}/image`, operation.camera),
    );
    const declaredSize = Number(image.headers.get("Content-Length"));
    if (declaredSize && declaredSize > 10 * 1024 * 1024)
      throw new Error("Capture image exceeds the size limit.");
    deps.onStage?.("image-validate");
    const bytes = await captureBytes(image, capture.size);
    const digest = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      (byte) => byte.toString(16).padStart(2, "0"),
    ).join("");
    if (digest !== capture.sha256)
      throw new Error("Capture image hash changed.");
    deps.onStage?.("image-upload");
    await successful(
      await (deps.upload ?? fetch)(prepared.uploadUrl, {
        method: "PUT",
        headers: prepared.headers,
        body: bytes,
        // workerd supports manual/follow only; successful() rejects a 3xx
        // without forwarding the signed URL or upload body to another host.
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
      }),
    );
    deps.onStage?.("capture-commit");
    const committed = await deps.website.presets.commitCapture.mutate({
      operationId: job.id,
      captureId: capture.id,
    });
    if (!committed.delivered) throw new Error("Site did not confirm delivery.");
  }
  job.receipt = { camera: operation.camera, sha256: capture.sha256 };
  deps.onStage?.("receipt-persist");
  await deps.persist(job);
  await acknowledge(job, deps);
}
