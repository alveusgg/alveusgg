import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import ambassadors from "@alveusgg/data/src/ambassadors/core";
import animalQuest from "@alveusgg/data/src/animal-quest";
import { isActiveAmbassadorKey } from "@alveusgg/data/src/ambassadors/filters";

import { camelToKebab, sentenceToKebab } from "../src/utils/string-case";
import { typeSafeObjectKeys } from "../src/utils/helpers";

mkdirSync(join(__dirname, "../src/data/generated"), { recursive: true });

writeFileSync(
  join(__dirname, "../src/data/generated/ambassador-slugs.json"),
  JSON.stringify(
    // We don't want to generate pages for retired ambassadors
    typeSafeObjectKeys(ambassadors)
      .filter(isActiveAmbassadorKey)
      .map((key) => camelToKebab(key)),
    null,
    2,
  ),
);

writeFileSync(
  join(__dirname, "../src/data/generated/animal-quest-episodes.json"),
  JSON.stringify(
    animalQuest.map((episode, idx) => ({
      slug: sentenceToKebab(episode.edition),
      episode: idx + 1,
    })),
    null,
    2,
  ),
);
