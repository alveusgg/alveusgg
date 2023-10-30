import { type NextPage } from "next";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import IframeResizer from "iframe-resizer-react";

import { getShortBaseUrl } from "@/utils/short-url";
import {
  emailShareUrl,
  facebookShareUrl,
  linkedinShareUrl,
  twitterShareUrl,
} from "@/utils/share-url";

import Consent from "@/components/Consent";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";

import IconChevronUp from "@/icons/IconChevronUp";
import IconChevronDown from "@/icons/IconChevronDown";
import IconExternal from "@/icons/IconExternal";
import IconFacebook from "@/icons/IconFacebook";
import IconTwitter from "@/icons/IconTwitter";
import IconEnvelope from "@/icons/IconEnvelope";
import IconLinkedIn from "@/icons/IconLinkedIn";

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
    />
  </Consent>
);

const steps = {
  register: {
    title: "Register to Vote",
    description:
      "If you're not yet registered to vote, you can register online in minutes using this form.",
    content: (
      <>
        <p className="italic">
          Use this form from Vote.org to register to vote in your state if
          you&apos;re located in the United States.
        </p>
        <VoteEmbed type="register" />
      </>
    ),
  },
  status: {
    title: "Check Your Voting Status",
    description:
      "Use this quick form to confirm that you're still all set to vote in your state.",
    content: (
      <>
        <p className="italic">
          Use this form from Vote.org to check if you&apos;re registered to vote
          in your state if you&apos;re located in the United States.
        </p>
        <VoteEmbed type="verify" />
      </>
    ),
  },
  preview: {
    title: "Preview Your Ballot",
    description:
      "Get a preview of your ballot, including the candidates and issues you'll be voting on.",
    content: (
      <>
        <p className="italic">
          Use this form from Vote.org to preview your upcoming election ballot
          if you&apos;re located in the United States.
        </p>
        <VoteEmbed type="ballot" />
      </>
    ),
  },
  early: {
    title: "Explore Early Voting",
    description:
      "Check if your state allows early voting, and if so, when and where you can vote early.",
    content: (
      <>
        <p>
          If you&apos;re located in the United States, you can use this free
          resource from Vote.org to check if your state allows early voting, and
          if so, when and where you can vote early.
        </p>

        <Link
          href="https://www.vote.org/early-voting-calendar/"
          external
          custom
          className="mx-auto my-4 inline-block rounded-full border-2 border-alveus-green px-6 py-2 text-xl transition-colors hover:bg-alveus-green hover:text-alveus-tan"
        >
          Check Early Voting Dates
          <IconExternal
            size="0.75em"
            className="ml-1 mr-0.5 inline-block align-baseline"
          />
        </Link>
      </>
    ),
  },
};

const shareData = {
  url: `${getShortBaseUrl()}/vote`,
  title: "Alveus Sanctuary Voters' Guide",
  text: "Our ambassadors can't vote, but you can! Get ready to vote with Alveus Sanctuary's Voters' Guide. Check your voting information, preview your ballot, and understand the issues.",
};

const share = {
  twitter: {
    link: twitterShareUrl(shareData),
    text: "Share on Twitter",
    icon: IconTwitter,
  },
  facebook: {
    link: facebookShareUrl(shareData),
    text: "Share on Facebook",
    icon: IconFacebook,
  },
  linkedIn: {
    link: linkedinShareUrl(shareData),
    text: "Share on LinkedIn",
    icon: IconLinkedIn,
  },
  email: {
    link: emailShareUrl(shareData),
    text: "Share via Email",
    icon: IconEnvelope,
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
                    <Disclosure.Button className="mb-2 mt-4 flex w-full items-center gap-2 rounded-xl bg-alveus-green-100 px-4 py-2 text-start text-alveus-green-800 transition-colors hover:bg-alveus-green-200">
                      <div className="flex grow flex-wrap items-baseline gap-x-4">
                        <Heading level={3} className="my-0 text-2xl">
                          {title}
                        </Heading>

                        <p>{description}</p>
                      </div>

                      {open ? (
                        <IconChevronDown
                          className="box-content flex-shrink-0 p-1"
                          size={32}
                        />
                      ) : (
                        <IconChevronUp
                          className="box-content flex-shrink-0 p-1"
                          size={32}
                        />
                      )}
                    </Disclosure.Button>

                    <Disclosure.Panel className="mx-4">
                      {content}
                    </Disclosure.Panel>
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

        <Section containerClassName="flex flex-col items-center md:flex-row md:justify-between gap-8">
          <div>
            <Heading id="share" level={2} link>
              Encourage Your Friends
            </Heading>

            <p className="text-lg">
              Every voice matters! Share this guide and encourage your friends,
              family, and colleagues to vote.
            </p>
          </div>

          <div>
            <ul className="flex justify-center gap-4">
              {Object.entries(share).map(([key, item]) => (
                <li key={key}>
                  <Link
                    href={item.link}
                    external
                    custom
                    className="block rounded-2xl bg-alveus-green p-3 text-alveus-tan transition-colors hover:bg-alveus-tan hover:text-alveus-green"
                    title={item.text}
                  >
                    <item.icon size={32} />
                  </Link>
                </li>
              ))}
            </ul>

            <input
              readOnly={true}
              type="url"
              className="m-0 mt-2 w-full bg-transparent p-0.5 text-center text-sm italic text-alveus-green-600 outline-none"
              value={shareData.url}
              onClick={(e) =>
                e.currentTarget.setSelectionRange(
                  0,
                  e.currentTarget.value.length,
                )
              }
            />
          </div>
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
