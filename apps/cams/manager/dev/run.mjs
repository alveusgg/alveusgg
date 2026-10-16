import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startIssuer } from "./issuer.mjs";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let temporary;
let child;
let issuer;
let stopping = false;
let force;
const withWebsite = process.argv[2] === "--site";

function requestStop() {
  stopping = true;
  if (child && child.exitCode === null && child.signalCode === null) {
    child.kill("SIGTERM");
    force ??= setTimeout(() => child.kill("SIGKILL"), 5000);
  }
}

process.on("SIGINT", requestStop);
process.on("SIGTERM", requestStop);

try {
  if (process.argv.length !== (withWebsite ? 3 : 2))
    throw new Error("Usage: dev:mock [--site].");
  const state = await fetch("http://127.0.0.1:8090/mock/state", {
    signal: AbortSignal.timeout(3000),
  }).then((response) => {
    if (!response.ok) throw new Error("Mock camera is not ready.");
    return response.json();
  });
  if (!state["garden.cam"]?.position)
    throw new Error("Expected the infrastructure mock camera.");

  temporary = await mkdtemp(join(tmpdir(), "cams-manager-local-"));
  await mkdir(join(temporary, "home"));
  // Copying configs keeps Wrangler's .env/.dev.vars discovery and persistence
  // outside the checkout. HOME/XDG also isolate Wrangler's saved OAuth login.
  const text = await readFile(join(root, "wrangler.mock.json"), "utf8");
  const manager = JSON.parse(text);
  if (withWebsite) manager.vars.ALVEUS_AUTH_ISSUER = "http://localhost:3000";
  manager.main = join(root, manager.main);
  delete manager.$schema;
  const configs = [manager];
  for (const [name, file] of [
    ["cams-control-api-local", "rest.ts"],
    ["cams-control-events-local", "events.ts"],
  ]) {
    configs.push({
      name,
      main: join(root, "dev", file),
      compatibility_date: manager.compatibility_date,
      workers_dev: false,
      preview_urls: false,
    });
  }
  const args = [];
  for (const [index, config] of configs.entries()) {
    const path = join(temporary, `${index}.json`);
    await writeFile(path, JSON.stringify(config));
    args.push("--config", path);
  }
  await writeFile(join(temporary, ".dev.vars"), "");
  if (!withWebsite) issuer = await startIssuer();
  const wrangler = join(
    dirname(require.resolve("wrangler/package.json")),
    "bin",
    "wrangler.js",
  );
  if (stopping) throw new Error("Stopped during startup.");
  child = spawn(
    process.execPath,
    [
      wrangler,
      "dev",
      ...args,
      "--local",
      "--ip",
      "127.0.0.1",
      "--port",
      "8787",
      "--inspector-port",
      "0",
    ],
    {
      cwd: temporary,
      // Intentionally do not spread process.env: no CF tokens, production secrets,
      // dotenv overrides, NODE_OPTIONS or saved Cloudflare credentials are passed.
      env: {
        PATH: process.env.PATH,
        HOME: join(temporary, "home"),
        XDG_CONFIG_HOME: join(temporary, "home"),
        WRANGLER_SEND_METRICS: "false",
        CI: "true",
        NO_COLOR: "1",
      },
      stdio: ["ignore", "inherit", "inherit"],
    },
  );
  console.log(
    withWebsite
      ? "Local mocks only. Manager: http://127.0.0.1:8787; website issuer: http://localhost:3000"
      : "Local mocks only. Manager: http://127.0.0.1:8787; issuer: http://127.0.0.1:8798",
  );
  if (!withWebsite)
    console.log(
      "Mint a header file with pnpm mock:token <new-file> [comma-separated-roles]. Ctrl-C stops both services.",
    );
  const [code] = await once(child, "exit");
  process.exitCode = stopping ? 0 : (code ?? 1);
} catch (error) {
  // Avoid printing fetch errors/request details: startup never needs credentials.
  if (!stopping) {
    console.error(
      error instanceof Error && error.message === "Usage: dev:mock [--site]."
        ? error.message
        : "Could not start local mocks. Check loopback ports 8787/8798 and the infrastructure mock stack (8090/1229/3130).",
    );
    process.exitCode = 1;
  }
} finally {
  clearTimeout(force);
  if (issuer) {
    issuer.closeAllConnections();
    await new Promise((done) => issuer.close(done));
  }
  if (temporary) await rm(temporary, { recursive: true, force: true });
}
