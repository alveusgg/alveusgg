import React from "react";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import type { Giveaway } from "@prisma/client";

import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";
import { calcGiveawayConfig } from "@/utils/giveaways";
import { findActiveGiveaway } from "@/server/db/giveaways";

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
      <Meta
        title={`Rules | ${giveaway.label} | Giveaways`}
        description={`Rules for the ${giveaway.label} giveaway at Alveus.`}
      />

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
