import Image from "next/image";
import type { FC } from "react";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import MerchCarousel from "@/components/content/MerchCarousel";
import Section from "@/components/content/Section";

import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

import type { MerchData } from "./types";

// Hybrid island: editorial copy from JSON; <MerchCarousel> is the dynamic (API) part,
// kept as a non-OlonJS React component inside the View.
export const Merch: FC<{ data: MerchData }> = ({ data }) => (
  <div className="relative">
    <Image
      src={leafRightImage2}
      alt=""
      className="pointer-events-none absolute -top-44 right-0 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-top-52 2xl:max-w-48"
    />

    <Section containerClassName="space-y-8">
      <div className="grid grid-cols-1 justify-items-start gap-4 lg:grid-cols-2 lg:grid-rows-auto-3">
        <Heading
          level={2}
          id="merch"
          link
          className="my-0 self-baseline lg:col-start-1 lg:row-start-1"
        >
          {data.heading}
        </Heading>

        <div className="space-y-2 lg:col-start-1 lg:row-start-2">
          <p>{data.intro}</p>
        </div>

        <Button
          href={data.merchCta.href}
          external
          className="lg:col-start-1 lg:row-start-3"
        >
          {data.merchCta.label}
        </Button>

        <Heading
          level={3}
          className="my-0 self-baseline text-xl lg:col-start-2 lg:row-start-1"
        >
          {data.plushiesHeading}
        </Heading>

        <div className="space-y-2 lg:col-start-2 lg:row-start-2">
          <p>{data.plushiesIntro}</p>
        </div>

        <Button
          href={data.plushiesCta.href}
          external
          className="lg:col-start-2 lg:row-start-3"
        >
          {data.plushiesCta.label}
        </Button>
      </div>

      <MerchCarousel more />

      <p className="text-center text-alveus-green italic">{data.proceeds}</p>
    </Section>
  </div>
);
