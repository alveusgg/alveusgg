import { type NextPage } from "next";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import ambassadors from "@alveusgg/data/build/ambassadors/core";
import {
  type ActiveAmbassadorKey,
  isActiveAmbassadorKey,
} from "@alveusgg/data/build/ambassadors/filters";
import {
  getAmbassadorBadgeImage,
  getAmbassadorEmoteImage,
  getAmbassadorIconImage,
} from "@alveusgg/data/build/ambassadors/images";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";

import { classes } from "@/utils/classes";
import { typeSafeObjectKeys } from "@/utils/helpers";
import { camelToKebab } from "@/utils/string-case";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

import IconArrowRight from "@/icons/IconArrowRight";

import showAndTellPeepo from "@/assets/show-and-tell/peepo.png";

const useRandomAmbassador = () => {
  const [key, setKey] = useState<ActiveAmbassadorKey | null>(null);
  const pick = useCallback(() => {
    const keys = typeSafeObjectKeys(ambassadors).filter(isActiveAmbassadorKey);
    const randomIndex = Math.floor(Math.random() * keys.length);
    setKey(keys[randomIndex]!);
  }, []);
  useEffect(() => {
    pick();
  }, [pick]);

  return useMemo(() => {
    if (!key) return {};

    const ambassador = ambassadors[key];
    const species = getSpecies(ambassador.species);
    const icon =
      getAmbassadorIconImage(key) ??
      getAmbassadorBadgeImage(key) ??
      getAmbassadorEmoteImage(key);

    return {
      slug: camelToKebab(key),
      ambassador,
      species,
      icon,
      pick,
    };
  }, [key, pick]);
};

const CustomLink = ({
  children,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "custom">) => (
  <Link
    {...props}
    custom
    className="group py-1 text-lg text-alveus-green transition-colors text-shadow-sm hover:text-alveus-green-900 hover:underline"
  >
    {children}
    <IconArrowRight className="mr-8 -ml-4 inline-block size-4 opacity-0 drop-shadow-sm transition-[margin,opacity] group-hover:mr-3 group-hover:ml-1 group-hover:opacity-100" />
  </Link>
);

const NotFound: NextPage = () => {
  const { slug, ambassador, species, icon, pick } = useRandomAmbassador();

  return (
    <>
      <Meta
        title="404 - Page Not Found"
        description="The page you are looking could not be found."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="text-center">404 - Page Not Found</Heading>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section
        className="grow pt-12"
        containerClassName="grid grid-cols-1 gap-8 lg:grid-cols-2"
      >
        <div>
          {/* Align the heading height for the two columns */}
          <p className="text-sm">&zwnj;</p>

          <Heading level={-1} className="mt-0">
            Oops!
          </Heading>

          <p className="mb-6 text-lg text-balance">
            Sorry, the page you are looking for does not exist. It may have been
            removed, or you may have mistyped the URL.
          </p>

          <p className="mb-2 text-sm text-balance text-alveus-green">
            Here are some links to help you find what you&apos;re looking for:
          </p>

          <ul className="flex flex-wrap max-md:flex-col">
            <li>
              <CustomLink href="/">Home</CustomLink>
            </li>
            <li>
              <CustomLink href="/live">Watch Live Cams</CustomLink>
            </li>
            <li>
              <CustomLink href="/ambassadors">Meet our Ambassadors</CustomLink>
            </li>
            <li>
              <CustomLink href="/animal-quest">Watch Animal Quest</CustomLink>
            </li>
            <li>
              <CustomLink href="/updates">Check the Schedule</CustomLink>
            </li>
            <li>
              <CustomLink href="/donate">Donate to Alveus</CustomLink>
            </li>
            <li>
              <CustomLink href="/about">About Alveus</CustomLink>
            </li>
          </ul>
        </div>

        {ambassador && species && (
          <div>
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm">While you&apos;re here...</p>

                <Heading level={-1} className="my-0">
                  Meet {ambassador.name}!
                </Heading>

                <p className="text-sm text-alveus-green">
                  {species.name} ({species.scientificName})
                </p>
              </div>

              <Image
                src={(icon ?? showAndTellPeepo).src}
                alt=""
                width={100}
                height={100}
                className={classes(
                  "-mt-2 h-24 w-auto cursor-pointer drop-shadow-lg",
                  !icon && "opacity-50",
                )}
                onClick={pick}
                title="Click to meet another ambassador"
              />
            </div>

            <p>
              {ambassador.story} {ambassador.mission}
            </p>

            <p className="mt-4">
              <CustomLink href={`/ambassadors/${slug}`}>
                Learn more about {ambassador.name}
              </CustomLink>
            </p>
          </div>
        )}
      </Section>
    </>
  );
};

export default NotFound;
