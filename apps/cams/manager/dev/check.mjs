import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const cli = join(dirname(require.resolve("vitest/package.json")), "vitest.mjs");
const child = spawn(
  process.execPath,
  [cli, "run", "--config", "dev/vitest.mock.config.mjs"],
  {
    cwd: root,
    stdio: "inherit",
  },
);
child.on("error", () => {
  console.error("Could not launch the local mock check.");
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
