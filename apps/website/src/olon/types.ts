import type {
  SectionDataRegistry,
  SectionType,
} from "@olonjs/core/runtime";

import type { AmbassadorProfileData } from "./components/ambassadorProfile/types";
import type { AmbassadorsCarouselData } from "./components/ambassadorsCarousel/types";
import type { AmbassadorsIndexData } from "./components/ambassadorsIndex/types";
import type { AnimalQuestTeaserData } from "./components/animalQuestTeaser/types";
import type { HeroData } from "./components/hero/types";
import type { HowToHelpData } from "./components/howToHelp/types";
import type { MerchData } from "./components/merch/types";
import type { RecentVideosData } from "./components/recentVideos/types";
import type { WhatIsAlveusData } from "./components/whatIsAlveus/types";

// MTRP (spec §1): the tenant augments Core's open SectionDataRegistry so
// SectionType / Section / the registry / schemas are type-checked.
declare module "@olonjs/core/runtime" {
  interface SectionDataRegistry {
    hero: HeroData;
    whatIsAlveus: WhatIsAlveusData;
    ambassadorsCarousel: AmbassadorsCarouselData;
    animalQuestTeaser: AnimalQuestTeaserData;
    merch: MerchData;
    recentVideos: RecentVideosData;
    howToHelp: HowToHelpData;
    ambassadorsIndex: AmbassadorsIndexData;
    ambassadorProfile: AmbassadorProfileData;
  }
}

// Maps each section type to its View props (spec A.2.1).
export type SectionComponentPropsMap = {
  [K in SectionType]: { data: SectionDataRegistry[K] };
};

// Compile-time guard: errors if the MTRP augmentation above did NOT apply
// (i.e. SectionType fell back to `string` instead of the tenant union).
type _AssertTrue<T extends true> = T;
type _AugmentationApplied = _AssertTrue<string extends SectionType ? false : true>;
