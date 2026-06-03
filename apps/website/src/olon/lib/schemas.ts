import type { SectionType } from "@olonjs/core/runtime";

import { ambassadorProfileSchema } from "@/olon/components/ambassadorProfile";
import { ambassadorsCarouselSchema } from "@/olon/components/ambassadorsCarousel";
import { ambassadorsIndexSchema } from "@/olon/components/ambassadorsIndex";
import { animalQuestTeaserSchema } from "@/olon/components/animalQuestTeaser";
import { heroSchema } from "@/olon/components/hero";
import { howToHelpSchema } from "@/olon/components/howToHelp";
import { merchSchema } from "@/olon/components/merch";
import { recentVideosSchema } from "@/olon/components/recentVideos";
import { whatIsAlveusSchema } from "@/olon/components/whatIsAlveus";

import type { SectionComponentPropsMap } from "@/olon/types";

// Force-load the MTRP augmentation so SectionType resolves to the tenant union.
type _LoadAugmentation = SectionComponentPropsMap;

// SECTION_SCHEMAS (spec A.3): one zod-4 schema per section type, keyed by SectionType.
// `satisfies Record<SectionType, ...>` enforces 1:1 coverage at compile time.
export const SECTION_SCHEMAS = {
  hero: heroSchema,
  whatIsAlveus: whatIsAlveusSchema,
  ambassadorsCarousel: ambassadorsCarouselSchema,
  animalQuestTeaser: animalQuestTeaserSchema,
  merch: merchSchema,
  recentVideos: recentVideosSchema,
  howToHelp: howToHelpSchema,
  ambassadorsIndex: ambassadorsIndexSchema,
  ambassadorProfile: ambassadorProfileSchema,
} satisfies Record<SectionType, { parse: (v: unknown) => unknown }>;
