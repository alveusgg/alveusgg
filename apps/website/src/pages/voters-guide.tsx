import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import IframeResizer from "@iframe-resizer/react";
import { type NextPage } from "next";
import Image from "next/image";

import { type ActiveAmbassadorKey } from "@alveusgg/data/build/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";

import { camelToKebab } from "@/utils/string-case";

import Consent from "@/components/Consent";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Share from "@/components/content/Share";

import IconArrowRight from "@/icons/IconArrowRight";
import IconChevronDown from "@/icons/IconChevronDown";
import IconChevronUp from "@/icons/IconChevronUp";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";

const embedTypes = {
  register: "Register to Vote",
  verify: "Check Your Voting Status",
  ballot: "Preview Your Ballot",
} as const;

const VoteEmbed = ({ type }: { type: keyof typeof embedTypes }) => (
  <Consent item="vote.org form" consent="vote" className="my-4">
    <IframeResizer
      className="w-full"
      src={`https://${type}.vote.org/?partner=111111&campaign=free-tools`}
      title={embedTypes[type]}
      license="GPLv3"
    />
  </Consent>
);

interface Step {
  title: string;
  link: string;
  description: string;
  content?: React.ReactNode;
}

const steps: Record<string, Step> = {
  register: {
    title: "Register to Vote",
    link: "https://www.vote.org/register-to-vote/",
    description:
      "If you're not yet registered to vote, you can register online in minutes using this form.",
    content: <VoteEmbed type="register" />,
  },
  status: {
    title: "Check Your Voting Status",
    link: "https://www.vote.org/am-i-registered-to-vote/",
    description:
      "Use this quick form to confirm that you're still all set to vote in your state.",
    content: <VoteEmbed type="verify" />,
  },
  preview: {
    title: "Preview Your Ballot",
    link: "https://www.vote.org/ballot-information/",
    description:
      "Get a preview of your ballot, including the candidates and issues you'll be voting on.",
    content: <VoteEmbed type="ballot" />,
  },
  early: {
    title: "Explore Early Voting",
    link: "https://www.vote.org/early-voting-calendar/",
    description:
      "Check if your state allows early voting, and if so, when and where you can vote early.",
  },
};

interface Issue {
  ambassador: ActiveAmbassadorKey;
  title: string;
  content: React.ReactNode;
}

const issues: Record<string, Issue> = {
  climate: {
    ambassador: "mia",
    title: "Confront Climate Change",
    content: (
      <>
        <p>
          Mia wants leaders who will take action to protect the environment and
          address climate change.
        </p>

        <p>
          Deforestation and other climate change factors affect her species and
          many more, leaving them with no natural habitat and a host of other
          challenges.
        </p>
      </>
    ),
  },
  water: {
    ambassador: "georgie",
    title: "Safeguard Waterways",
    content: (
      <>
        <p>
          Georgie would like for leaders to ensure that waterways are clean and
          safe for both people and wildlife, free from pollution and safeguarded
          for the future.
        </p>

        <p>
          Many species, including his own, live in the water and call it their
          home, while others&mdash;including us&mdash;depend on it for survival.
        </p>
      </>
    ),
  },
  laws: {
    ambassador: "fenn",
    title: "Protect Wildlife and Voters Rights",
    content: (
      <>
        <p>
          Fenn wants leaders who create, update, and protect laws that will
          ensure his species and all other wild animals are protected for
          generations to come.
        </p>
        <p>
          Laws should not only protect wildlife, but also protect the ability to
          create and enforce laws in the future, and for us to be able to vote
          on them.
        </p>
      </>
    ),
  },
  land: {
    ambassador: "abbott",
    title: "Keep Wild Spaces Wild",
    content: (
      <>
        <p>
          Abbott and his friends would like leaders who will protect public
          land, be that national parks, forests, or other areas, as they are
          vital habitats for so many.
        </p>
        <p>
          Public land is also important for people, helping keep our air clean
          and providing places to explore and enjoy nature, disconnect from
          technology, and relax.
        </p>
      </>
    ),
  },
};

