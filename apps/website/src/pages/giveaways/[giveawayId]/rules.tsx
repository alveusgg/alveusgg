import React from "react";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import type { Giveaway } from "@prisma/client";

import DefaultPageLayout from "../../../components/DefaultPageLayout";
import { Headline } from "../../../components/shared/Headline";
import { prisma } from "../../../server/db/client";

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

const GiveawayPage: NextPage<GiveawayPageProps> = ({ giveaway }) => (
  <>
    <Head>
      <title>{`Rules ${giveaway.label} | Alveus.gg`}</title>
    </Head>

    <DefaultPageLayout title={giveaway.label}>
      <div className="max-w-[500px]">
        <Headline>Rules</Headline>
        <p>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
          ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
          sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
          dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
          et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
          takimata sanctus est Lorem ipsum dolor sit amet.
        </p>
      </div>
    </DefaultPageLayout>
  </>
);

export default GiveawayPage;
