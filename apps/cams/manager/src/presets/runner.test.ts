import { createHash } from "node:crypto";
import { TRPCClientError } from "@trpc/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PresetWebsite } from "./client.ts";
import { type PresetJob, runPresetJob } from "./runner.ts";

const id = "aeef07fa-ea5c-4fd2-bbcb-8f60d67ff38b";
const now = Date.parse("2026-10-16T10:00:00.000Z");
const bytes = new Uint8Array([255, 216, 255, 224, 1, 2, 3, 4]);
const sha256 = createHash("sha256").update(bytes).digest("hex");
function fixture() {
  const operation = {
    id,
    action: "save",
    camera: "garden",
    name: "home",
    status: "pending",
    createdAt: new Date(now - 1000).toISOString(),
    expiresAt: new Date(now + 14000).toISOString(),
    position: {
      pan: 10,
      tilt: -5,
      zoom: 100,
      focus: 600,
      autofocus: "off",
      brightness: 5000,
      autoiris: "on",
    },
  };
  const capture = {
    id,
    camera: "garden",
    position: operation.position,
    sha256,
    size: bytes.byteLength,
    contentType: "image/jpeg",
    capturedAt: new Date(now).toISOString(),
  };
  const state = {
    captured: false,
    delivered: false,
    receiptFails: false,
    missingImage: false,
    download: bytes,
  };
  const website = {
    presets: {
      operation: { query: vi.fn(async () => operation) },
      claimLoad: { mutate: vi.fn(async () => ({ claimed: true, operation })) },
      prepareCapture: {
        mutate: vi.fn(async () =>
          state.delivered
            ? { delivered: true }
            : {
                delivered: false,
                uploadUrl: "https://local-upload.test/scoped",
                headers: { "Content-Type": "image/jpeg" },
              },
        ),
      },
      commitCapture: {
        mutate: vi.fn(async () => {
          state.delivered = true;
          return { delivered: true };
        }),
      },
      complete: {
        mutate: vi.fn(async (input: { status: string }) => {
          operation.status = input.status;
          return operation;
        }),
      },
    },
  };
  const control = vi.fn(
    async (path: string, _camera: string, init?: RequestInit) => {
      if (path === `/captures/${id}`) {
        if (init?.method === "POST") {
          state.captured = true;
          return Response.json(capture);
        }
        return state.captured
          ? Response.json(capture)
          : new Response(null, { status: 404 });
      }
      if (path === `/captures/${id}/image`)
        return state.missingImage
          ? new Response(null, { status: 404 })
          : new Response(new Uint8Array(state.download));
      if (path === `/captures/${id}/receipt`)
        return new Response(null, { status: state.receiptFails ? 503 : 200 });
      if (path === "/ptz/load") return new Response("accepted");
      throw new Error("Unexpected local control path");
    },
  );
  const persist = vi.fn(async (_job: PresetJob) => {});
  const upload = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(null, { status: 200 }),
  );
  const deps = {
    website: website as unknown as PresetWebsite,
    control,
    persist,
    now: () => now,
    upload: upload as typeof fetch,
  };
  const job: PresetJob = { id, attempt: 0, availableAt: now };
  const capturePosts = () =>
    control.mock.calls.filter(
      ([path, , init]) => path === `/captures/${id}` && init?.method === "POST",
    );
  const receipts = () =>
    control.mock.calls.filter(([path]) => path === `/captures/${id}/receipt`);
  const loads = () =>
    control.mock.calls.filter(([path]) => path === "/ptz/load");
  return {
    operation,
    capture,
    state,
    website,
    control,
    persist,
    upload,
    deps,
    job,
    capturePosts,
    receipts,
    loads,
  };
}
beforeEach(() =>
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("Unexpected network access in runner tests");
    }),
  ),
);
afterEach(() => vi.unstubAllGlobals());

it("uses workerd-compatible manual redirects and rejects a redirected upload before commit or receipt", async () => {
  const f = fixture();
  f.upload.mockImplementation(async (_input, init) => {
    if (init?.redirect !== "manual")
      throw new TypeError("Unsupported workerd redirect mode");
    return new Response(null, {
      status: 307,
      headers: { Location: "https://another-host.test/upload" },
    });
  });
  await expect(runPresetJob(f.job, f.deps)).rejects.toThrow(
    "Upstream returned HTTP 307.",
  );
  expect(f.upload).toHaveBeenCalledTimes(1);
  expect(f.website.presets.commitCapture.mutate).not.toHaveBeenCalled();
  expect(f.receipts()).toHaveLength(0);
});

