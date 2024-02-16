import { useCallback, useState } from "react";
import type { NextPage } from "next";
import Image, { type ImageProps } from "next/image";
import { useRouter } from "next/router";

import { classes } from "@/utils/classes";

import IconPlus from "@/icons/IconPlus";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Share from "@/components/content/Share";

import { GiveAnHourProgress } from "@/components/show-and-tell/GiveAnHourProgress";

import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import showAndTellPeepo from "@/assets/show-and-tell/peepo.png";
import alveusLogo from "@/assets/logo.png";
import wwfLogo from "@/assets/show-and-tell/give-an-hour/wwf.svg";
import giveAnHourPoster from "@/assets/show-and-tell/give-an-hour/poster.png";

// Artwork from https://undraw.co
import giveAnHourArt from "@/assets/show-and-tell/give-an-hour/art.svg";
import giveAnHourEntertainment from "@/assets/show-and-tell/give-an-hour/entertainment.svg";
import giveAnHourFitness from "@/assets/show-and-tell/give-an-hour/fitness.svg";
import giveAnHourShopping from "@/assets/show-and-tell/give-an-hour/shopping.svg";
import giveAnHourWalk from "@/assets/show-and-tell/give-an-hour/walk.svg";
import giveAnHourNature from "@/assets/show-and-tell/give-an-hour/nature.svg";

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
  <div className="flex h-full gap-6 rounded-xl bg-white/75 p-6 shadow-lg backdrop-blur">
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

    <div className="flex-grow text-lg">
      <Heading
        level={3}
        id={id}
        link
        className="mt-0 scroll-mt-8 font-sans text-2xl"
      >
        {heading}
      </Heading>
      {children}
    </div>
  </div>
);

const GiveAnHourPage: NextPage = () => {
  // Demo logic for the progress bar
  const router = useRouter();
  const [progressHours, setProgressHours] = useState(0);
  const onClickProgress = useCallback(() => {
    if ("demo" in router.query) setProgressHours((prev) => prev + 4);
  }, [router.query.demo]);

  return (
    <>
      <Meta
        title="Give an Hour | Show and Tell"
        description="Join the Alveus community and WWF to Give an Hour for Earth! Discover what actions you can take to help the environment and wildlife."
        image={giveAnHourPoster.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8 lg:py-24"
        containerClassName="flex flex-wrap items-center lg:flex-nowrap gap-16"
      >
        <div className="flex w-full flex-grow flex-col lg:max-w-2/3">
          <Heading>Give an Hour for Earth</Heading>

          <p className="text-lg">
            Join the Alveus community and WWF in participating in Give an Hour
            for Earth from March 1st to April 22nd. Discover what actions you
            can take to help the environment and wildlife.
          </p>

          <p className="text-md mt-8">
            Given an hour? Share your activities with the community and inspire
            others, via the{" "}
            <Link href="/show-and-tell/submit-post" dark>
              Show and Tell
            </Link>{" "}
            page.
          </p>
          <div className="mt-2" onClick={onClickProgress}>
            <GiveAnHourProgress hours={progressHours} />
          </div>
        </div>

        <div className="flex flex-grow justify-center">
          <div className="w-full max-w-48 rounded-xl bg-alveus-tan shadow-lg">
            <Image
              src={alveusLogo}
              width={448}
              alt="Alveus Logo"
              className="h-full w-full object-contain p-[12%]"
            />
          </div>

          <IconPlus className="mx-2 my-auto h-8 w-8 flex-shrink-0 text-alveus-green-50 sm:mx-4" />

          <div className="w-full max-w-48 rounded-xl bg-white shadow-lg">
            <Image
              src={wwfLogo}
              width={448}
              alt="WWF Logo"
              className="h-full w-full object-contain p-[18%]"
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
              className="pointer-events-none absolute -bottom-14 right-0 -z-10 h-auto w-1/2 max-w-[12rem] select-none lg:-bottom-32 lg:-left-20 lg:right-auto lg:max-w-[10rem]"
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
              className="pointer-events-none absolute -top-20 right-0 -z-10 h-auto w-1/2 max-w-[12rem] -scale-x-100 -scale-y-100 select-none lg:-right-32 lg:max-w-[10rem] lg:scale-x-100"
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
          title="Give an Hour for Earth with Alveus Sanctuary and WWF"
          text="Join the Alveus community and WWF to Give an Hour for Earth! Discover what actions you can take to help the environment and wildlife."
          path="/give-an-hour"
          dark
        />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section
        className="flex-grow"
        containerClassName="flex flex-wrap items-center justify-between"
      >
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
            nature, climate, and our one home to secure a Nature Positive world.
          </p>
        </div>

        <Image
          src={showAndTellPeepo}
          width={448}
          alt=""
          className="mx-auto w-full max-w-md p-4 md:mx-0 md:w-2/5"
        />
      </Section>
    </>
  );
};

export default GiveAnHourPage;
