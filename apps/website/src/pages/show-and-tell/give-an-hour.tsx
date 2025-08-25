import { DateTime } from "luxon";
import type { InferGetStaticPropsType, NextPage } from "next";
import Image, { type ImageProps } from "next/image";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useLocale } from "react-aria";

import { classes } from "@/utils/classes";
import { DATETIME_ALVEUS_ZONE } from "@/utils/timezone";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Share from "@/components/content/Share";
import {
  type DateString,
  GiveAnHourProgress,
  parseDateString,
} from "@/components/show-and-tell/GiveAnHourProgress";

import IconPlus from "@/icons/IconPlus";

import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import alveusLogo from "@/assets/logo.png";
// Artwork from https://undraw.co
import giveAnHourArt from "@/assets/show-and-tell/give-an-hour/art.svg";
import giveAnHourEntertainment from "@/assets/show-and-tell/give-an-hour/entertainment.svg";
import giveAnHourFitness from "@/assets/show-and-tell/give-an-hour/fitness.svg";
import giveAnHourNature from "@/assets/show-and-tell/give-an-hour/nature.svg";
import giveAnHourPoster from "@/assets/show-and-tell/give-an-hour/poster.png";
import giveAnHourShopping from "@/assets/show-and-tell/give-an-hour/shopping.svg";
import giveAnHourWalk from "@/assets/show-and-tell/give-an-hour/walk.svg";
import wwfLogo from "@/assets/show-and-tell/give-an-hour/wwf.svg";
import showAndTellPeepo from "@/assets/show-and-tell/peepo.png";

interface WWFGiveAnHourCampaign {
  start: DateString;
  end: DateString;
  cta?: (header: boolean) => ReactNode;
}

const wwfGiveAnHourCampaigns: WWFGiveAnHourCampaign[] = [
  {
    start: "2025-03-23",
    end: "2025-04-22",
    cta: (header) => (
      <>
        {header ? "Head" : "For WWF's 2025 Give An Hour campaign, you can head"}{" "}
        over to{" "}
        <Link href="http://wwfsticker.org" external dark={header}>
          wwfsticker.org
        </Link>{" "}
        to claim your free WWF sticker once you&apos;ve completed your hour!
      </>
    ),
  },
  { start: "2024-03-01", end: "2024-04-22" },
];

const useWWfGiveAnHourCampaign = (date?: DateString) =>
  useMemo(() => {
    if (!date) return undefined;

    const campaign = wwfGiveAnHourCampaigns.find(({ start }) => start === date);
    if (!campaign) return undefined;

    return {
      ...campaign,
      year: campaign.start.split("-")[0]!,
    };
  }, [date]);

const wwfGiveAnHourTarget = (hours: number, ended: boolean) => {
  // The target is hidden when ended, so we can just use the actual hours
  if (ended) return hours;

  const minimum = 1500;
  const multiple = hours > minimum ? 1000 : 500;
  return Math.max(Math.ceil(hours / multiple) * multiple, minimum);
};

const Card = ({
  heading,
  id,
  image,
  number,
  children,
}: {
  heading: string;
  id: string;
  image: ImageProps["src"];
  number?: number;
  children: React.ReactNode;
}) => (
  <div className="flex h-full gap-6 rounded-xl bg-white/75 p-6 shadow-lg backdrop-blur-sm">
    <div
      className={classes(
        "flex flex-shrink-0 flex-col items-center justify-between gap-4",
        number === undefined && "md:order-last",
      )}
    >
      <Image src={image} alt="" className="w-24 md:w-32" />

      {number !== undefined && (
        <p className="text-5xl font-bold text-alveus-green opacity-50">
          {number.toLocaleString(undefined, {
            minimumIntegerDigits: 2,
            useGrouping: false,
          })}
        </p>
      )}
    </div>

    <div className="grow text-lg">
      <Heading level={3} id={id} link className="mt-0 font-sans text-2xl">
        {heading}
      </Heading>
      {children}
    </div>
  </div>
);

export const getStaticProps = async () => {
  // Check if we have an active campaign within the next/previous 7 days
  const todayDate = DateTime.local({ zone: DATETIME_ALVEUS_ZONE })
    .startOf("day")
    .toJSDate();
  const wwfCampaign = wwfGiveAnHourCampaigns.find(({ start, end }) => {
    const startDate = parseDateString(start, -7);
    const endDate = parseDateString(end, 7);
    return todayDate >= startDate && todayDate < endDate;
  });

  return {
    props: {
      wwfStart: wwfCampaign?.start,
    },
    revalidate: 60 * 60 * 6, // revalidate after 6 hours
  };
};

const GiveAnHourPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ wwfStart }) => {
  const { locale } = useLocale();
  const wwf = useWWfGiveAnHourCampaign(wwfStart);

  // Sync the targets of all the campaigns to the max target for them
  const [wwfMaxTarget, setWwfMaxTarget] = useState(0);
  const wwfGiveAnHourSyncTarget = useCallback(
    (hours: number, ended: boolean) => {
      const target = wwfGiveAnHourTarget(hours, ended);
      const max = Math.max(target, wwfMaxTarget);
      if (max !== wwfMaxTarget) setWwfMaxTarget(max);
      return max;
    },
    [wwfMaxTarget],
  );

  return (
    <>
      <Meta
        title="Give an Hour | Show and Tell"
        description="Join the Alveus community and Give an Hour for Earth! Discover what actions you can take to help the environment and wildlife."
        image={giveAnHourPoster.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8 lg:py-24"
        containerClassName="flex flex-wrap items-center lg:flex-nowrap gap-16"
      >
        <div className="flex w-full grow flex-col lg:max-w-2/3">
          <Heading>
            Give an Hour for Earth
            {wwf && <span className="text-alveus-green-50"> {wwf.year}</span>}
          </Heading>

          {wwf ? (
            <p className="text-lg">
              Join WWF and the Alveus community for the {wwf.year} Give an Hour
              for Earth campaign! Discover what actions you can take to help the
              environment and wildlife from{" "}
              {new Date(wwf.start).toLocaleDateString(locale, {
                month: "long",
                day: "numeric",
              })}{" "}
              to{" "}
              {new Date(wwf.end).toLocaleDateString(locale, {
                month: "long",
                day: "numeric",
              })}
              .{wwf.cta && <> {wwf.cta(true)}</>}
            </p>
          ) : (
            <p className="text-lg">
              Join the Alveus community in giving hours for Earth. Discover what
              actions you can take to help the environment and wildlife.
              Supporting WWF&apos;s Give an Hour for Earth campaign each year,
              we&apos;re now tracking everything we do for Earth!
            </p>
          )}

          <p className="mt-8">
            Given an hour? Share your activities with the community and inspire
            others, via the{" "}
            <Link href="/show-and-tell/submit-post" dark>
              Show and Tell
            </Link>{" "}
            page.
          </p>
          <div className="mt-2">
            <GiveAnHourProgress
              start={wwf?.start}
              end={wwf?.end}
              target={wwf && wwfGiveAnHourTarget}
            />
          </div>
        </div>

        <div className="flex grow justify-center">
          <div className="w-full max-w-48 rounded-xl bg-alveus-tan shadow-lg">
            <Image
              src={alveusLogo}
              width={448}
              alt="Alveus Logo"
              className="size-full object-contain p-[12%]"
            />
          </div>

          <IconPlus className="mx-2 my-auto size-8 shrink-0 text-alveus-green-50 sm:mx-4" />

          <div className="w-full max-w-48 rounded-xl bg-white shadow-lg">
            <Image
              src={wwfLogo}
              width={448}
              alt="WWF Logo"
              className="size-full object-contain p-[18%]"
            />
          </div>
        </div>
      </Section>

      <Section containerClassName="max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Heading level={2} id="why-it-matters" link className="text-4xl">
            Why it Matters?
          </Heading>

          <p className="text-lg">
            <strong>
              An essential ally against the climate crisis is nature.
            </strong>{" "}
            Yet, we are losing nature at an alarming and unprecedented rate.
            Each of us can do something positive for our planet for 60 minutes
            and together, we can create the #BiggestHourForEarth.
          </p>
        </div>

        <Heading level={2} id="actions" link className="text-center">
          Actions You Can Take
        </Heading>

        <div className="my-8 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
          <Card
            heading="Food"
            id="actions:food"
            image={giveAnHourShopping}
            number={1}
          >
            <ul className="list-disc ps-4">
              <li>Cook/order a plant-based meal.</li>
              <li>Look for sustainable products at the supermarket.</li>
              <li>Go to a farmer&apos;s market.</li>
              <li>Swap staples with more sustainable ones.</li>
            </ul>
          </Card>

          <div className="relative">
            <Image
              src={leafRightImage2}
              alt=""
              className="pointer-events-none absolute right-0 -bottom-14 -z-10 h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:right-auto lg:-bottom-32 lg:-left-20 lg:max-w-40"
            />

            <Card
              heading="Entertainment"
              id="actions:entertainment"
              image={giveAnHourEntertainment}
              number={2}
            >
              <ul className="list-disc ps-4">
                <li>Visit an art gallery/exhibition about our planet.</li>
                <li>Watch an educational video or documentary.</li>
              </ul>
            </Card>
          </div>

          <Card
            heading="Fitness & Wellness"
            id="actions:fitness-wellness"
            image={giveAnHourFitness}
            number={3}
          >
            <ul className="list-disc ps-4">
              <li>Attend a kayaking tour to learn about local nature.</li>
              <li>Join an outdoor yoga session.</li>
              <li>
                Attend a charity run and choose WWF or Alveus as your
                organization.
              </li>
              <li>Cycle or walk to work.</li>
            </ul>
          </Card>

          <Card
            heading="Arts & Creativity"
            id="actions:arts-creativity"
            image={giveAnHourArt}
            number={4}
          >
            <ul className="list-disc ps-4">
              <li>Try wildlife photography.</li>
              <li>Upcycle something.</li>
              <li>Draw or paint a nature scene.</li>
            </ul>
          </Card>

          <div className="relative">
            <Image
              src={leafLeftImage3}
              alt=""
              className="pointer-events-none absolute -top-20 right-0 -z-10 h-auto w-1/2 max-w-48 -scale-100 drop-shadow-md select-none lg:-right-32 lg:max-w-40 lg:scale-x-100"
            />

            <Card
              heading="Get Outside"
              id="actions:get-outside"
              image={giveAnHourWalk}
              number={5}
            >
              <ul className="list-disc ps-4">
                <li>Do a trash clean-up.</li>
                <li>Plant a pollinator garden.</li>
                <li>Start a compost pile.</li>
                <li>Go for a nature walk or bird watch.</li>
              </ul>
            </Card>
          </div>

          <Card
            heading="Be creative and have fun!"
            id="actions:be-creative"
            image={giveAnHourNature}
          >
            <p>As long as your activity helps to:</p>
            <ul className="my-2 list-disc ps-4">
              <li>Reconnect with our planet.</li>
              <li>Restore our planet.</li>
              <li>Learn more about our planet.</li>
              <li>Inspire others to care for our planet.</li>
            </ul>
            <p>...then we want to hear about it!</p>
          </Card>
        </div>
      </Section>

      <Section
        dark
        containerClassName="flex flex-col items-center md:flex-row md:justify-between gap-8"
      >
        <div>
          <Heading id="encourage-your-friends" level={2} link>
            Encourage Your Friends
          </Heading>

          <p className="text-lg">
            Every action and every hour matters! Share this guide and encourage
            your friends, family, and colleagues to get involved and Give an
            Hour for Earth.
          </p>

          <p className="mt-4 text-lg">
            <Link href={giveAnHourPoster.src} external dark>
              Download this guide as a poster
            </Link>{" "}
            to share with your community and inspire others to take action.
          </p>
        </div>

        <Share
          title="Give an Hour for Earth with Alveus Sanctuary"
          text="Join the Alveus community to give an hour for Earth! Discover what actions you can take to help the environment and wildlife."
          path="/give-an-hour"
          dark
        />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        <div className="flex flex-wrap items-center justify-between">
          <div className="w-full py-8 md:w-3/5">
            <Heading level={2} id="share-your-activities" link>
              Share Your Activities
            </Heading>

            <p className="text-lg">
              Share the hours you&apos;ve given and what you&apos;ve been doing
              with the Alveus community and inspire others, via the{" "}
              <Link href="/show-and-tell/submit-post">Show and Tell</Link> page.
            </p>

            <p className="mt-8 text-lg">
              We need more people, more than ever. Individuals, communities,
              businesses, and governments must all step up their actions for
              nature, climate, and our one home to secure a Nature Positive
              world.
            </p>
          </div>

          <Image
            src={showAndTellPeepo}
            width={448}
            alt=""
            className="mx-auto w-full max-w-md p-4 md:mx-0 md:w-2/5"
          />
        </div>

        <div className="flex flex-wrap items-start justify-between py-8">
          <div className="w-full lg:sticky lg:top-0 lg:w-1/2 lg:pl-8 xl:w-3/5">
            <Heading level={2} id="wwf-give-an-hour" link>
              WWF&apos;s Give an Hour for Earth
            </Heading>

            <p className="text-lg">
              While we&apos;re tracking our hours all year round, this effort
              was started as part of{" "}
              <Link
                href="https://www.worldwildlife.org/pages/earth-hour"
                external
              >
                WWF&apos;s Give an Hour for Earth
              </Link>{" "}
              campaign. This campaign encourages people to take action for the
              planet, and we are proud to continue to be a part of it each year!
            </p>

            {wwf?.cta && <p className="mt-2 text-lg">{wwf.cta(false)}</p>}
          </div>

          <div className="flex w-full flex-col divide-y-1 divide-alveus-green/25 lg:order-first lg:w-1/2 xl:w-2/5">
            {wwfGiveAnHourCampaigns.map(({ start, end }) => {
              const year = start.split("-")[0]!;
              return (
                <div key={year} className="pt-4 pb-6">
                  <div className="flex flex-wrap items-baseline justify-between">
                    <Heading
                      level={3}
                      id={`wwf-give-an-hour-${year}`}
                      link
                      className="my-0 text-2xl"
                    >
                      {year}
                    </Heading>
                    <p className="text-sm opacity-75">
                      {new Date(start).toLocaleDateString(locale, {
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(end).toLocaleDateString(locale, {
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <GiveAnHourProgress
                    start={start}
                    end={end}
                    target={wwfGiveAnHourSyncTarget}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </>
  );
};

export default GiveAnHourPage;
