import React from "react";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import type { Giveaway } from "@prisma/client";

import Heading from "../../../components/content/Heading";
import Section from "../../../components/content/Section";
import { prisma } from "../../../server/db/client";
import { calcGiveawayConfig } from "../../../utils/giveaways";

async function findActiveGiveaway(giveawaySlugOrId: string) {
  const now = new Date();
  return await prisma.giveaway.findFirst({
    where: {
      active: true,
      startAt: { lt: now },
      AND: [
        { OR: [{ endAt: null }, { endAt: { gt: now } }] },
        { OR: [{ id: giveawaySlugOrId }, { slug: giveawaySlugOrId }] },
      ],
    },
  });
}

export type GiveawayPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export const getServerSideProps: GetServerSideProps<{
  giveaway: Giveaway;
}> = async (context) => {
  // Check params
  const giveawaySlugOrId = context.params?.giveawayId;
  if (typeof giveawaySlugOrId !== "string") {
    return {
      notFound: true,
    };
  }

  // Find the giveaway
  const giveaway = await findActiveGiveaway(giveawaySlugOrId);
  if (!giveaway) {
    return {
      notFound: true,
    };
  }

  return {
    props: { giveaway },
  };
};

const GiveawayPage: NextPage<GiveawayPageProps> = ({ giveaway }) => {
  const config = calcGiveawayConfig(giveaway.config);

  return (
    <>
      <Head>
        <title>{`Rules - ${giveaway.label} | Alveus.gg`}</title>
      </Head>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <header>
          <Heading className="my-3 text-3xl">Rules - {giveaway.label}</Heading>
        </header>

        <div
          className="alveus-ugc"
          dangerouslySetInnerHTML={{ __html: config.rulesHTML || "…" }}
        />
      </Section>
    </>
  );
};

export default GiveawayPage;
