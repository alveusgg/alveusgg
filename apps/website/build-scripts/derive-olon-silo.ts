import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

import {
  getClassification,
  sortAmbassadorClassification,
} from "@alveusgg/data/build/ambassadors/classification";
import ambassadors from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorEntry } from "@alveusgg/data/build/ambassadors/filters";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";
import enclosures from "@alveusgg/data/build/enclosures";

import slugify from "slugify";

const camelToKebab = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

const convertToSlug = (str: string) =>
  slugify(str, {
    replacement: "-",
    lower: true,
    locale: "en",
    trim: true,
    strict: true,
  });

const HOME_PATH = "src/data/pages/home.json";
const AMBASSADORS_PATH = "src/data/pages/ambassadors.json";
const PROFILE_DIR = "src/data/pages/ambassadors";

// Dev-only fallback for the Recent Videos section (NOT derived from @alveusgg/data;
// these are real Alveus uploads fetched once from the channels' public YouTube RSS).
// The capsule View renders them only when the live fetch returns nothing AND
// NODE_ENV !== "production". Refresh occasionally if they go stale.
const RECENT_VIDEOS_FALLBACK = [
  { id: "o7IynC7lFFg", title: "Winnie + Donkeys Vet Visit Recap", published: "2026-06-01T15:00:37+00:00", author: { name: "Alveus Highlights", uri: "https://www.youtube.com/@AlveusSanctuaryHighlights" } },
  { id: "Alxq5nYFWxQ", title: "Intro To Vet Care with Kayla and Connor!", published: "2026-06-01T14:00:19+00:00", author: { name: "Alveus Highlights", uri: "https://www.youtube.com/@AlveusSanctuaryHighlights" } },
  { id: "UmyFQM4v-F4", title: "LEAKING PLANS FOR OUR NEW INSTITUTE", published: "2026-06-01T13:00:01+00:00", author: { name: "Alveus Highlights", uri: "https://www.youtube.com/@AlveusSanctuaryHighlights" } },
  { id: "Wy55RyazDR8", title: "How Alveus Videos Are Made", published: "2026-05-28T21:46:34+00:00", author: { name: "Alveus Highlights", uri: "https://www.youtube.com/@AlveusSanctuaryHighlights" } },
];

const featured = Object.entries(ambassadors)
  .filter(([, a]) => Boolean(a.homepage))
  .map(([key, a]) => ({ key, title: a.homepage?.title ?? a.name, description: a.homepage?.description ?? "" }));
const home = JSON.parse(readFileSync(HOME_PATH, "utf8"));
const carousel = home.sections.find((s: { type: string }) => s.type === "ambassadorsCarousel");
if (!carousel) throw new Error("ambassadorsCarousel section not found in home.json");
carousel.data.featured = featured;
const recentVideos = home.sections.find((s: { type: string }) => s.type === "recentVideos");
if (!recentVideos) throw new Error("recentVideos section not found in home.json");
recentVideos.data.videos = RECENT_VIDEOS_FALLBACK;
writeFileSync(HOME_PATH, JSON.stringify(home, null, 2) + "\n");

const activeEntries = Object.entries(ambassadors).filter((entry) =>
  isActiveAmbassadorEntry(entry as Parameters<typeof isActiveAmbassadorEntry>[0]),
);
// Rank taxonomic classes with the same comparator the live page uses, so each
// item can carry a numeric `order` and the View sorts purely from the JSON.
const classOrder = new Map(
  [...new Set(activeEntries.map(([, a]) => getSpecies(a.species).class))]
    .sort(sortAmbassadorClassification)
    .map((cls, i) => [cls, i] as const),
);
const items = activeEntries.map(([key, a]) => {
  const species = getSpecies(a.species);
  const classificationName = getClassification(species.class);
  return {
    key,
    name: a.name,
    species: species.name,
    classification: {
      slug: convertToSlug(classificationName),
      name: classificationName,
      order: classOrder.get(species.class) ?? 0,
    },
    enclosure: {
      slug: camelToKebab(a.enclosure),
      name: enclosures[a.enclosure].name,
    },
    arrival: a.arrival ?? null,
  };
});
const ambassadorsPage = {
  id: "ambassadors",
  slug: "ambassadors",
  meta: { title: "Ambassadors", description: "Each and every ambassador at Alveus plays an important role as a representative of their species, sharing unique stories about conservation and consumer choice." },
  sections: [{ id: "ambassadors-index", type: "ambassadorsIndex", data: {
    heading: "Alveus Ambassadors",
    intro: "Each and every ambassador at Alveus plays an important role as a representative of their species, sharing unique stories about conservation and consumer choice. Our non-releasable animal ambassadors are not pets — they help educate our audience, inspire conservation efforts, and foster a deeper connection with their species.",
    items,
  } }],
};
writeFileSync(AMBASSADORS_PATH, JSON.stringify(ambassadorsPage, null, 2) + "\n");

mkdirSync(PROFILE_DIR, { recursive: true });
let profileCount = 0;
for (const [key, a] of Object.entries(ambassadors)) {
  const slug = camelToKebab(key);
  const page = {
    id: key,
    slug: `ambassadors/${slug}`,
    meta: { title: `${a.name} | Ambassadors`, description: a.story.replace(/\n+/g, " ").slice(0, 200) },
    sections: [{ id: "profile", type: "ambassadorProfile", data: {
      key,
      name: a.name,
      alternate: a.alternate ?? [],
      story: a.story,
      mission: a.mission,
      fact: (a as { fact?: string }).fact ?? null,
    } }],
  };
  writeFileSync(`${PROFILE_DIR}/${slug}.json`, JSON.stringify(page, null, 2) + "\n");
  profileCount++;
}
console.log(`Derived ${featured.length} featured + ${items.length} active + ${profileCount} profiles`);
