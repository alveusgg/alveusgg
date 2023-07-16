import { type NextPage } from "next";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import React from "react";

import ambassadors from "@alveusgg/data/src/ambassadors/core";
import {
  isAmbassadorWithPlushKey,
  type AmbassadorWithPlushKey,
  type AmbassadorWithPlush,
  isActiveAmbassadorKey,
  type ActiveAmbassadors,
  type ActiveAmbassador,
} from "@alveusgg/data/src/ambassadors/filters";
import { getAmbassadorMerchImage } from "@alveusgg/data/src/ambassadors/images";

import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";
import { classes } from "@/utils/classes";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Merch from "@/components/content/Merch";

import merchStoreImage from "@/assets/merch/store.png";

type MerchItem = {
  image: StaticImageData;
  title: string;
} & ({ link: string } | { soon: string });

type MerchData = {
  store: MerchItem;
  plushies: {
    [key in AmbassadorWithPlushKey<ActiveAmbassadors>]: MerchItem;
  };
};

const merch: MerchData = {
  store: {
    image: merchStoreImage,
    title: "Merch Store",
    link: "/merch",
  },
  plushies: typeSafeObjectFromEntries(
    (
      typeSafeObjectEntries(ambassadors).filter(
        ([key]) => isActiveAmbassadorKey(key) && isAmbassadorWithPlushKey(key)
      ) as [
        AmbassadorWithPlushKey<ActiveAmbassadors>,
        AmbassadorWithPlush<ActiveAmbassador>
      ][]
    ).map(([key, ambassador]) => [
      key,
      {
        image: getAmbassadorMerchImage(key).src,
        title: `${ambassador.name} Plush`,
        ...("link" in ambassador.plush
          ? { link: ambassador.plush.link }
          : { soon: ambassador.plush.soon }),
      },
    ])
  ),
};

type MerchItemProps = {
  item: MerchItem;
  className?: string;
};

const MerchItem: React.FC<MerchItemProps> = ({ item, className = null }) => {
  return "link" in item ? (
    <Link
      href={item.link}
      target="_blank"
      rel="noreferrer"
      className={classes("group block", className)}
      title={item.title}
    >
      <Image
        src={item.image}
        width={512}
        alt={item.title}
        className="h-auto w-full max-w-lg rounded-2xl shadow-xl transition group-hover:scale-102 group-hover:shadow-2xl"
      />
    </Link>
  ) : (
    <div className={classes("group cursor-pointer", className)}>
      <div className="relative">
        <Image
          src={item.image}
          width={512}
          alt={item.title}
          className="h-auto w-full max-w-lg rounded-2xl shadow-xl transition group-hover:scale-102 group-hover:shadow-2xl"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-alveus-tan/75 font-bold text-alveus-green-800 opacity-0 transition group-hover:scale-102 group-hover:opacity-100">
          <p className="text-3xl">Coming Soon</p>
          <p className="text-2xl">{item.soon}</p>
        </div>
      </div>
    </div>
  );
};

const MerchStorePage: NextPage = () => {
  return (
    <>
      <Meta
        title="Merch"
        description="Grab yourself some Alveus merch, like a hoodie or t-shirt, or check out the Alveus ambassador plushies! All proceeds go directly into Alveus and the support & care of our educational ambassadors!"
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark>
        <Heading>Merch</Heading>
        <p>
          All proceeds go directly into Alveus and the support & care of our
          educational ambassadors!
        </p>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section
        className="flex-grow"
        containerClassName="flex flex-wrap items-start"
      >
        <div className="flex basis-full flex-wrap">
          <div className="flex basis-full flex-wrap justify-center gap-8 p-4 md:basis-1/2 lg:basis-1/3">
            <MerchItem item={merch.store} />
          </div>

          <div className="flex basis-full flex-col justify-evenly p-4 md:basis-1/2 lg:basis-2/3">
            <Merch />

            <div className="flex flex-wrap items-center justify-evenly gap-4">
              <p className="text-center text-lg text-alveus-green-800">
                Grab yourself a high-quality t-shirt or hoodie to support
                Alveus.
              </p>
              <Link
                className="inline-block rounded-full border-2 border-alveus-green bg-alveus-green px-6 py-3 text-xl text-alveus-tan transition-colors hover:bg-alveus-tan hover:text-alveus-green"
                href="/merch"
                target="_blank"
                rel="noreferrer"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        <div className="flex basis-full flex-wrap justify-center">
          {Object.entries(merch.plushies).map(([key, item]) => (
            <div
              key={key}
              className="flex basis-full justify-center p-4 md:basis-1/2 lg:basis-1/3"
            >
              <MerchItem item={item} />
            </div>
          ))}
        </div>
      </Section>
    </>
  );
};

export default MerchStorePage;
