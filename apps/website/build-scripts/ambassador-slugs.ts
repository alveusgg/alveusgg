import { writeFileSync } from "node:fs";

import { ambassadorKeys } from "../src/data/shared/src/ambassadors/core";
import { camelToKebab } from "../src/utils/string-case";

writeFileSync(
  "ambassador-slugs.json",
  JSON.stringify(ambassadorKeys.map((key) => camelToKebab(key)))
);
