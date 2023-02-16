import { type NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import React from "react"
import Section from "../components/content/Section"
import Heading from "../components/content/Heading"
import merchStoreImage from "../assets/merch/store.png"
import merchGeorgieImage from "../assets/merch/georgie-plush.jpg"
import merchStompyImage from "../assets/merch/stompy-plush.jpg"

const merch = [
  {
    store: {
      image: merchStoreImage,
      title: "Merch Store",
      link: "https://merch.streamelements.com/alveussanctuary",
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
      <Head>
        <title>Merch | Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      <Section dark>
        <Heading>Merch</Heading>
        <p>ALL of the proceeds go directly into Alveus and the support & care of our educational ambassadors!</p>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow" containerClassName="flex flex-wrap items-center">
        {merch.map((items, idx) => (
          <div key={idx} className="basis-full md:basis-1/2 p-4 flex flex-col items-center gap-8">
            {Object.entries(items).map(([ key, item ]) => (
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
                  className="max-w-lg w-full h-auto rounded-2xl shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-shadow transition-transform"
                />
                <Heading
                  level={2}
                  className="mt-4 text-4xl text-center text-alveus-green group-hover:text-alveus-green-800 transition-colors"
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
