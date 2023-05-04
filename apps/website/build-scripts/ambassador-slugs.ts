import { writeFileSync } from "node:fs";
import { join } from "node:path";

import ambassadors from "@alveusgg/data/src/ambassadors/core";
import { isActiveAmbassadorKey } from "@alveusgg/data/src/ambassadors/filters";

import { camelToKebab } from "../src/utils/string-case";
import { typeSafeObjectKeys } from "../src/utils/helpers";

writeFileSync(
  join(__dirname, "../src/data/ambassador-slugs.json"),
  JSON.stringify(
    // We don't want to generate pages for retired ambassadors
    typeSafeObjectKeys(ambassadors)
      .filter(isActiveAmbassadorKey)
      .map((key) => camelToKebab(key)),
    null,
    2
  )
);