describe("preset capture delivery recovery", () => {
  it("never moves the camera for a load cancelled by the site's chat ban check", async () => {
    const f = fixture();
    f.operation.action = "load";
    f.operation.status = "failed";
    await runPresetJob(f.job, f.deps);
    expect(f.control).not.toHaveBeenCalled();
    expect(f.persist).not.toHaveBeenCalled();
    expect(f.website.presets.complete.mutate).not.toHaveBeenCalled();
  });

  it("keeps a load retryable without movement when chat ban verification is unavailable", async () => {
    const f = fixture();
    f.operation.action = "load";
    f.website.presets.operation.query.mockRejectedValue(
      TRPCClientError.from({
        error: {
          message: "Preset access verification is temporarily unavailable.",
          code: -32603,
          data: { code: "SERVICE_UNAVAILABLE", httpStatus: 503 },
        },
      }),
    );
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow(
      "Preset access verification is temporarily unavailable.",
    );
    expect(f.control).not.toHaveBeenCalled();
    expect(f.persist).not.toHaveBeenCalled();
    expect(f.website.presets.complete.mutate).not.toHaveBeenCalled();
  });

  it("reuses the retained original capture after an upload acknowledgement was lost", async () => {
    const f = fixture();
    f.upload.mockRejectedValueOnce(new Error("upload response lost"));
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow(
      "upload response lost",
    );
    expect(f.receipts()).toHaveLength(0);
    expect(f.website.presets.commitCapture.mutate).not.toHaveBeenCalled();
    await runPresetJob(f.job, f.deps);
    expect(f.capturePosts()).toHaveLength(1);
    expect(f.upload).toHaveBeenCalledTimes(2);
    expect(f.receipts()).toHaveLength(1);
    expect(f.state.delivered).toBe(true);
  });

  it("retries delivery confirmation after a lost website commit response and then receipts without re-upload", async () => {
    const f = fixture();
    f.website.presets.commitCapture.mutate.mockImplementationOnce(async () => {
      f.state.delivered = true;
      throw new Error("commit response lost");
    });
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow(
      "commit response lost",
    );
    expect(f.receipts()).toHaveLength(0);
    await runPresetJob(f.job, f.deps);
    expect(f.upload).toHaveBeenCalledTimes(1);
    expect(f.capturePosts()).toHaveLength(1);
    expect(f.receipts()).toHaveLength(1);
  });

  it("will not receipt an upload unless the website explicitly confirms durable delivery", async () => {
    const f = fixture();
    f.website.presets.commitCapture.mutate.mockResolvedValueOnce({
      delivered: false,
    });
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow(
      "did not confirm delivery",
    );
    expect(f.receipts()).toHaveLength(0);
    expect(f.job.receipt).toBeUndefined();
  });

  it("never uploads, commits or receipts a retained image whose actual hash differs", async () => {
    const f = fixture();
    f.state.captured = true;
    f.state.download = new Uint8Array(bytes).reverse();
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow("hash changed");
    expect(f.upload).not.toHaveBeenCalled();
    expect(f.website.presets.commitCapture.mutate).not.toHaveBeenCalled();
    expect(f.receipts()).toHaveLength(0);
    expect(f.job.receipt).toBeUndefined();
  });

  it("persists receipt state before acknowledgement, then retries only that receipt after failure", async () => {
    const f = fixture();
    f.state.receiptFails = true;
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow("HTTP 503");
    expect(f.job.receipt).toEqual({ camera: "garden", sha256 });
    expect(f.persist).toHaveBeenCalledWith(f.job);
    expect(f.persist.mock.invocationCallOrder.at(-1)).toBeLessThan(
      f.control.mock.invocationCallOrder.at(-1)!,
    );
    f.state.receiptFails = false;
    const restartedJob = structuredClone(f.job);
    f.website.presets.operation.query.mockRejectedValue(
      new Error("website offline"),
    );
    await runPresetJob(restartedJob, f.deps);
    expect(f.website.presets.operation.query).toHaveBeenCalledTimes(1);
    expect(f.upload).toHaveBeenCalledTimes(1);
    expect(f.receipts()).toHaveLength(2);
  });

  it("delivers and acknowledges an existing capture even when its save is terminal and expired", async () => {
    const f = fixture();
    f.state.captured = true;
    f.operation.status = "failed";
    f.operation.expiresAt = new Date(now - 1).toISOString();
    await runPresetJob(f.job, f.deps);
    expect(f.capturePosts()).toHaveLength(0);
    expect(f.website.presets.commitCapture.mutate).toHaveBeenCalledTimes(1);
    expect(f.receipts()).toHaveLength(1);
  });

  it("never takes a later screenshot for a new expired save", async () => {
    const f = fixture();
    f.operation.expiresAt = new Date(now - 1).toISOString();
    await runPresetJob(f.job, f.deps);
    expect(f.capturePosts()).toHaveLength(0);
    expect(f.website.presets.complete.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ id, status: "failed" }),
    );
    expect(f.receipts()).toHaveLength(0);
  });

  it("keeps a missing retained image retryable and never treats that 404 as delivered", async () => {
    const f = fixture();
    f.state.captured = true;
    f.state.missingImage = true;
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow("HTTP 404");
    expect(f.website.presets.commitCapture.mutate).not.toHaveBeenCalled();
    expect(f.receipts()).toHaveLength(0);
  });

  it("forgets only an explicitly missing authoritative operation, with no camera access or acknowledgement", async () => {
    const f = fixture();
    f.website.presets.operation.query.mockRejectedValue(
      TRPCClientError.from({
        error: {
          message: "missing",
          code: -32004,
          data: { code: "NOT_FOUND", httpStatus: 404 },
        },
      }),
    );
    await runPresetJob(f.job, f.deps);
    expect(f.control).not.toHaveBeenCalled();
    expect(f.upload).not.toHaveBeenCalled();
  });

  it("does not forget operations when the website is merely unavailable", async () => {
    const f = fixture();
    f.website.presets.operation.query.mockRejectedValue(
      new Error("website offline"),
    );
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow(
      "website offline",
    );
    expect(f.control).not.toHaveBeenCalled();
  });

  it("cancels an oversized streaming body rather than buffering it or issuing a receipt", async () => {
    const f = fixture();
    f.state.captured = true;
    const cancel = vi.fn();
    f.control.mockImplementation(async (path) =>
      path.endsWith("/image")
        ? new Response(
            new ReadableStream({
              start(controller) {
                controller.enqueue(new Uint8Array(bytes.byteLength + 1));
              },
              cancel,
            }),
          )
        : Response.json(f.capture),
    );
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow("declared size");
    expect(cancel).toHaveBeenCalled();
    expect(f.website.presets.commitCapture.mutate).not.toHaveBeenCalled();
    expect(f.receipts()).toHaveLength(0);
  });
});

