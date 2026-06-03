import Image from "next/image";
import type { FC } from "react";

import ambassadors from "@alveusgg/data/build/ambassadors/core";

import Consent from "@/components/Consent";
import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Slideshow from "@/components/content/Slideshow";
import Twitch from "@/components/content/Twitch";
import WatchLive from "@/components/content/WatchLive";

import momoAppaHeroImage from "@/assets/hero/momo-appa.jpg";
import noodleHeroImage from "@/assets/hero/noodle.jpg";
import pushPopHeroImage from "@/assets/hero/push-pop.jpg";
import serranoJalapenoHeroImage from "@/assets/hero/serrano-jalapeno.jpg";
import studioHeroImage from "@/assets/hero/studio.jpg";
import ticoMileyHeroImage from "@/assets/hero/tico-miley.jpg";
import instituteBuildingHeroImage from "@/assets/institute/hero/building.png";
import instituteWolvesHeroImage from "@/assets/institute/hero/wolves.png";

import type { HeroData } from "./types";

// Fixed presentational assets (kept in the View, per the images-via-imports decision).
const slides = [
  {
    src: pushPopHeroImage,
    alt: ambassadors.pushPop.name,
    className: "object-[25%_50%] lg:object-center",
  },
  { src: studioHeroImage, alt: "Maya in the Alveus studio" },
  {
    src: serranoJalapenoHeroImage,
    alt: `${ambassadors.serrano.name} and ${ambassadors.jalapeno.name}`,
  },
  {
    src: ticoMileyHeroImage,
    alt: `${ambassadors.tico.name} and ${ambassadors.miley.name}`,
    className: "object-bottom",
  },
  { src: noodleHeroImage, alt: ambassadors.noodle.name },
  {
    src: momoAppaHeroImage,
    alt: `${ambassadors.momo.name} and ${ambassadors.appa.name}`,
    className: "object-left lg:object-center",
  },
];

// Editorial text from JSON; slideshow, Twitch embed (dynamic, out of scope) and
// institute artwork are fixed includes to preserve the current hero region.
export const Hero: FC<{ data: HeroData }> = ({ data }) => (
  <div className="relative z-0 flex min-h-[95vh] flex-col lg:-mt-40">
    <div className="absolute inset-0 -z-10 bg-alveus-green">
      <Slideshow images={slides} />
      <div className="absolute inset-0 bg-black/50" />
    </div>

    <div className="container mx-auto grid grow auto-rows-auto grid-cols-1 content-center items-center gap-8 p-4 text-white lg:mt-40 lg:pt-8 lg:pb-16 xl:grid-cols-2 xl:gap-y-16">
      <div>
        <Heading className="text-5xl">{data.heading}</Heading>

        <p className="mt-8 text-xl text-balance">{data.mission}</p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button href={data.primaryCta.href} dark className="backdrop-blur-md">
            {data.primaryCta.label}
          </Button>
          <WatchLive />
        </div>
      </div>

      <div>
        <Consent
          item="live cam feed"
          consent="twitch"
          className="aspect-video h-auto w-full max-w-2xl rounded-2xl data-consent:backdrop-blur-md xl:ml-auto"
        >
          <Link
            href="/live"
            external
            custom
            className="block size-full rounded-2xl shadow-xl transition hover:scale-102 hover:shadow-2xl"
          >
            <Twitch
              channel={data.twitchChannel}
              muted
              className="pointer-events-none rounded-2xl select-none"
            />
          </Link>
        </Consent>
      </div>

      <Box
        dark
        className="col-span-full flex flex-col gap-x-4 gap-y-8 rounded-2xl bg-alveus-green-900/25 backdrop-blur-sm lg:flex-row"
      >
        <div className="flex grow flex-col items-start gap-4">
          <Heading level={2} className="my-0 text-balance">
            {data.institute.heading}
          </Heading>

          <p className="text-lg text-balance">{data.institute.body}</p>

          <div className="flex flex-wrap gap-4">
            {data.institute.ctas.map((cta) => (
              <Button key={cta.href} href={cta.href} dark>
                {cta.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="z-0 flex items-center justify-center self-center lg:max-w-lg">
          <Image
            src={instituteBuildingHeroImage}
            width={300}
            alt="Drawing of the Alveus Research & Recovery Institute building"
            className="z-10 mr-[-10%] h-auto w-2/5 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
          />
          <Image
            src={instituteWolvesHeroImage}
            width={400}
            alt="Drawing of released wolves walking through the landscape"
            className="h-auto w-3/5 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
          />
        </div>
      </Box>
    </div>
  </div>
);
