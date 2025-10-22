import type { InferGetStaticPropsType, NextPage } from "next";
import Image from "next/image";
import { type ReactNode, useMemo, useState } from "react";

import ambassadors from "@alveusgg/data/build/ambassadors/core";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";
import animalQuestEpisodes from "@alveusgg/data/build/animal-quest";

import { fetchYouTubeVideos } from "@/server/apis/youtube";

import { channels as youTubeChannels } from "@/data/youtube";

import { formatDateTime } from "@/utils/datetime";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { camelToKebab } from "@/utils/string-case";

import Consent from "@/components/Consent";
import AnimalQuest from "@/components/content/AnimalQuest";
import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Carousel from "@/components/content/Carousel";
import Heading from "@/components/content/Heading";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import { MayaImage } from "@/components/content/Maya";
import MerchCarousel from "@/components/content/MerchCarousel";
import Section from "@/components/content/Section";
import Slideshow from "@/components/content/Slideshow";
import Twitch from "@/components/content/Twitch";
import WatchLive from "@/components/content/WatchLive";
import { YouTubeEmbed, YouTubePreview } from "@/components/content/YouTube";

import IconAmazon from "@/icons/IconAmazon";
import IconBox from "@/icons/IconBox";
import IconPayPal from "@/icons/IconPayPal";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import momoAppaHeroImage from "@/assets/hero/momo-appa.jpg";
import noodleHeroImage from "@/assets/hero/noodle.jpg";
import pushPopHeroImage from "@/assets/hero/push-pop.jpg";
import serranoJalapenoHeroImage from "@/assets/hero/serrano-jalapeno.jpg";
import sirenHeroImage from "@/assets/hero/siren.jpg";
import studioHeroImage from "@/assets/hero/studio.jpg";
import ticoMileyHeroImage from "@/assets/hero/tico-miley.jpg";
import usfwsMexicanWolfReleasedImage from "@/assets/institute/usfws-mexican-wolf-released.jpg";
import usfwsRedWolfImage from "@/assets/institute/usfws-red-wolf.jpg";

import { ambassadorImageHover } from "@/pages/ambassadors";

const slides = [
  {
    src: sirenHeroImage,
    alt: ambassadors.siren.name,
    className: "object-[40%_50%] lg:object-left",
  },
  {
    src: studioHeroImage,
    alt: "Maya in the Alveus studio",
  },
  {
    src: serranoJalapenoHeroImage,
    alt: `${ambassadors.serrano.name} and ${ambassadors.jalapeno.name}`,
  },
  {
    src: pushPopHeroImage,
    alt: ambassadors.pushPop.name,
    className: "object-[25%_50%] lg:object-center",
  },
  {
    src: ticoMileyHeroImage,
    alt: `${ambassadors.tico.name} and ${ambassadors.miley.name}`,
    className: "object-bottom",
  },
  {
    src: noodleHeroImage,
    alt: ambassadors.noodle.name,
  },
  {
    src: momoAppaHeroImage,
    alt: `${ambassadors.momo.name} and ${ambassadors.appa.name}`,
    className: "object-left lg:object-center",
  },
];

const featuredAmbassadors = typeSafeObjectEntries(ambassadors)
  .filter(([, { homepage }]) => !!homepage)
  .reduce((obj, [key, { homepage }]) => {
    const images = getAmbassadorImages(key);
    return {
      ...obj,
      [key]: (
        <Link
          href={`/ambassadors/${camelToKebab(key)}`}
          draggable={false}
          custom
          className="group hover:text-alveus-green"
        >
          <Image
            src={images[0].src}
            alt={images[0].alt}
            draggable={false}
            width={200}
            className={`mx-auto aspect-square h-auto w-full max-w-40 rounded-xl object-cover ${ambassadorImageHover}`}
            style={{ objectPosition: images[0].position }}
          />
          <Heading level={3} className="text-center text-xl transition-colors">
            {homepage?.title}
          </Heading>
          <p className="text-center transition-colors">
            {homepage?.description}
          </p>
        </Link>
      ),
    };
  }, {});

const latestAnimalQuest = animalQuestEpisodes.toSorted(
  (a, b) => b.broadcast.getTime() - a.broadcast.getTime(),
)[0];

