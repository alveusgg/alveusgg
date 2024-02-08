import type { NextPage } from "next";
import Image from "next/image";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";

import giveAnHourLogo from "@/assets/show-and-tell/give-an-hour/logo.svg";

const GiveAnHourPage: NextPage = () => (
  <>
    <Meta
      title="Give an Hour | Show and Tell"
      description="Join the Alveus community and WWF to Give an Hour for Earth! Discover what actions you can take to help the environment and wildlife."
    />

    {/* Nav background */}
    <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

    <Section
      dark
      className="py-8"
      containerClassName="flex flex-wrap items-center justify-between"
    >
      <div className="flex w-full flex-col gap-4 pb-4 pt-8 md:w-3/5 md:py-24">
        <Heading className="my-0">Give an Hour for Earth</Heading>

        <p className="text-lg">
          Join the Alveus community and WWF in participating in Give an Hour for
          Earth from March 1st to April 22nd. Discover what actions you can take
          to help the environment and wildlife.
        </p>

        <p className="text-md">
          Given an hour? Share your activities with the community and inspire
          others, via the{" "}
          <Link href="/show-and-tell/submit-post" dark className="underline">
            Show and Tell
          </Link>{" "}
          page.
        </p>
      </div>

      <Image
        src={giveAnHourLogo}
        width={448}
        alt=""
        className="mx-auto w-full max-w-md p-4 pb-16 md:mx-0 md:w-2/5 md:pb-4"
      />
    </Section>

    {/* Grow the last section to cover the page */}
    <Section className="flex-grow">
      <Heading level={2} id="why-it-matters" link>
        Why it matters?
      </Heading>

      <p>
        <strong>An essential ally against the climate crisis is nature.</strong>
        Yet, we are losing nature at an alarming and unprecedented rate. Each of
        us can do something positive for our planet for 60 minutes and together,
        we can create the #BiggestHourForEarth.
      </p>

      <Heading level={2} id="actions" link>
        Actions you can take
      </Heading>
      {/* TODO: Style each of the sections below as a card (see Maya's graphic) */}

      <Heading level={3} id="actions:food" link>
        Food
      </Heading>
      <ul>
        <li>Cook/order a plant-based meal.</li>
        <li>Look for sustainable products at the supermarket.</li>
        <li>Go to a farmer&apos;s market.</li>
        <li>Swap staples with more sustainable ones.</li>
      </ul>

      <Heading level={3} id="actions:entertainment" link>
        Entertainment
      </Heading>
      <ul>
        <li>Visit an art gallery/exhibition about our planet.</li>
        <li>Watch an educational video or documentary.</li>
      </ul>

      <Heading level={3} id="actions:fitness-wellness" link>
        Fitness &amp; Wellness
      </Heading>
      <ul>
        <li>Attend a kayaking tour to learn about local nature.</li>
        <li>Join an outdoor yoga session.</li>
        <li>
          Attend a charity run and choose WWF or Alveus as your organization.
        </li>
        <li>Cycle or walk to work.</li>
      </ul>

      <Heading level={3} id="actions:arts-creativity" link>
        Arts &amp; Creativity
      </Heading>
      <ul>
        <li>Try wildlife photography.</li>
        <li>Upcycle something.</li>
        <li>Draw or paint a nature scene.</li>
      </ul>

      <Heading level={3} id="actions:get-outside" link>
        Get Outside
      </Heading>
      <ul>
        <li>Do a trash clean-up.</li>
        <li>Plant a pollinator garden.</li>
        <li>Start a compost pile.</li>
        <li>Go for a nature walk or bird watch.</li>
      </ul>

      <Heading level={3} id="actions:be-creative" link>
        Be creative and have fun!
      </Heading>
      <p>As long as your activity helps to:</p>
      <ul>
        <li>Reconnect with our planet.</li>
        <li>Restore our planet.</li>
        <li>Learn more about our planet.</li>
        <li>Inspire others to care for our planet.</li>
      </ul>
      <p>...then we want to hear about it!</p>

      <Heading level={2} id="share-your-activities" link>
        Share your activities
      </Heading>
      <p>
        Share your activities with the community and inspire others, via the{" "}
        <Link href="/show-and-tell/submit-post" dark className="underline">
          Show and Tell
        </Link>{" "}
        page.
      </p>

      <p>
        We need more people, more than ever. Individuals, communities,
        businesses, and governments must all step up their actions for nature,
        climate, and our one home to secure a Nature Positive world.
      </p>

      {/* TODO: Share this page with short URL (see vote page) */}
      {/* Download this information as a flyer (see Maya's graphic) */}
    </Section>
  </>
);

export default GiveAnHourPage;
