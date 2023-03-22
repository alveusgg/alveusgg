import { type NextPage } from "next";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import merchStoreImage from "@/assets/merch/store.png";
import merchWinnieImage from "@/assets/merch/winnie-plush.png";
import merchGeorgieImage from "@/assets/merch/georgie-plush.jpg";
import merchStompyImage from "@/assets/merch/stompy-plush.jpg";

type MerchItem = {
  image: StaticImageData;
  title: string;
} & ({ link: string } | { soon: string });

const merch: { store: MerchItem; plushies: Record<string, MerchItem> } = {
  store: {
    image: merchStoreImage,
    title: "Merch Store",
    link: "/merch",
  },
  plushies: {
    winniePlush: {
      image: merchWinnieImage,
      title: "Winnie Plush",
      link: "https://youtooz.com/products/winnie-plush-9-inch",
    },
    georgiePlush: {
      image: merchGeorgieImage,
      title: "Georgie Plush",
      link: "https://youtooz.com/products/georgie-plush-9-inch",
    },
    stompyPlush: {
      image: merchStompyImage,
      title: "Stompy Plush",
      link: "https://youtooz.com/products/stompy-plush-9-inch",
    },
  },
};

type MerchItemProps = {
  item: MerchItem;
  className?: string;
};

const MerchItem: React.FC<MerchItemProps> = ({ item, className }) => {
  return "link" in item ? (
    <Link
      href={item.link}
      target="_blank"
      rel="noreferrer"
      className={["group block", className].filter(Boolean).join(" ")}
    >
      <Image
        src={item.image}
        alt=""
        className="h-auto w-full max-w-lg rounded-2xl shadow-xl transition-shadow transition-transform group-hover:scale-105 group-hover:shadow-2xl"
      />
      <Heading
        level={2}
        className="mt-4 text-center text-4xl text-alveus-green transition-colors group-hover:text-alveus-green-800"
      >
        {item.title}
      </Heading>
    </Link>
  ) : (
    <div
      className={["group cursor-pointer", className].filter(Boolean).join(" ")}
    >
      <div className="relative">
        <Image
          src={item.image}
          alt=""
          className="h-auto w-full max-w-lg rounded-2xl shadow-xl transition-shadow transition-transform group-hover:scale-105 group-hover:shadow-2xl"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-alveus-tan/75 font-bold text-alveus-green-800 opacity-0 transition-all group-hover:scale-105 group-hover:opacity-100">
          <p className="text-3xl">Coming Soon</p>
          <p className="text-2xl">{item.soon}</p>
        </div>
      </div>
      <Heading
        level={2}
        className="mt-4 mb-0 text-center text-4xl text-alveus-green transition-colors group-hover:text-alveus-green-800"
      >
        {item.title}
      </Heading>
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
        <div className="flex basis-full flex-wrap justify-center gap-8 px-4 py-2 md:basis-1/2 lg:basis-1/3">
          <MerchItem item={merch.store} />
        </div>

        <div className="flex basis-full flex-wrap justify-center md:basis-1/2 lg:basis-2/3">
          {Object.entries(merch.plushies).map(([key, item]) => (
            <div
              key={key}
              className="flex basis-full justify-center px-4 py-2 lg:basis-1/2"
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
