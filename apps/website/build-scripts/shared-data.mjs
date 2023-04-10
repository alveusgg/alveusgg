import { access, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import { runInNewContext } from "node:vm";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { build } from "esbuild";

const shared = fileURLToPath(new URL("../src/data/shared", import.meta.url));
const current = dirname(fileURLToPath(import.meta.url));

if (
  await access(shared)
    .then(() => true)
    .catch(() => false)
)
  await rm(shared, { recursive: true });

console.log(
  await new Promise((resolve, reject) =>
    exec(
      `git clone --depth 1 --single-branch https://github.com/alveusgg/data ${shared}`,
      (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
      }
    )
  )
);

const script = await build({
  stdin: {
    contents: `const { writeFileSync } = require("node:fs");
const { join } = require("node:path");

import { ambassadorKeys } from "../src/data/shared/src/ambassadors/core";
import { camelToKebab } from "../src/utils/string-case";

writeFileSync(
  join(__dirname, "../src/data/ambassador-slugs.json"),
  JSON.stringify(ambassadorKeys.map(key => camelToKebab(key))),
);`,
    resolveDir: current,
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  write: false,
});

runInNewContext(script.outputFiles[0].text, {
  require: createRequire(import.meta.url),
  __dirname: current,
});
