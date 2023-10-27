import { type NextPage } from "next";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import IconChevronUp from "@/icons/IconChevronUp";
import IconChevronDown from "@/icons/IconChevronDown";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";

const steps = {
  register: {
    title: "Register to Vote",
    description:
      "If you're not yet registered to vote, you can register online in minutes using this form.",
    content: <></>,
  },
  status: {
    title: "Check Your Voting Status",
    description:
      "Use this quick form to confirm that you're still all set to vote in your state.",
    content: <></>,
  },
  preview: {
    title: "Preview Your Ballot",
    description:
      "Get a preview of your ballot, including the candidates and issues you'll be voting on.",
    content: <></>,
  },
  early: {
    title: "Explore Early Voting",
    description:
      "Check if your state allows early voting, and if so, when and where you can vote early.",
    content: <></>,
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
        <div className="flex basis-full flex-col gap-4 pb-16 pt-4 xl:basis-1/2 xl:py-24">
          <Heading className="my-0">Voters&apos; Guide</Heading>

          <p className="text-lg">
            The ambassadors at Alveus Sanctuary can&apos;t vote to protect their
            wild friends, but you can! Explore our guide and get ready to vote
            by checking if you&apos;re registered to vote, previewing your
            ballot, seeing if you can vote early, and understanding the issues
            at stake.
          </p>
        </div>

        <div className="basis-full p-4 pt-8 xl:basis-1/2 xl:pt-4"></div>
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -top-20 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] -scale-x-100 select-none lg:block"
        />

        <Section>
          <Heading id="ready" level={2} link>
            Get Ready to Vote
          </Heading>

          <div className="mb-6 mt-4 text-alveus-green-600">
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
            ([key, { title, description, content }]) => (
              <Disclosure key={key}>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="mb-2 mt-4 flex w-full rounded-xl bg-alveus-green-100 px-4 py-1 text-start text-alveus-green-800">
                      <div className="flex grow flex-wrap items-baseline gap-x-4 gap-y-2">
                        <Heading level={3} className="text-2xl">
                          {title}
                        </Heading>

                        <p>{description}</p>
                      </div>

                      {open ? (
                        <IconChevronDown className="m-2 ml-auto" size={32} />
                      ) : (
                        <IconChevronUp className="m-2 ml-auto" size={32} />
                      )}
                    </Disclosure.Button>

                    <Disclosure.Panel>{content}</Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ),
          )}
        </Section>
      </div>

      <Section dark>
        <Heading id="issues" level={2} link>
          Conservation Issues Matter
        </Heading>

        {/* TODO: Issues list */}
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -top-32 left-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-48 2xl:max-w-[12rem]"
        />

        <Section containerClassName="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <Heading id="share" level={2} link>
              Encourage Your Friends
            </Heading>

            <p className="text-lg">
              Every voice matters! Share this guide and encourage your friends,
              family, and colleagues to vote.
            </p>
          </div>

          {/* TODO: Social media icons/links */}
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] -scale-x-100 select-none lg:block"
        />

        <Section dark className="flex-grow bg-alveus-green-900">
          <Heading id="non-profit" level={2} link>
            Alveus Sanctuary is a non-profit
          </Heading>

          <p>
            As a registered 501(c)(3) non-profit, we do not endorse any
            candidates or political parties, nor do we oppose them. Our focus is
            on making sure you&apos;re ready to vote, and educating the world
            about conservation.
          </p>
        </Section>
      </div>
    </>
  );
};

export default VotePage;
