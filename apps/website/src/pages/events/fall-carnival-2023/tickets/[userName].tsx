import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import Image from "next/image";

import { env } from "@/env";

import {
  eventId,
  stickerPack,
  ticketConfig,
} from "@/data/events/fall-carnival-2023";

import leafLeftImage1 from "@/assets/floral/leaf-left-1-fall.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2-fall.png";

import { trpc } from "@/utils/trpc";
import invariant from "@/utils/invariant";
import { classes } from "@/utils/classes";
import { getVirtualTicketImageUrl } from "@/utils/virtual-tickets";

import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";

import { Wiggle } from "@/components/events/virtual-ticket/Wiggle";

import { IntroSection } from "@/components/events/fall-carnival-2023/IntroSection";
import { Activities } from "@/components/events/fall-carnival-2023/Activities";
import { StickerAttribution } from "@/components/events/virtual-ticket/StickerAttribution";

/*
 * NOTE(pje): We use blocking SSR because we want to ensure each page gets its own unique metadata (og:image)
 * for sharing the links. We don't know the username in advance so it cant be statically generated.
 */
export const getStaticPaths = (async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
}) satisfies GetStaticPaths;

export const getStaticProps = (async () => ({
  props: {},
})) satisfies GetStaticProps;

const TicketPage: NextPage = () => {
  const router = useRouter();

  const userName = router.query.userName
    ? String(router.query.userName).trim()
    : undefined;

  invariant(userName !== undefined, "userName should be defined");

  const ticket = trpc.virtualTickets.getTicket.useQuery(
    { eventId, userName: userName as string },
    { enabled: !!userName, retry: 2 },
  );

  const showTicket = userName && ticket.data;

  const ogImage =
    env.NEXT_PUBLIC_BASE_URL +
    getVirtualTicketImageUrl(eventId, userName, "og");

  return (
    <>
      <Meta
        title="Alveus Fall Carnival 2023"
        description="Alveus Fall Carnival 2023 - Customize your ticket!"
      >
        {/* preload the ticket */}
        <link
          rel="preload"
          as="image"
          href={
            env.NEXT_PUBLIC_BASE_URL +
            getVirtualTicketImageUrl(eventId, userName)
          }
        />

        {ogImage && (
          <meta key="og:image" property="og:image" content={ogImage} />
        )}
        {ogImage && (
          <meta key="twitter:image" name="twitter:image" content={ogImage} />
        )}
      </Meta>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-carnival bg-gradient-to-t from-carnival to-carnival-700 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-48 select-none lg:block"
        />

        <IntroSection showLinkToClaimTicket />
      </div>

      <Section containerClassName="flex flex-col items-center text-center">
        {ticket.error && <p>Could not find ticket!</p>}
        {!ticket.error && (
          <>
            <p className="max-w-xl text-lg md:text-xl lg:text-2xl">
              {showTicket ? userName : "Someone"} already claimed their ticket{" "}
              <br />
              for the Alveus Fall Carnival 2023:
            </p>

            <Wiggle
              className="relative mx-auto my-10"
              width={ticketConfig.width}
              height={ticketConfig.height}
              maskImage={ticketConfig.maskImage}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-carnival text-2xl font-bold text-white">
                {!showTicket && <span>Loading ticket…</span>}
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={classes(
                  "relative w-full opacity-0 transition-opacity",
                  showTicket ? "block opacity-100" : "hidden",
                )}
                src={getVirtualTicketImageUrl(eventId, userName)}
                alt=""
              />
            </Wiggle>

            <p className="text-center">
              Sticker art by <StickerAttribution stickerPack={stickerPack} />.
            </p>
          </>
        )}
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -left-8 top-32 z-10 hidden h-auto w-1/3 max-w-28 -rotate-45 select-none lg:block"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -top-60 right-0 z-10 hidden h-auto w-1/2 max-w-40 select-none lg:block 2xl:-bottom-64 2xl:max-w-48"
        />

        <Activities />
      </div>
    </>
  );
};

export default TicketPage;
