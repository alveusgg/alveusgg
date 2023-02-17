import type { NextPage } from "next"
import Head from "next/head"
import Script from "next/script"
import Link from "next/link"
import Image from "next/image"
import React, { useEffect, useId, useRef, useState } from "react"

import Heading from "../components/content/Heading"
import Slideshow from "../components/content/Slideshow"
import Section from "../components/content/Section"
import Carousel from "../components/content/Carousel"
import IconAmazon from "../icons/IconAmazon"
import IconPayPal from "../icons/IconPayPal"
import IconEmail from "../icons/IconEmail"

import mayaImage from "../assets/maya.png"
import sirenHeroImage from  "../assets/hero/siren.png"
import mileyHeroImage from  "../assets/hero/miley.png"
import ticoHeroImage from  "../assets/hero/tico.png"
import miaHeroImage from  "../assets/hero/mia.png"
import noodleHeroImage from  "../assets/hero/noodle.png"
import nuggetHeroImage from  "../assets/hero/nugget.png"
import moominImage from "../assets/ambassadors/moomin.jpg"
import georgieImage from "../assets/ambassadors/georgie.jpg"
import stompyImage from "../assets/ambassadors/stompy.jpg"
import leafLeftImage3 from "../assets/floral/leaf-left-3.png"
import leafRightImage1 from "../assets/floral/leaf-right-1.png"
import leafRightImage2 from "../assets/floral/leaf-right-2.png"
import leafLeftImage1 from "../assets/floral/leaf-left-1.png"
import caseMerchImage from "../assets/merch/biodegradable-iphone-case-iphone-11-pro-max-case-on-phone.png"
import toteMerchImage from "../assets/merch/large-eco-tote-oyster-front.png"
import tshirtMerchImage from "../assets/merch/organic-cotton-t-shirt-dress-black-front.png"
import croptopMerchImage from "../assets/merch/organic-crop-top-black-front.png"
import beanieMerchImage from "../assets/merch/organic-ribbed-beanie-black-front.png"
import hoodieMerchImage from "../assets/merch/unisex-essential-eco-hoodie-white-front.png"

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

const ambassadors = Object.entries({
  moomin: {
    src: moominImage,
    alt: "Moomin",
    title: "Moomin is Movin' In!",
    description: "He is an ambassador for how the fur trade has affected his species and many others.",
    link: "https://www.alveussanctuary.org/ambassadors/moomin/",
  },
  georgie: {
    src: georgieImage,
    alt: "Georgie",
    title: "Georgie!",
    description: "He is here to teach all about threats to his species and to amphibians worldwide.",
    link: "https://www.alveussanctuary.org/ambassadors/georgie/",
  },
  stompy: {
    src: stompyImage,
    alt: "Stompy",
    title: "Stompy!",
    description: "He is an ambassador for how the exotic meat trade & use of animal products in cosmetics has affected his species and many others.",
    link: "https://www.alveussanctuary.org/ambassadors/stompy/",
  },
})
  .reduce((obj, [ key, { src, alt, title, description, link } ]) => ({
    ...obj,
    [key]: (<Link
      href={link}
      draggable={false}
      className="hover:text-alveus-green transition-colors"
    >
      <Image
        src={src}
        alt={alt}
        draggable={false}
        className="w-full h-auto aspect-square object-cover max-w-[10rem] mx-auto rounded-xl"
      />
      <Heading level={4} className="text-center text-xl">{title}</Heading>
      <p className="text-center">{description}</p>
    </Link>)
  }), {});

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
})
  .reduce((obj, [ key, { src, alt } ]) => ({
    ...obj,
    [key]: (<Image
      src={src}
      alt={alt}
      draggable={false}
      className="w-full h-auto max-w-[10rem] mx-auto"
    />)
  }), {});

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
    link: "https://www.alveussanctuary.org/contact-us/",
    external: false,
  },
};