const help = {
  donate: {
    icon: IconPayPal,
    title: "Donate to Alveus directly",
    link: "/donate",
    external: false,
  },
  amazon: {
    icon: IconAmazon,
    title: "Gift via our Amazon Wishlist",
    link: "/wishlist",
    external: true,
  },
  contact: {
    icon: IconBox,
    title: "Send items to our PO Box",
    link: "/po-box",
    external: false,
  },
};

export const getStaticProps = async () => {
  const channels = [youTubeChannels.alveus.id, youTubeChannels.highlights.id];
  const latestVideos = await Promise.all(
    channels.map((channelId) => fetchYouTubeVideos(channelId)),
  ).then((feeds) =>
    feeds
      .flat()
      .sort((a, b) => b.published.getTime() - a.published.getTime())
      .slice(0, 4),
  );

  return {
    props: {
      videos: latestVideos,
    },
    revalidate: 1800, // revalidate after 30 minutes
  };
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  videos,
}) => {
  const [latestLightboxOpen, setLatestLightboxOpen] = useState<string>();

  const latestLightboxItems = useMemo(
    () =>
      videos.reduce<Record<string, ReactNode>>(
        (acc, video) => ({
          ...acc,
          [video.id]: (
            <YouTubeEmbed
              videoId={video.id}
              caption={`${video.title}: ${formatDateTime(video.published, { style: "long" })}`}
            />
          ),
        }),
        {},
      ),
    [videos],
  );

  return (
    <>
      {/* Hero, offset to be navbar background */}
      <div className="relative z-0 flex min-h-[95vh] flex-col lg:-mt-40">
        <div className="absolute inset-0 -z-10 bg-alveus-green">
          <Slideshow images={slides} />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="container mx-auto grid grow auto-rows-auto grid-cols-1 content-center items-center gap-8 p-4 text-white lg:mt-40 lg:pt-8 lg:pb-16 xl:grid-cols-2 xl:gap-y-16">
          <div>
            <Heading className="text-5xl">
              Educating the <br className="hidden md:block" />
              World from the Web
            </Heading>

            <p className="mt-8 text-xl text-balance">
              Alveus is a virtual education center following the journeys of our
              non-releasable animal ambassadors, aiming to educate and spark an
              appreciation for them and their wild counterparts.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/ambassadors" dark className="backdrop-blur-md">
                Meet the Ambassadors
              </Button>
              <WatchLive />
            </div>
          </div>

          <div>
            <Consent
              item="live cam feed"
              consent="twitch"
              className="aspect-video h-auto w-full max-w-2xl rounded-2xl data-[consent]:backdrop-blur-md xl:ml-auto"
            >
              <Link
                href="/live"
                external
                custom
                className="block size-full rounded-2xl shadow-xl transition hover:scale-102 hover:shadow-2xl"
              >
                <Twitch
                  channel="alveussanctuary"
                  muted
                  className="pointer-events-none rounded-2xl select-none"
                />
              </Link>
            </Consent>
          </div>

          <Box
            dark
            className="col-span-full flex flex-col gap-x-4 gap-y-8 rounded-2xl bg-alveus-green-900/25 backdrop-blur-sm lg:flex-row"
          >
            <div className="flex grow flex-col items-start gap-4">
              <Heading level={2} className="my-0 text-balance">
                Introducing the Alveus Research & Recovery Institute
              </Heading>

              <p className="text-lg text-balance">
                We&apos;re taking the Alveus approach to the wild; creating
                conservation breeding programs to help save species from
                extinction, while pushing forward technology and public
                engagement in conservation.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button href="/institute" dark>
                  Learn More About the Institute
                </Button>

                <Button href="/donate" dark>
                  Donate to Support the Institute
                </Button>
              </div>
            </div>

            <div className="z-0 flex items-center justify-center self-center lg:max-w-md">
              <Image
                src={usfwsRedWolfImage}
                width={256}
                alt="Red wolf, B. Bartel/USFWS, Public Domain, https://www.fws.gov/media/red-wolf-7"
                className="z-10 mr-[-10%] h-auto w-2/5 max-w-64 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
              />
              <Image
                src={usfwsMexicanWolfReleasedImage}
                width={384}
                alt="Mexican wolf released back into the wild, Mexican Wolf Interagency Field Team, Public Domain, https://www.fws.gov/media/mexican-wolf-released-back-wild"
                className="h-auto w-3/5 max-w-96 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
              />
            </div>
          </Box>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute -top-32 right-0 bottom-0 z-10 hidden h-auto w-1/2 max-w-sm overflow-clip select-none lg:block xl:max-w-md 2xl:max-w-lg">
          <Image
            src={leafRightImage1}
            alt=""
            className="absolute -right-32 h-auto max-h-full w-full drop-shadow-md"
          />
        </div>

        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-20 left-0 z-10 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />

        <Section dark>
          <div className="flex flex-wrap items-center">
            <div className="basis-full lg:basis-1/2 lg:px-4">
              <Heading level={2} id="alveus" link>
                What is Alveus?
              </Heading>
              <p className="my-2 font-serif text-lg italic">
                Founded by Maya Higa
              </p>

              <p className="my-4 text-lg">
                Alveus is a nonprofit organization founded by Maya Higa that
                functions as a wildlife sanctuary and as a virtual education
                center facility to provide permanent homes to non-releasable
                animal ambassadors.
              </p>

              <p className="my-4 text-lg">
                Alveus runs a 24/7 live stream on Twitch, where viewers can
                watch the animal ambassadors, get to know them and gain an
                appreciation for their species. The sanctuary also hosts content
                collaborations where creators can visit and participate in
                education programs, sharing the ambassadors with their own
                audiences and combining platforms to maximize the impact for
                spreading conservation messages.
              </p>

              <Button href="/about" dark>
                Learn More About Alveus Sanctuary
              </Button>
            </div>

            <div className="basis-full pt-8 lg:basis-1/2 lg:pt-0 lg:pl-8">
              <MayaImage className="mx-auto h-auto w-full max-w-lg lg:ml-0" />
            </div>
          </div>
        </Section>
      </div>

      <Section>
        <div className="flex flex-wrap items-center gap-y-8">
          <div className="max-w-full basis-full md:max-w-1/2 md:basis-1/2 xl:max-w-2/3 xl:basis-2/3">
            <div className="flex flex-wrap items-center justify-between">
              <Heading level={2} id="ambassadors" link>
                Ambassadors:
              </Heading>
              <Link
                href="/ambassadors"
                custom
                className="group relative inline-block text-lg text-alveus-green-900 uppercase transition-colors hover:text-alveus-green"
              >
                See All
                <span className="absolute inset-x-0 bottom-0 block h-0.5 max-w-0 bg-alveus-green transition-all group-hover:max-w-full" />
              </Link>
            </div>

            <Carousel
              items={featuredAmbassadors}
              auto={10000}
              className="mt-4"
              itemClassName="basis-full sm:basis-1/2 md:basis-full lg:basis-1/2 xl:basis-1/3 p-4"
            />
          </div>

          <div className="basis-full md:basis-1/2 md:px-16 xl:basis-1/3">
            <Heading level={3}>Do you want to support these animals?</Heading>
            <p className="my-4">
              Donations help Alveus carry on its mission to inspire online
              audiences to engage in conservation efforts while providing
              high-quality animal care to these ambassadors.
            </p>
            <Button href="/donate">Donate Now</Button>
          </div>
        </div>
      </Section>

      <Section dark>
        <div className="flex flex-wrap items-center gap-y-8">
          <div className="basis-full lg:basis-1/3 xl:basis-1/2">
            <Heading level={2} id="animal-quest" link>
              Animal Quest
            </Heading>
            <p className="my-4 text-lg">
              Hosted by Maya, Animal Quest is an educational video series that
              introduces you to the ambassadors at Alveus. Each episode focuses
              on a different ambassador, teaching you about their species and
              their importance to our environment.
            </p>
            <Button href="/animal-quest" dark>
              View All Episodes
            </Button>
          </div>

          {latestAnimalQuest && (
            <div className="basis-full lg:basis-2/3 lg:px-16 xl:basis-1/2">
              <Heading
                level={3}
                className="my-1 font-sans text-lg font-normal text-alveus-green-100 uppercase"
              >
                Latest Episode
              </Heading>

              <AnimalQuest episode={latestAnimalQuest} heading={-1} />
            </div>
          )}
        </div>
      </Section>

      <div className="relative">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -top-44 right-0 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-top-52 2xl:max-w-48"
        />

        <Section containerClassName="space-y-8">
          <div className="grid grid-cols-1 justify-items-start gap-4 lg:grid-cols-2 lg:grid-rows-auto-3">
            <Heading
              level={2}
              id="merch"
              link
              className="my-0 self-baseline lg:col-start-1 lg:row-start-1"
            >
              Alveus Merch
            </Heading>

            <div className="space-y-2 lg:col-start-1 lg:row-start-2">
              <p>
                Grab yourself some high-quality merch and support Alveus in your
                home or when you&apos;re out and about!
              </p>
            </div>

            <Button
              href="/merch"
              external
              className="lg:col-start-1 lg:row-start-3"
            >
              Explore Merch Collection
            </Button>

            <Heading
              level={3}
              className="my-0 self-baseline text-xl lg:col-start-2 lg:row-start-1"
            >
              + Plushies
            </Heading>

            <div className="space-y-2 lg:col-start-2 lg:row-start-2">
              <p>
                Or, have your very own ambassador in your home with our soft and
                cuddly plushies!
              </p>
            </div>

            <Button
              href="/plushies"
              external
              className="lg:col-start-2 lg:row-start-3"
            >
              Buy Ambassador Plushies
            </Button>
          </div>

          <MerchCarousel more />

          <p className="text-center text-alveus-green italic">
            All proceeds go directly into Alveus and the support + care of our
            educational ambassadors!
          </p>
        </Section>
      </div>

      <Section dark>
        <Heading level={2} id="recent-videos" link>
          Recent Videos
        </Heading>

        <div className="mt-8 flex w-full flex-wrap justify-around gap-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="mx-auto flex basis-full flex-col items-center justify-start p-2 md:basis-1/2 lg:basis-1/4"
            >
              <Heading
                level={2}
                className="order-3 my-0 px-1 text-center text-2xl"
              >
                {video.title}
              </Heading>

              <Link
                href={`https://www.youtube.com/watch?v=${video.id}`}
                external
                onClick={(e) => {
                  e.preventDefault();
                  setLatestLightboxOpen(video.id);
                }}
                className="group/trigger order-1 w-full max-w-2xl"
                custom
              >
                <YouTubePreview
                  videoId={video.id}
                  alt={video.title}
                  className="aspect-video h-auto w-full"
                />
              </Link>

              <div className="order-2 my-1 flex w-full flex-wrap items-center justify-between px-1">
                <p className="text-sm leading-tight text-alveus-green-200">
                  {formatDateTime(video.published, { style: "long" })}
                </p>
                <Link
                  href={video.author.uri}
                  external
                  custom
                  className="block rounded-full bg-alveus-tan px-2 py-1 text-xs leading-tight text-alveus-green-700 transition-colors hover:bg-alveus-green-800 hover:text-alveus-tan"
                >
                  {video.author.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <Lightbox
          open={latestLightboxOpen}
          onClose={() => setLatestLightboxOpen(undefined)}
          items={latestLightboxItems}
        />
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-44 left-0 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-bottom-48 2xl:max-w-48"
        />

        <Section dark className="grow bg-alveus-green-900">
          <Heading level={2} id="help" link className="text-center">
            How to Help
          </Heading>

          <div className="mt-8 flex flex-wrap items-center justify-evenly gap-8">
            {Object.entries(help).map(([key, value]) => (
              <Link
                key={key}
                href={value.link}
                external={value.external}
                custom
                className="group flex items-center gap-4"
              >
                <div className="rounded-2xl bg-alveus-tan p-3 text-alveus-green transition-colors group-hover:bg-alveus-green group-hover:text-alveus-tan">
                  <value.icon size={24} />
                </div>
                <p className="font-serif text-2xl font-bold text-alveus-tan transition-colors group-hover:text-alveus-green-500">
                  {value.title}
                </p>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
};

export default Home;
