import Head from "next/head";
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";
import type { Giveaway } from "@prisma/client";
import React from "react";
import { prisma } from "../../server/db/client";
import DefaultPageLayout from "../../components/DefaultPageLayout";

export type GiveawaysPageProps = InferGetStaticPropsType<typeof getStaticProps>;

export const getStaticProps: GetStaticProps<{
  giveaways: Giveaway[];
}> = async () => {
  const now = new Date().toISOString();
  const giveaways = await prisma.giveaway.findMany({
    where: {
      active: true,
      showInLists: true,
      startAt: { lt: now },
      OR: [{ endAt: null }, { endAt: { gt: now } }],
    },
  });

  return {
    props: { giveaways },
    revalidate: 60,
  };
};

const GiveawaysPage: NextPage<GiveawaysPageProps> = ({ giveaways }) => {
  return (
    <>
      <Head>
        <title>Alveus Giveaways | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="Giveaways">
        {giveaways.map((giveaway) => {
          return (
            <a
              href={`/giveaways/${giveaway.slug || giveaway.id}`}
              key={giveaway.id}
            >
              {giveaway.label} &rarr;
            </a>
          );
        })}
      </DefaultPageLayout>
    </>
  );
};

export default GiveawaysPage;
