import type { NextPage } from "next";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";

import Heading from "@/components/content/Heading";
import Slideshow from "@/components/content/Slideshow";
import Section from "@/components/content/Section";
import Carousel from "@/components/content/Carousel";
import { Lightbox } from "@/components/content/YouTube";
import IconAmazon from "@/icons/IconAmazon";
import IconPayPal from "@/icons/IconPayPal";
import IconEmail from "@/icons/IconEmail";
import ambassadors from "@/config/ambassadors";
import { camelToKebab } from "@/utils/string-case";

import mayaImage from "@/assets/maya.png";
import sirenHeroImage from "@/assets/hero/siren.png";
import mileyHeroImage from "@/assets/hero/miley.png";
import ticoHeroImage from "@/assets/hero/tico.png";
import miaHeroImage from "@/assets/hero/mia.png";
import noodleHeroImage from "@/assets/hero/noodle.png";
import nuggetHeroImage from "@/assets/hero/nugget.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import caseMerchImage from "@/assets/merch/biodegradable-iphone-case-iphone-11-pro-max-case-on-phone.png";
import toteMerchImage from "@/assets/merch/large-eco-tote-oyster-front.png";
import tshirtMerchImage from "@/assets/merch/organic-cotton-t-shirt-dress-black-front.png";
import croptopMerchImage from "@/assets/merch/organic-crop-top-black-front.png";
import beanieMerchImage from "@/assets/merch/organic-ribbed-beanie-black-front.png";
import hoodieMerchImage from "@/assets/merch/unisex-essential-eco-hoodie-white-front.png";

const slides = [
  {
    src: sirenHeroImage,
    alt: "Siren",
  },
  {
    src: mileyHeroImage,
    alt: "Miley",
  },
  {
    src: ticoHeroImage,
    alt: "Tico",
  },
  {
    src: miaHeroImage,
    alt: "Mia",
  },
  {
    src: noodleHeroImage,
    alt: "Noodle",
  },
  {
    src: nuggetHeroImage,
    alt: "Nugget",
  },
];

const featuredAmbassadors = Object.entries(ambassadors)
  .filter(([, { homepage }]) => !!homepage)
  .reduce(
    (obj, [key, { images, homepage }]) => ({
      ...obj,
      [key]: (
        <Link
          href={`/ambassadors/${camelToKebab(key)}`}
          draggable={false}
          className="transition-colors hover:text-alveus-green"
        >
          <Image
            src={images[0].src}
            alt={images[0].alt}
            draggable={false}
            width={200}
            className="mx-auto aspect-square h-auto w-full max-w-[10rem] rounded-xl object-cover"
          />
          <Heading level={3} className="text-center text-xl">
            {homepage?.title}
          </Heading>
          <p className="text-center">{homepage?.description}</p>
        </Link>
      ),
    }),
    {}
  );

const merch = Object.entries({
  hoodie: {
    src: hoodieMerchImage,
    alt: "Unisex Essential Echo Hoodie (White)",
  },
  case: {
    src: caseMerchImage,
    alt: "Biodegradable iPhone Case (iPhone 11 Pro Max)",
  },
  tshirt: {
    src: tshirtMerchImage,
    alt: "Organic Cotton T-Shirt Dress (Black)",
  },
  croptop: {
    src: croptopMerchImage,
    alt: "Organic Crop Top (Black)",
  },
  tote: {
    src: toteMerchImage,
    alt: "Large Eco Tote (Oyster)",
  },
  beanie: {
    src: beanieMerchImage,
    alt: "Organic Ribbed Beanie (Black)",
  },
}).reduce(
  (obj, [key, { src, alt }]) => ({
    ...obj,
    [key]: (
      <Image
        src={src}
        alt={alt}
        draggable={false}
        width={200}
        className="mx-auto h-auto w-full max-w-[10rem]"
      />
    ),
  }),
  {}
);

const help = {
  donate: {
    icon: IconPayPal,
    title: "Donate via PayPal",
    link: "/paypal",
    external: true,
  },
  amazon: {
    icon: IconAmazon,
    title: "Amazon Wishlist",
    link: "/wishlist",
    external: true,
  },
  contact: {
    icon: IconEmail,
    title: "Offer Help",
    link: "/contact-us",
    external: false,
  },
};

