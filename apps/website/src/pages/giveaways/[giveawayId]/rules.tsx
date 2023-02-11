import React from "react";
import type {
  NextPage,
  InferGetServerSidePropsType,
  GetServerSideProps,
} from "next";
import Head from "next/head";
import type { Giveaway } from "@prisma/client";

import { prisma } from "../../../server/db/client";
import DefaultPageLayout from "../../../components/DefaultPageLayout";
import { Headline } from "../../../components/shared/Headline";

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
  const giveaway = await prisma.giveaway.findFirst({
    where: {
      OR: [{ id: giveawaySlugOrId }, { slug: giveawaySlugOrId }],
    },
  });
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
