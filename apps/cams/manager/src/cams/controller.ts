import { TRPCClientError } from "@trpc/client";
import { DurableObject, env } from "cloudflare:workers";
import { presetWebsite } from "../presets/client.ts";
import { runPresetJob, type PresetJob } from "../presets/runner.ts";

class PresetQueueFullError extends Error {}

function safeFailureCategory(error: unknown): string {
  if (error instanceof TRPCClientError) {
    const code: unknown = error.data?.code;
    if (
      typeof code === "string" &&
      [
        "PARSE_ERROR",
        "BAD_REQUEST",
        "INTERNAL_SERVER_ERROR",
        "NOT_IMPLEMENTED",
        "BAD_GATEWAY",
        "SERVICE_UNAVAILABLE",
        "GATEWAY_TIMEOUT",
        "UNAUTHORIZED",
        "FORBIDDEN",
        "NOT_FOUND",
        "METHOD_NOT_SUPPORTED",
        "TIMEOUT",
        "CONFLICT",
        "PRECONDITION_FAILED",
        "PAYLOAD_TOO_LARGE",
        "UNPROCESSABLE_CONTENT",
        "TOO_MANY_REQUESTS",
        "CLIENT_CLOSED_REQUEST",
      ].includes(code)
    )
      return `trpc:${code}`;
    return "trpc:transport";
  }
  if (
    error instanceof Error &&
    /^Upstream returned HTTP [1-5][0-9]{2}\.$/.test(error.message)
  )
    return error.message;
  if (error instanceof TypeError) return "TypeError";
  if (error instanceof SyntaxError) return "SyntaxError";
  return "delivery-error";
}

// A single instance (`getByName("default")`) that only forwards requests for
// now: it doesn't queue camera commands or store anything yet. Live camera
// state will live here.
export class CamControllerDurableObject extends DurableObject {
  private draining?: Promise<void>;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
  }

  // Callers use `stub.fetch()` rather than calling the RPC method directly: a
  // request body sent over JS RPC fails with "ReadableStream received over RPC
  // disconnected prematurely" once the call returns.
  async fetch(request: Request) {
    return this.dangerouslyForwardFetch(request);
  }

  async dangerouslyForwardFetch(request: Request) {
    // The VPC service only exposes HTTP; the URL also supplies its Host header.
    const url = new URL(request.url);
    url.protocol = "http:";
    url.hostname = "control-api";
    url.port = "";

    const forwardedRequest = new Request(url, request);
    forwardedRequest.headers.set("Host", url.host);
    forwardedRequest.headers.set(
      "Authorization",
      `ApiKey ${env.CONTROL_API_TOKEN}`,
    );

    return await env.CONTROL_API.fetch(forwardedRequest);
  }

  async enqueuePresetJob(id: string) {
    const key = `preset:${id}`;
    const operation = await presetWebsite(env).presets.operation.query({ id });
    await this.ctx.storage.transaction(async (storage) => {
      if (!(await storage.get(key))) {
        const pending = await storage.list({ prefix: "preset:" });
        if (pending.size >= 500)
          throw new PresetQueueFullError("Preset delivery queue is full.");
        await storage.put<PresetJob>(key, {
          id,
          attempt: 0,
          availableAt: Date.now(),
          createdAt: Date.parse(operation.createdAt),
          camera: operation.camera,
        });
      }
      await storage.setAlarm(Date.now() + 1000);
    });
    this.ctx.waitUntil(this.drainPresetJobs());
  }

  async reconcilePresetJobs() {
    if (!env.SITE_URL || !env.SITE_SHARED_KEY) return;
    let after: { createdAt: string; id: string } | undefined;
    // Bound each reconciliation independently of how quickly its jobs drain.
    // Pagination passes old blocked operations instead of revisiting only the first 100.
    for (let scanned = 0; scanned < 500;) {
      if ((await this.ctx.storage.list({ prefix: "preset:" })).size >= 500)
        break;
      const operations = await presetWebsite(env).presets.pending.query({
        after,
      });
      for (const operation of operations) {
        try {
          await this.enqueuePresetJob(operation.id);
        } catch (error) {
          if (error instanceof PresetQueueFullError) return;
          throw error;
        }
      }
      scanned += operations.length;
      if (operations.length < 100) break;
      const last = operations.at(-1)!;
      after = { createdAt: last.createdAt, id: last.id };
    }
    await this.drainPresetJobs();
  }

  async alarm() {
    await this.ctx.storage.setAlarm(Date.now() + 30_000);
    await this.drainPresetJobs();
  }

  private drainPresetJobs() {
    this.draining ??= this.processPresetJobs().finally(() => {
      this.draining = undefined;
    });
    return this.draining;
  }

  private async processPresetJobs() {
    // An alarm remains armed during external I/O, including isolate termination.
    await this.ctx.storage.setAlarm(Date.now() + 30_000);
    const jobs = Array.from(
      await this.ctx.storage.list<PresetJob>({ prefix: "preset:" }),
    ).sort(
      ([, a], [, b]) =>
        (a.createdAt ?? a.availableAt) - (b.createdAt ?? b.availableAt) ||
        a.id.localeCompare(b.id),
    );
    let processed = 0;
    const blockedCameras = new Set<string>();
    for (const [key, job] of jobs) {
      const camera = job.camera ?? "unknown";
      if (blockedCameras.has(camera)) continue;
      if (job.availableAt > Date.now() || processed++ >= 10) {
        blockedCameras.add(camera);
        continue;
      }
      let stage = "start";
      try {
        await runPresetJob(job, {
          onStage: (value) => {
            stage = value;
          },
          website: presetWebsite(env),
          control: (path, camera, init = {}) => {
            const headers = new Headers(init.headers);
            headers.set("Authorization", `ApiKey ${env.CONTROL_API_TOKEN}`);
            headers.set("x-camera-name", camera);
            headers.set("Host", "control-api");
            return env.CONTROL_API.fetch(`http://control-api${path}`, {
              ...init,
              headers,
              redirect: "manual",
              signal: AbortSignal.timeout(15_000),
            });
          },
          persist: (state) => this.ctx.storage.put(key, state),
          now: Date.now,
        });
        await this.ctx.storage.delete(key);
      } catch (error) {
        job.attempt++;
        job.availableAt =
          Date.now() + Math.min(60_000, 1000 * 2 ** Math.min(job.attempt, 6));
        await this.ctx.storage.put(key, job);
        blockedCameras.add(camera);
        console.warn(
          "Preset delivery will retry",
          job.id,
          job.attempt,
          stage,
          safeFailureCategory(error),
        );
      }
    }
    await this.ctx.storage.transaction(async (storage) => {
      const remaining = Array.from(
        (await storage.list<PresetJob>({ prefix: "preset:" })).values(),
      ).sort(
        (a, b) =>
          (a.createdAt ?? a.availableAt) - (b.createdAt ?? b.availableAt) ||
          a.id.localeCompare(b.id),
      );
      if (remaining.length) {
        const seen = new Set<string>();
        const heads = remaining.filter((job) => {
          const camera = job.camera ?? "unknown";
          if (seen.has(camera)) return false;
          seen.add(camera);
          return true;
        });
        await storage.setAlarm(
          Math.max(
            Date.now() + 1000,
            Math.min(...heads.map((job) => job.availableAt)),
          ),
        );
      } else await storage.deleteAlarm();
    });
  }
}