describe("preset load execution", () => {
  it("persists intent before loading and preserves focus/autofocus without changing brightness or autoiris", async () => {
    const f = fixture();
    f.operation.action = "load";
    await runPresetJob(f.job, f.deps);
    expect(f.loads()).toHaveLength(1);
    const body = JSON.parse(String(f.loads()[0]?.[2]?.body));
    expect(body).toEqual({
      pan: 10,
      tilt: -5,
      zoom: 100,
      focus: 600,
      autofocus: "off",
    });
    expect(f.persist.mock.invocationCallOrder[0]).toBeLessThan(
      f.website.presets.claimLoad.mutate.mock.invocationCallOrder[0]!,
    );
    expect(
      f.website.presets.claimLoad.mutate.mock.invocationCallOrder[0],
    ).toBeLessThan(f.control.mock.invocationCallOrder[0]!);
    expect(f.website.presets.complete.mutate).toHaveBeenCalledWith({
      id,
      status: "completed",
      result: { accepted: true },
    });
  });

  it("does not repeat a movement after its acknowledgement is lost", async () => {
    const f = fixture();
    f.operation.action = "load";
    f.control.mockRejectedValueOnce(new Error("load acknowledgement lost"));
    f.website.presets.complete.mutate.mockRejectedValueOnce(
      new Error("website offline"),
    );
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow(
      "website offline",
    );
    expect(f.job.loadDispatched).toBe(true);
    await runPresetJob(structuredClone(f.job), f.deps);
    expect(f.loads()).toHaveLength(1);
    expect(f.website.presets.complete.mutate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: "failed",
        error: expect.stringContaining("unknown"),
      }),
    );
  });

  it("fails a malformed stored position without a movement or endless retries", async () => {
    const f = fixture();
    f.operation.action = "load";
    f.operation.position.pan = Number.NaN;
    await runPresetJob(f.job, f.deps);
    expect(f.control).not.toHaveBeenCalled();
    expect(f.persist).not.toHaveBeenCalled();
    expect(f.website.presets.complete.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        error: expect.stringContaining("invalid"),
      }),
    );
  });

  it("does not move if intent persistence fails", async () => {
    const f = fixture();
    f.operation.action = "load";
    f.persist.mockRejectedValueOnce(new Error("storage unavailable"));
    await expect(runPresetJob(f.job, f.deps)).rejects.toThrow(
      "storage unavailable",
    );
    expect(f.control).not.toHaveBeenCalled();
  });
});

it("does not move if a pause cancels the load while dispatch intent is persisted", async () => {
  const f = fixture();
  f.operation.action = "load";
  f.persist.mockImplementationOnce(async () => {
    f.operation.status = "failed";
  });
  f.website.presets.claimLoad.mutate.mockImplementationOnce(async () => ({
    claimed: false,
    operation: f.operation,
  }));
  await runPresetJob(f.job, f.deps);
  expect(f.website.presets.claimLoad.mutate).toHaveBeenCalledWith({ id });
  expect(f.control).not.toHaveBeenCalled();
  expect(f.website.presets.complete.mutate).not.toHaveBeenCalled();
});

it("does not move or reclaim after the dispatch claim response is lost", async () => {
  const f = fixture();
  f.operation.action = "load";
  f.website.presets.claimLoad.mutate.mockRejectedValueOnce(
    new Error("claim response lost"),
  );
  await expect(runPresetJob(f.job, f.deps)).rejects.toThrow(
    "claim response lost",
  );
  expect(f.control).not.toHaveBeenCalled();
  await runPresetJob(structuredClone(f.job), f.deps);
  expect(f.website.presets.claimLoad.mutate).toHaveBeenCalledTimes(1);
  expect(f.control).not.toHaveBeenCalled();
  expect(f.website.presets.complete.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      status: "failed",
      error: expect.stringContaining("unknown"),
    }),
  );
});
