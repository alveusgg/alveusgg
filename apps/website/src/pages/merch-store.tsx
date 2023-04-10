import { type NextPage } from "next";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import React from "react";

import {
  ambassadorEntries,
  type AmbassadorKey,
} from "@alveusgg/data/src/ambassadors/core";
import {
  getAmbassadorMerchImage,
  type AmbassadorImage,
} from "@alveusgg/data/src/ambassadors/images";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import merchStoreImage from "@/assets/merch/store.png";

type MerchItem = {
  image: StaticImageData;
  title: string;
} & ({ link: string } | { soon: string });

type MerchData = {
  store: MerchItem;
  plushies: Partial<{
    [key in AmbassadorKey]: MerchItem;
  }>;
};

const merch: MerchData = {
  store: {
    image: merchStoreImage,
    title: "Merch Store",
    link: "/merch",
  },
  plushies: ambassadorEntries.reduce<MerchData["plushies"]>(
    (acc, [key, ambassador]) =>
      ambassador.plush
        ? {
            ...acc,
            [key]: {
              image: (getAmbassadorMerchImage(key) as AmbassadorImage).src,
              title: `${ambassador.name} Plush`,
              ...("link" in ambassador.plush
                ? { link: ambassador.plush.link }
                : { soon: ambassador.plush.soon }),
            },
          }
        : acc,
    {}
  ),
};

type MerchItemProps = {
  item: MerchItem;
  hideTitle?: boolean;
  className?: string;
};

const MerchItem: React.FC<MerchItemProps> = ({
  item,
  hideTitle = false,
  className = null,
}) => {
  return "link" in item ? (
    <Link
      href={item.link}
      target="_blank"
      rel="noreferrer"
      className={["group block", className].filter(Boolean).join(" ")}
    >
      <Image
        src={item.image}
        width={512}
        alt={hideTitle ? item.title : ""}
        className="h-auto w-full max-w-lg rounded-2xl shadow-xl transition-shadow transition-transform group-hover:scale-105 group-hover:shadow-2xl"
      />
      {!hideTitle && (
        <Heading
          level={2}
          className="mt-4 text-center text-4xl text-alveus-green transition-colors group-hover:text-alveus-green-800"
        >
          {item.title}
        </Heading>
      )}
    </Link>
  ) : (
    <div
      className={["group cursor-pointer", className].filter(Boolean).join(" ")}
    >
      <div className="relative">
        <Image
          src={item.image}
          width={512}
          alt={hideTitle ? item.title : ""}
          className="h-auto w-full max-w-lg rounded-2xl shadow-xl transition-shadow transition-transform group-hover:scale-105 group-hover:shadow-2xl"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-alveus-tan/75 font-bold text-alveus-green-800 opacity-0 transition-all group-hover:scale-105 group-hover:opacity-100">
          <p className="text-3xl">Coming Soon</p>
          <p className="text-2xl">{item.soon}</p>
        </div>
      </div>
      {!hideTitle && (
        <Heading
          level={2}
          className="mb-0 mt-4 text-center text-4xl text-alveus-green transition-colors group-hover:text-alveus-green-800"
        >
          {item.title}
        </Heading>
      )}
    </div>
  );
};

const MerchStorePage: NextPage = () => {
  return (
    <>
      <Meta
        title="Merch"
        description="Grab yourself some Alveus merch, like a hoodie or t-shirt, or check out the Alveus Georgie and Stompy plushies! ALL of the proceeds go directly into Alveus and the support & care of our educational ambassadors!"
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark>
        <Heading>Merch</Heading>
        <p>
          ALL of the proceeds go directly into Alveus and the support & care of
          our educational ambassadors!
        </p>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section
        className="flex-grow"
        containerClassName="flex flex-wrap items-start"
      >
        <div className="flex basis-full flex-wrap justify-center gap-8 p-4 md:basis-1/2 lg:basis-1/3">
          <MerchItem item={merch.store} />
        </div>

        <div className="flex basis-full flex-wrap justify-center md:basis-1/2 lg:basis-2/3">
          {Object.entries(merch.plushies).map(([key, item]) => (
            <div
              key={key}
              className="flex basis-full justify-center p-4 lg:basis-1/2"
            >
              <MerchItem item={item} hideTitle />
            </div>
          ))}
        </div>
      </Section>
    </>
  );
};

export default MerchStorePage;