const Home: NextPage = () => {
  const twitchEmbedId = useId();
  const twitchEmbedRef = useRef<HTMLDivElement>(null);
  const [twitchEmbedLoaded, setTwitchEmbedLoaded] = useState(false);
  const [twitchEmbedPlaying, setTwitchEmbedPlaying] = useState(false);
  useEffect(() => {
    if (!twitchEmbedLoaded || typeof Twitch === "undefined") {
      if (typeof Twitch !== "undefined") setTwitchEmbedLoaded(true);
      return;
    }
    if (!twitchEmbedRef.current) return;

    // Reset the embed (fixes dev hot reload)
    twitchEmbedRef.current.innerHTML = "";

    // Load the embed from Twitch
    // https://dev.twitch.tv/docs/embed/everything
    const embed = new Twitch.Embed(`twitch-embed-${twitchEmbedId}`, {
      width: "100%",
      height: "100%",
      channel: "alveussanctuary",
      layout: "video",
      allowfullscreen: false,
      autoplay: true,
      muted: true,
    });

    // Track when playing, as we disable pointer events on the embed
    embed.addEventListener(Twitch.Embed.VIDEO_PLAY, () => {
      const player = embed.getPlayer();
      console.log("The video is playing", player);
      setTwitchEmbedPlaying(true);
    });
  }, [twitchEmbedId, twitchEmbedLoaded]);

  return (
    <>
      {/* Hero, offset to be navbar background */}
      <div className="relative z-0 flex min-h-[95vh] flex-col lg:-mt-40">
        <div className="absolute inset-0 -z-10 bg-alveus-green">
          <Slideshow images={slides} />
          <div className="absolute inset-0 bg-black opacity-50" />
        </div>

        <div className="container mx-auto flex flex-grow flex-wrap items-center text-white lg:pt-40">
          <div className="basis-full p-4 lg:basis-1/2">
            <Heading className="text-5xl">
              Educating the <br className="hidden md:block" />
              World from the Web
            </Heading>

            <p className="mt-8 text-lg">
              Alveus is a virtual education center following the journeys of our
              non-releasable exotic ambassadors, aiming to educate and spark an
              appreciation for them and their wild counterparts.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                className="inline-block rounded-full border-2 border-white px-4 py-2 text-lg transition-colors hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
                href="/ambassadors"
              >
                Meet the Ambassadors
              </Link>
              <Link
                className="inline-block rounded-full border-2 border-white px-4 py-2 text-lg transition-colors hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
                href="/live"
              >
                Watch Live
              </Link>
            </div>
          </div>

          <div className="basis-full p-4 lg:basis-1/2">
            <Link
              className="block rounded-2xl shadow-xl transition-shadow hover:shadow-2xl"
              href="/live"
            >
              <div
                className={`aspect-video h-auto w-full overflow-clip rounded-2xl ${
                  twitchEmbedPlaying ? "pointer-events-none" : ""
                }`}
                id={`twitch-embed-${twitchEmbedId}`}
                ref={twitchEmbedRef}
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute -top-64 right-0 bottom-0 z-10 hidden h-auto w-1/2 max-w-lg select-none overflow-clip lg:block">
          <Image
            src={leafRightImage1}
            alt=""
            className="absolute -right-32 h-auto max-h-full w-full"
          />
        </div>
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[16rem] select-none lg:block"
        />

        <Section dark>
          <div className="flex flex-wrap items-center">
            <div className="basis-full md:basis-1/2 md:px-4">
              <Heading level={2}>What is Alveus?</Heading>
              <p className="my-2 font-serif text-lg italic">
                Founded by Maya Higa
              </p>
              <p className="my-4 text-lg">
                Alveus is a non profit organization founded by Maya Higa that
                functions as an exotic animal sanctuary and as a virtual
                education center facility to provide permanent homes to
                non-releasable exotic animals. These animals function as
                ambassadors so viewers can watch their journeys, get to know the
                animals and gain an appreciation for their species.
              </p>
              <p className="my-4 text-lg">
                Alveus hosts content collaborations where creators can visit and
                participate in education programs. Combining platforms this way
                maximizes the impact for spreading conservation messages.
              </p>
              <Lightbox>
                {({ Trigger }) => (
                  <Trigger
                    videoId="jXTqWIc--jo"
                    className="inline-block rounded-full border-2 border-alveus-tan px-6 py-4 text-xl transition-colors hover:bg-alveus-tan hover:text-alveus-green"
                  >
                    Watch the Video
                  </Trigger>
                )}
              </Lightbox>
            </div>

            <div className="basis-full pt-8 md:basis-1/2 md:pt-0 md:pl-8">
              <Image
                src={mayaImage}
                alt="Maya Higa, holding an owl in one photo, and a falcon in the second photo"
                className="mr-auto h-auto w-full max-w-lg"
              />
            </div>
          </div>
        </Section>
      </div>

      <Section>
        <div className="flex flex-wrap items-center">
          <div className="max-w-full basis-full md:max-w-1/2 md:basis-1/2 xl:max-w-2/3 xl:basis-2/3">
            <div className="flex flex-wrap items-center justify-between">
              <Heading level={2}>Ambassadors:</Heading>
              <Link
                className="inline-block text-lg uppercase text-alveus-green-900 transition-colors hover:text-alveus-green"
                href="/ambassadors"
              >
                See all
              </Link>
            </div>

            <Carousel
              items={featuredAmbassadors}
              auto={10000}
              className="mt-4"
              itemClassName="basis-full sm:basis-1/2 md:basis-full lg:basis-1/2 xl:basis-1/3 p-4"
            />
          </div>

          <div className="basis-full pt-8 md:basis-1/2 md:px-16 md:pt-0 xl:basis-1/3">
            <Heading level={3}>Do you want to support these animals?</Heading>
            <p className="my-4">
              Donations help Alveus carry on its mission to inspire online
              audiences to engage in conservation efforts while providing
              high-quality animal care to these ambassadors.
            </p>
            <Link
              className="inline-block rounded-full border-2 border-alveus-green px-6 py-2 text-xl transition-colors hover:bg-alveus-green hover:text-alveus-tan"
              href="/donate"
            >
              Donate!
            </Link>
          </div>
        </div>
      </Section>

      <div className="relative">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -top-24 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section dark>
          <div className="flex flex-wrap items-center">
            <div className="max-w-full basis-full md:max-w-1/2 md:basis-1/2">
              <Carousel items={merch} />
            </div>

            <div className="basis-full pt-8 md:basis-1/2 md:pt-0 md:pl-8">
              <Heading level={2}>New Merch Available!</Heading>
              <p className="my-4">
                An official merchandise line composed from Recycled, Organic, or
                Biodegradable Materials!
              </p>
              <p className="my-4">
                Hoodies, T-Shirts, T-Shirt Dresses, Crop Tops, Beanies, iPhone
                Cases, and Tote Bags
              </p>
              <p className="my-4">
                - Every purchase goes directly towards supporting an Alveus
                Sanctuary Ambassador!
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  className="inline-block rounded-full border-2 border-alveus-tan px-4 py-2 text-lg transition-colors hover:bg-alveus-tan hover:text-alveus-green"
                  href="/merch"
                  target="_blank"
                  rel="noreferrer"
                >
                  Buy Merch!
                </Link>
                <Link
                  className="inline-block rounded-full border-2 border-alveus-tan px-4 py-2 text-lg transition-colors hover:bg-alveus-tan hover:text-alveus-green"
                  href="/plushies"
                  target="_blank"
                  rel="noreferrer"
                >
                  Buy Plushies!
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-48 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow">
          <Heading level={2} className="text-center text-alveus-green">
            How to Help
          </Heading>

          <div className="mt-8 flex flex-wrap items-center justify-evenly gap-8">
            {Object.entries(help).map(([key, value]) => (
              <Link
                className="group flex items-center gap-4"
                href={value.link}
                key={key}
                {...(value.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                <div className="rounded-2xl bg-alveus-green p-3 text-alveus-tan transition-colors group-hover:bg-alveus-tan group-hover:text-alveus-green">
                  <value.icon size={24} />
                </div>
                <p className="font-serif text-2xl font-bold text-alveus-green transition-colors group-hover:text-alveus-green-500">
                  {value.title}
                </p>
              </Link>
            ))}
          </div>
        </Section>
      </div>

      <Script
        src="https://embed.twitch.tv/embed/v1.js"
        strategy="lazyOnload"
        onLoad={() => setTwitchEmbedLoaded(true)}
      />
    </>
  );
};

export default Home;
