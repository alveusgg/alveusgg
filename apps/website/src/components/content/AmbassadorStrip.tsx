import Image from "next/image";
import { type ReactNode } from "react";

import { type AmbassadorImage } from "@alveusgg/data/build/ambassadors/images";

import { classes } from "@/utils/classes";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Section from "@/components/content/Section";

import IconArrowRight from "@/icons/IconArrowRight";

import { ambassadorImageHover } from "@/pages/ambassadors";

export type AmbassadorStripItem = {
  key: string;
  name: string;
  href: string;
  image: AmbassadorImage;
  // Optional short note under the name, e.g. "Featured"
  label?: string;
};

type AmbassadorStripProps = {
  heading: ReactNode;
  headingId?: string;
  items: AmbassadorStripItem[];
  // Secondary action, shown as a link on the heading row
  action?: { label: string; href: string };
  className?: string;
};

// Row of ambassador photo cards with a heading and an optional link, e.g. the
// other ambassadors in the same enclosure
const AmbassadorStrip = ({
  heading,
  headingId,
  items,
  action,
  className,
}: AmbassadorStripProps) => {
  return (
    <Section className={classes("py-8", className)}>
      <div className="mb-5 flex flex-col gap-x-6 gap-y-2 sm:flex-row sm:items-baseline sm:justify-between">
        <Heading level={2} id={headingId} className="my-0 text-2xl">
          {heading}
        </Heading>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1 self-start text-lg sm:self-auto"
          >
            {action.label}
            <IconArrowRight aria-hidden="true" size={16} className="shrink-0" />
          </Link>
        )}
      </div>

      {/* Two per row on phones, fixed-width cards in a wrapping row from sm up */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:flex sm:flex-wrap sm:gap-x-6">
        {items.map((item) => (
          <li key={item.key} className="min-w-0 sm:w-48">
            <Link
              href={item.href}
              custom
              className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-alveus-green-700"
            >
              <div className="overflow-hidden rounded-xl">
                <Image
                  src={item.image.src}
                  alt=""
                  width={400}
                  className={classes(
                    "aspect-4/3 h-auto w-full object-cover",
                    ambassadorImageHover,
                  )}
                  style={{ objectPosition: item.image.position }}
                />
              </div>
              <Heading
                level={3}
                className="mt-2 mb-0 text-2xl wrap-break-word transition-colors group-hover:text-alveus-green-700 group-focus-visible:text-alveus-green-700 motion-reduce:transition-none"
              >
                {item.name}
              </Heading>
              {item.label && (
                <span className="block text-sm font-bold text-alveus-green-700 uppercase">
                  {item.label}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default AmbassadorStrip;
