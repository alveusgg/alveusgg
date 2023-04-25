import { writeFileSync } from "node:fs";
import { join } from "node:path";

import ambassadors from "@alveusgg/data/src/ambassadors/core";

import { camelToKebab } from "../src/utils/string-case";

writeFileSync(
  join(__dirname, "../src/data/ambassador-slugs.json"),
  JSON.stringify(
    Object.keys(ambassadors).map((key) => camelToKebab(key)),
    null,
    2
  )
);
