import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { build } from "esbuild";

const current = dirname(fileURLToPath(import.meta.url));

const script = await build({
  stdin: {
    contents: `import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { ambassadorKeys } from "@alveusgg/data/src/ambassadors/core";
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
