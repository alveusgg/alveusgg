import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { getSentryConfig } from "@/utils/sentry";

const { config } = vi.hoisted(() => ({
  config: {
    SENTRY_DSN: "" as string | undefined,
    SENTRY_RELEASE: "",
    SENTRY_ENVIRONMENT: "",
  },
}));
vi.mock("@/env", () => ({ env: config }));

const cwd = fileURLToPath(new URL("..", import.meta.url));
const tsx = fileURLToPath(import.meta.resolve("tsx/cli"));

function run(
  program: string,
  options: { dsn?: string; preload?: boolean } = {},
) {
  return spawnSync(
    process.execPath,
    [
      tsx,
      ...(options.preload ? ["--import", "./src/instrument.ts"] : []),
      "--eval",
      program,
    ],
    {
      cwd,
      timeout: 10000,
      encoding: "utf8",
      env: {
        ...process.env,
        NODE_ENV: "test",
        SKIP_ENV_VALIDATION: "1",
        SENTRY_DSN: options.dsn || "",
        SENTRY_RELEASE: "test-release",
        SENTRY_ENVIRONMENT: "preview",
      },
    },
  );
}

describe("chatbot Sentry configuration", () => {
  beforeEach(() => {
    config.SENTRY_DSN = "http://public@127.0.0.1:9/1";
    config.SENTRY_RELEASE = "";
    config.SENTRY_ENVIRONMENT = "";
    vi.stubEnv("CHATBOT_REF_SHA", "deployed-sha");
  });
  afterEach(() => vi.unstubAllEnvs());

  test.each(["", undefined])(
    "does not initialize without a DSN (%s)",
    (dsn) => {
      config.SENTRY_DSN = dsn;
      expect(getSentryConfig()).toEqual({ enabled: false });
    },
  );

  test("uses development locally and the deployed commit as the release fallback", () => {
    expect(getSentryConfig()).toMatchObject({
      environment: "development",
      release: "deployed-sha",
    });
  });

  test("honors explicit release and environment overrides", () => {
    config.SENTRY_RELEASE = "override";
    config.SENTRY_ENVIRONMENT = "production";
    expect(getSentryConfig()).toMatchObject({
      release: "override",
      environment: "production",
    });
  });

  test("preloads successfully without setting up a client when disabled", () => {
    const result = run(
      'const assert = require("node:assert/strict"); assert.equal(require("@sentry/node").getClient(), undefined); console.log("disabled");',
      { preload: true },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("disabled");
  });

  test("preloads a client with deployment metadata and restricted data collection", () => {
    const result = run(
      `
      const assert = require("node:assert/strict");
      const Sentry = require("@sentry/node");
      const client = Sentry.getClient();
      assert.ok(client);
      assert.equal(client.getOptions().release, "test-release");
      assert.equal(client.getOptions().environment, "preview");
      assert.deepEqual(client.getOptions().dataCollection, {
        userInfo: false, cookies: false,
        httpHeaders: { request: false, response: false },
        httpBodies: [], urlQueryParams: false,
      });
      Sentry.close(50).then(() => console.log("initialized"));
    `,
      { preload: true, dsn: "http://public@127.0.0.1:9/1" },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("initialized");
  });

  test("reports an unhandled rejection and keeps its fatal exit behavior", () => {
    const result = run(
      `
      const Sentry = require("@sentry/node");
      const { getSentryConfig } = require("./src/utils/sentry.ts");
      Sentry.init({ ...getSentryConfig(), transport: () => ({
        send: async (envelope) => {
          for (const [header] of envelope[1]) {
            if (header.type === "event") require("node:fs").writeSync(1, "captured\\n");
          }
          return {};
        },
        flush: async () => true,
      }) });
      Promise.reject(new Error("expected test rejection"));
    `,
      { dsn: "http://public@127.0.0.1:9/1" },
    );
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("captured");
    expect(result.stderr).toContain("expected test rejection");
  });
});
