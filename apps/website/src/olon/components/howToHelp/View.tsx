import type { FC } from "react";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Section from "@/components/content/Section";

import IconAmazon from "@/icons/IconAmazon";
import IconBox from "@/icons/IconBox";
import IconDollar from "@/icons/IconDollar";

import type { HowToHelpData } from "./types";

const icons = { dollar: IconDollar, amazon: IconAmazon, box: IconBox };

// Icons are resolved from a key map (icons can't live in JSON).
export const HowToHelp: FC<{ data: HowToHelpData }> = ({ data }) => (
  <Section dark className="grow bg-alveus-green-900">
    <Heading level={2} id={data.anchorId ?? "help"} link className="text-center">
      {data.heading}
    </Heading>

    <div className="mt-8 flex flex-wrap items-center justify-evenly gap-8">
      {data.items.map((item) => {
        const Icon = icons[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            external={item.external}
            custom
            className="group flex items-center gap-4"
          >
            <div className="rounded-2xl bg-alveus-tan p-3 text-alveus-green transition-colors group-hover:bg-alveus-green group-hover:text-alveus-tan">
              {Icon ? <Icon size={24} /> : null}
            </div>
            <p className="font-serif text-2xl font-bold text-alveus-tan transition-colors group-hover:text-alveus-green-500">
              {item.title}
            </p>
          </Link>
        );
      })}
    </div>
  </Section>
);
