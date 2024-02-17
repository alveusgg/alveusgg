import { mkdirSync, writeFileSync } from "node:fs";

import ambassadors from "@alveusgg/data/src/ambassadors/core";
import animalQuest from "@alveusgg/data/src/animal-quest";
import { isActiveAmbassadorKey } from "@alveusgg/data/src/ambassadors/filters";

import { camelToKebab, sentenceToKebab } from "../src/utils/string-case";
import { typeSafeObjectKeys } from "../src/utils/helpers";

mkdirSync(new URL("../src/data/generated", import.meta.url), {
  recursive: true,
});

writeFileSync(
  new URL("../src/data/generated/ambassador-slugs.json", import.meta.url),
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
  new URL("../src/data/generated/animal-quest-episodes.json", import.meta.url),
  JSON.stringify(
    animalQuest.map((episode, idx) => ({
      slug: sentenceToKebab(episode.edition),
      episode: idx + 1,
    })),
    null,
    2,
  ),
);