const VotePage: NextPage = () => {
  return (
    <>
      <Meta
        title="Voters' Guide"
        description="Our ambassadors can't vote, but you can! Get ready to vote by checking your voting information, previewing your ballot, and understanding the issues."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8"
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="flex basis-full flex-col gap-4 pt-4 pb-16 xl:basis-1/2 xl:py-24">
          <Heading className="my-0">Voters&apos; Guide</Heading>

          <p className="text-lg">
            The ambassadors at Alveus Sanctuary can&apos;t vote to protect their
            wild friends, but you can! Explore our guide and get ready to vote
            by checking if you&apos;re registered to vote, previewing your
            ballot, seeing if you can vote early, and understanding the issues
            at stake.
          </p>
        </div>

        {/* TODO: Artwork? */}
        {/* <div className="basis-full p-4 pt-8 xl:basis-1/2 xl:pt-4"></div> */}
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -top-20 right-0 z-10 hidden h-auto w-1/2 max-w-48 -scale-x-100 drop-shadow-md select-none lg:block"
        />

        <Section>
          <Heading id="ready" level={2} link>
            Get Ready to Vote
          </Heading>

          <div className="mt-4 mb-6 text-alveus-green-600">
            <p>
              If you&apos;re in the United States, use the tools below to ensure
              you&apos;re prepared to vote in the next election.
            </p>

            <p>
              If you&apos;re outside the US, you can still follow these steps
              but will need to find the appropriate resources for your country.
            </p>
          </div>

          {Object.entries(steps).map(
            ([key, { title, link, description, content }]) =>
              content ? (
                <Disclosure key={key}>
                  {({ open }) => (
                    <>
                      <DisclosureButton className="mt-4 mb-2 flex w-full items-center gap-2 rounded-xl bg-alveus-green-100 px-4 py-2 text-start text-alveus-green-800 transition-colors hover:bg-alveus-green-200">
                        <div className="flex grow flex-wrap items-baseline gap-x-4">
                          <Link
                            href={link}
                            external
                            custom
                            className="hover:underline"
                          >
                            <Heading level={3} className="my-0 text-2xl">
                              {title}
                            </Heading>
                          </Link>

                          <p>{description}</p>
                        </div>

                        {open ? (
                          <IconChevronUp
                            className="box-content shrink-0 p-1"
                            size={32}
                          />
                        ) : (
                          <IconChevronDown
                            className="box-content shrink-0 p-1"
                            size={32}
                          />
                        )}
                      </DisclosureButton>

                      <DisclosurePanel className="mx-4">
                        {content}
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              ) : (
                <Link
                  key={key}
                  href={link}
                  external
                  custom
                  className="group mt-4 mb-2 flex w-full items-center gap-2 rounded-xl bg-alveus-green-100 px-4 py-2 text-start text-alveus-green-800 transition-colors hover:bg-alveus-green-200"
                >
                  <div className="flex grow flex-wrap items-baseline gap-x-4">
                    <Heading
                      level={3}
                      className="my-0 text-2xl group-hover:underline"
                    >
                      {title}
                    </Heading>

                    <p>{description}</p>
                  </div>

                  <IconArrowRight
                    className="box-content shrink-0 p-1"
                    size={32}
                  />
                </Link>
              ),
          )}
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block"
        />

        <Section dark>
          <Heading id="issues" level={2} link>
            Conservation Issues Matter
          </Heading>

          <ul>
            {Object.entries(issues).map(
              ([key, { ambassador, title, content }]) => {
                const image = getAmbassadorImages(ambassador)[0];

                return (
                  <li
                    key={key}
                    className="my-6 flex flex-col items-center gap-x-4 gap-y-2 sm:flex-row"
                  >
                    <Link
                      href={`/ambassadors/${camelToKebab(ambassador)}`}
                      className="group z-10 shrink-0 transition-transform hover:scale-102"
                      custom
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        className="size-24 rounded-full object-cover shadow-sm transition-shadow group-hover:shadow-md xl:size-32"
                        style={{ objectPosition: image.position }}
                      />
                    </Link>

                    <div className="text-center text-lg sm:text-left xl:text-xl">
                      <Heading level={3} className="my-0 text-xl xl:text-2xl">
                        {title}
                      </Heading>

                      {content}
                    </div>
                  </li>
                );
              },
            )}
          </ul>

          <div className="mx-auto lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl">
            <p className="my-12 border-y-2 border-y-alveus-green-600 py-8 text-center text-lg">
              None of our ambassadors can vote, and they aren&apos;t worried
              about which party wins.
              <br className="hidden lg:block" /> They just want to make sure
              that the people who are in power will do their best to protect
              their wild friends.
            </p>

            <div className="flex flex-col items-start gap-x-8 gap-y-4 lg:flex-row">
              <p className="grow">
                If you&apos;re in the United States, you can use the National
                Caucus of Environmental Legislators&apos; Bill Tracker to
                explore and keep track on the progress of environment policies
                across the country and in your state.
              </p>

              <Button
                href="https://www.ncelenviro.org/bill-tracking"
                external
                dark
                className="shrink-0 text-base"
              >
                Explore the Bill Tracker
              </Button>
            </div>
          </div>
        </Section>
      </div>

      <Section containerClassName="flex flex-col items-center md:flex-row md:justify-between gap-8">
        <div>
          <Heading id="share" level={2} link>
            Encourage Your Friends
          </Heading>

          <p className="text-lg">
            Every voice matters! Share this guide and encourage your friends,
            family, and colleagues to vote.
          </p>

          <p className="mt-4">
            Take the time to research the candidates and issues on your ballot,
            understand their plans to address conservation and how they&apos;ll
            protect the environment while in office.
          </p>

          <p>
            Your vote, and those of people around you, will help determine the
            future of our planet and all of its inhabitants.
          </p>
        </div>

        <Share
          title="Alveus Sanctuary Voters' Guide"
          text="Our ambassadors can't vote, but you can! Get ready to vote with Alveus Sanctuary's Voters' Guide. Check your voting information, preview your ballot, and understand the issues."
          path="/vote"
        />
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-24 z-10 hidden h-auto w-1/2 max-w-48 -scale-x-100 drop-shadow-md select-none lg:block"
        />

        <Section dark className="grow bg-alveus-green-900">
          <Heading id="non-profit" level={2} link>
            Alveus Sanctuary is a non-profit
          </Heading>

          <p>
            As a registered 501(c)(3) non-profit, we do not endorse any
            candidates or political parties, nor do we oppose them. Our focus is
            on making sure you&apos;re ready to vote, and educating the world
            about conservation.
          </p>

          <p className="mt-4 italic">
            Our thanks to the{" "}
            <Link href="https://www.nwf.org" external dark>
              National Wildlife Federation
            </Link>{" "}
            for their excellent Voters&apos; Guide, which inspired this page, to
            the team at{" "}
            <Link href="https://www.vote.org/" external dark>
              Vote.org
            </Link>{" "}
            for their free voter preparation tools, and the{" "}
            <Link href="https://www.ncelenviro.org/" external dark>
              National Caucus of Environmental Legislators
            </Link>{" "}
            for their bill tracker.
          </p>
        </Section>
      </div>
    </>
  );
};

export default VotePage;
