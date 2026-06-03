import type { SectionType } from "@olonjs/core/runtime";
import type { FC } from "react";

import { AmbassadorProfile } from "@/olon/components/ambassadorProfile";
import { AmbassadorsCarousel } from "@/olon/components/ambassadorsCarousel";
import { AmbassadorsIndex } from "@/olon/components/ambassadorsIndex";
import { AnimalQuestTeaser } from "@/olon/components/animalQuestTeaser";
import { Hero } from "@/olon/components/hero";
import { HowToHelp } from "@/olon/components/howToHelp";
import { Merch } from "@/olon/components/merch";
import { RecentVideos } from "@/olon/components/recentVideos";
import { WhatIsAlveus } from "@/olon/components/whatIsAlveus";

import type { SectionComponentPropsMap } from "@/olon/types";

// ComponentRegistry (spec A.2.2): typed 1:1 against SectionType.
export const ComponentRegistry: {
  [K in SectionType]: FC<SectionComponentPropsMap[K]>;
} = {
  hero: Hero,
  whatIsAlveus: WhatIsAlveus,
  ambassadorsCarousel: AmbassadorsCarousel,
  animalQuestTeaser: AnimalQuestTeaser,
  merch: Merch,
  recentVideos: RecentVideos,
  howToHelp: HowToHelp,
  ambassadorsIndex: AmbassadorsIndex,
  ambassadorProfile: AmbassadorProfile,
};