const Home: NextPage = () => {
  const twitchEmbedId = useId();
  const twitchEmbedRef = useRef<HTMLDivElement>(null);
  const [ twitchEmbedLoaded, setTwitchEmbedLoaded ] = useState(false);
  const [ twitchEmbedPlaying, setTwitchEmbedPlaying ] = useState(false);
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
  }, [twitchEmbedId, twitchEmbedLoaded])

  return (
    <>
      <Head>
        <title>Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Hero, offset to be navbar background */}
      <div className="min-h-[95vh] lg:-mt-40 flex flex-col relative z-0">
        <div className="absolute inset-0 bg-alveus-green -z-10">
          <Slideshow images={slides} />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>

        <div className="container mx-auto lg:pt-40 flex flex-wrap flex-grow items-center text-white">
          <div className="basis-full lg:basis-1/2 p-4">
            <Heading className="text-5xl">
              Educating the
              {' '}
              <br className="hidden md:block" />
              World from the Web
            </Heading>

            <p className="text-lg mt-8">
              Alveus is a virtual education center following the journeys of our non-releasable exotic ambassadors,
              aiming to educate and spark an appreciation for them and their wild counterparts.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                className="inline-block text-lg px-4 py-2 rounded-full border-2 border-white hover:bg-alveus-tan hover:text-alveus-green hover:border-alveus-tan transition-colors"
                href="https://www.alveussanctuary.org/ambassadors/"
              >
                Meet the Ambassadors
              </Link>
              <Link
                className="inline-block text-lg px-4 py-2 rounded-full border-2 border-white hover:bg-alveus-tan hover:text-alveus-green hover:border-alveus-tan transition-colors"
                href="/live"
              >
                Watch Live
              </Link>
            </div>
          </div>

          <div className="basis-full lg:basis-1/2 p-4">
            <Link className="block rounded-2xl shadow-xl hover:shadow-2xl transition-shadow" href="/live">
              <div
                className={`w-full h-auto aspect-video rounded-2xl overflow-clip ${twitchEmbedPlaying ? "pointer-events-none" : ""}`}
                id={`twitch-embed-${twitchEmbedId}`}
                ref={twitchEmbedRef}
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="hidden lg:block absolute z-10 -top-64 right-0 bottom-0 w-1/2 h-auto max-w-lg select-none pointer-events-none overflow-clip">
          <Image
            src={leafRightImage1}
            alt=""
            className="absolute -right-32 w-full h-auto max-h-full"
          />
        </div>
        <Image
          src={leafLeftImage3}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-24 left-0 w-1/2 h-auto max-w-[16rem] select-none pointer-events-none"
        />

        <Section dark>
          <div className="flex flex-wrap items-center">
            <div className="basis-full md:basis-1/2 md:px-4">
              <Heading level={2}>
                What is Alveus?
              </Heading>
              <p className="my-2 font-serif text-lg italic">
                Founded by Maya Higa
              </p>
              <p className="my-4 text-lg">
                Alveus is a non profit organization founded by Maya Higa that functions as an exotic animal sanctuary and
                as a virtual education center facility to provide permanent homes to non-releasable exotic animals. These
                animals function as ambassadors so viewers can watch their journeys, get to know the animals and gain an
                appreciation for their species.
              </p>
              <p className="my-4 text-lg">
                Alveus hosts content collaborations where creators can visit and participate in education programs.
                Combining platforms this way maximizes the impact for spreading conservation messages.
              </p>
              {/* TODO: Lightbox */}
              <a
                className="inline-block text-xl px-6 py-4 rounded-full border-2 border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green transition-colors"
                href="https://www.youtube.com/watch?v=jXTqWIc--jo"
                target="_blank"
                rel="noreferrer"
              >
                Watch the Video
              </a>
            </div>

            <div className="basis-full md:basis-1/2 pt-8 md:pt-0 md:pl-8">
              <Image
                src={mayaImage}
                alt="Maya Higa, holding an owl in one photo, and a falcon in the second photo"
                className="w-full h-auto max-w-lg mr-auto"
              />
            </div>
          </div>
        </Section>
      </div>

      <Section>
        <div className="flex flex-wrap items-center">
          <div className="basis-full max-w-full md:basis-2/3 md:max-w-2/3">
            <div className="flex flex-wrap items-center justify-between">
              <Heading level={2}>
                Ambassadors:
              </Heading>
              <Link
                className="inline-block text-lg uppercase text-alveus-green-900 hover:text-alveus-green transition-colors"
                href="https://www.alveussanctuary.org/ambassadors/"
              >
                See all
              </Link>
            </div>

            <Carousel items={ambassadors} auto={10000} />
          </div>

          <div className="basis-full md:basis-1/3 pt-8 md:pt-0 md:px-16">
            <Heading level={3}>
              Do you want to support these animals?
            </Heading>
            <p className="my-4">
              Donations help Alveus carry on its mission to inspire online audiences to engage in conservation efforts
              while providing high-quality animal care to these ambassadors.
            </p>
            <Link
              className="inline-block text-xl px-6 py-2 rounded-full border-2 border-alveus-green hover:bg-alveus-green hover:text-alveus-tan transition-colors"
              href="https://www.alveussanctuary.org/donate/"
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
          className="hidden lg:block absolute z-10 -top-24 right-0 w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />

        <Section dark>
          <div className="flex flex-wrap items-center">
            <div className="basis-full max-w-full md:basis-1/2 md:max-w-1/2">
              <Carousel items={merch} />
            </div>

            <div className="basis-full md:basis-1/2 pt-8 md:pt-0 md:pl-8">
              <Heading level={2}>
                New Merch Available!
              </Heading>
              <p className="my-4">
                An official merchandise line composed from Recycled, Organic, or Biodegradable Materials!
              </p>
              <p className="my-4">
                Hoodies, T-Shirts, T-Shirt Dresses, Crop Tops, Beanies, iPhone Cases, and Tote Bags
              </p>
              <p className="my-4">
                - Every purchase goes directly towards supporting an Alveus Sanctuary Ambassador!
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  className="inline-block text-lg px-4 py-2 rounded-full border-2 border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green transition-colors"
                  href="/merch"
                  target="_blank"
                  rel="noreferrer"
                >
                  Buy Merch!
                </Link>
                <Link
                  className="inline-block text-lg px-4 py-2 rounded-full border-2 border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green transition-colors"
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
      <div className="flex flex-col flex-grow relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="hidden lg:block absolute z-10 -bottom-48 left-0 w-1/2 h-auto max-w-[12rem] select-none pointer-events-none"
        />

        <Section className="flex-grow">
          <Heading level={2} className="text-center text-alveus-green">
            How to Help
          </Heading>

          <div className="flex flex-wrap items-center justify-evenly gap-8 mt-8">
            {Object.entries(help).map(([ key, value ]) => (
              <Link
                className="flex items-center group gap-4"
                href={value.link}
                key={key}
                {...(value.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <div className="text-alveus-tan group-hover:text-alveus-green bg-alveus-green group-hover:bg-alveus-tan transition-colors p-3 rounded-2xl">
                  <value.icon size={24} />
                </div>
                <p className="text-2xl font-serif font-bold text-alveus-green group-hover:text-alveus-green-500 transition-colors">
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
