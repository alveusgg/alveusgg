import { type NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import merchStoreImage from "@/assets/merch/store.png";
import merchGeorgieImage from "@/assets/merch/georgie-plush.jpg";
import merchStompyImage from "@/assets/merch/stompy-plush.jpg";

const merch = [
  {
    store: {
      image: merchStoreImage,
      title: "Merch Store",
      link: "/merch",
    },
  },
  {
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
];

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
        containerClassName="flex flex-wrap items-center"
      >
        {merch.map((items, idx) => (
          <div
            key={idx}
            className="flex basis-full flex-col items-center gap-8 p-4 md:basis-1/2"
          >
            {Object.entries(items).map(([key, item]) => (
              <Link
                key={key}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="group"
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
            ))}
          </div>
        ))}
      </Section>
    </>
  );
};

export default MerchStorePage;
