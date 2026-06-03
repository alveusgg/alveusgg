import type { FC } from "react";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import { MayaImage } from "@/components/content/Maya";
import Section from "@/components/content/Section";

import type { WhatIsAlveusData } from "./types";

// OlonJS section View — reuses the existing Alveus content components, data from JSON.
export const WhatIsAlveus: FC<{ data: WhatIsAlveusData }> = ({ data }) => (
  <Section dark>
    <div className="flex flex-wrap items-center">
      <div className="basis-full lg:basis-1/2 lg:px-4">
        <Heading level={2} id={data.anchorId ?? "alveus"} link>
          {data.heading}
        </Heading>
        <p className="my-2 font-serif text-lg italic">{data.founder}</p>
        {data.paragraphs.map((paragraph, i) => (
          <p key={i} className="my-4 text-lg">
            {paragraph}
          </p>
        ))}
        <Button href={data.cta.href} dark>
          {data.cta.label}
        </Button>
      </div>
      <div className="basis-full pt-8 lg:basis-1/2 lg:pt-0 lg:pl-8">
        <MayaImage className="mx-auto h-auto w-full max-w-lg lg:ml-0" />
      </div>
    </div>
  </Section>
);
