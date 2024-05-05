import Image from "next/image";

import ambassadors from "@alveusgg/data/src/ambassadors/core";
import { isActiveAmbassadorKey } from "@alveusgg/data/src/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/src/ambassadors/images";

import { camelToKebab } from "@/utils/string-case";

import { ambassadorImageHover } from "@/pages/ambassadors";

import Carousel from "@/components/content/Carousel";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Section from "@/components/content/Section";

export const activities = (
  [
    { key: "abbott", ambassador: ambassadors.abbott, activity: "Ring toss" },
    {
      key: "barbaraBakedBean",
      ambassador: ambassadors.barbaraBakedBean,
      activity: "Roach race",
    },
    {
      key: "winnieTheMoo",
      ambassador: ambassadors.winnieTheMoo,
      activity: "Grain eating contest",
    },
    {
      key: "nillaWafer",
      ambassador: ambassadors.nillaWafer,
      activity: "Haunted maze",
    },
    {
      key: "chipsAhoy",
      ambassador: ambassadors.chipsAhoy,
      activity: "Haunted maze",
    },
  ] as const
)
  .filter(({ key }) => isActiveAmbassadorKey(key))
  .reduce((obj, { key, ambassador, activity }) => {
    const images = getAmbassadorImages(key);
    return {
      // biome-ignore lint/performance/noAccumulatingSpread
      ...obj,
      [key]: (
        <Link
          href={`/ambassadors/${camelToKebab(key)}`}
          draggable={false}
          className="group text-center transition-colors hover:text-alveus-green-200"
          custom
        >
          <Heading level={3} className="mb-0 mt-4 text-2xl">
            {activity}
          </Heading>
          <p className="mt-1">with {ambassador.name}</p>
          <Image
            src={images[0].src}
            alt={images[0].alt}
            draggable={false}
            width={430}
            className={`mx-auto mt-4 aspect-video h-auto w-full max-w-2/3 rounded-2xl object-cover ${ambassadorImageHover}`}
            style={{ objectPosition: images[0].position }}
          />
          <p className="mt-2 text-sm">{ambassador.story}</p>
          <p className="mt-2 text-sm">{ambassador.mission}</p>
        </Link>
      ),
    };
  }, {});

export function Activities() {
  return (
    <Section dark className="bg-fall">
      {Object.keys(activities).length > 0 && (
        <>
          <Heading level={2} className="mb-8 mt-0" id="activities" link>
            Planned activities with the ambassadors
          </Heading>
          <Carousel
            items={activities}
            auto={10000}
            className="mb-16 mt-4"
            itemClassName="basis-full sm:basis-1/2 md:basis-full lg:basis-1/3 xl:basis-1/4 p-4"
          />
        </>
      )}
    </Section>
  );
}
