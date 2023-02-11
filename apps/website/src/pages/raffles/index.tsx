import Head from "next/head";
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";
import type { Raffle } from "@prisma/client";
import React from "react";
import { prisma } from "../../server/db/client";
import DefaultPageLayout from "../../components/DefaultPageLayout";

export type RafflesPageProps = InferGetStaticPropsType<typeof getStaticProps>;

export const getStaticProps: GetStaticProps<{
  raffles: Raffle[];
}> = async () => {
  const now = new Date().toISOString();
  const raffles = await prisma.raffle.findMany({
    where: {
      active: true,
      startAt: { lt: now },
      OR: [{ endAt: null }, { endAt: { gt: now } }],
    },
  });

  return {
    props: { raffles },
    revalidate: 60,
  };
};

const RafflesPage: NextPage<RafflesPageProps> = ({ raffles }) => {
  return (
    <>
      <Head>
        <title>Alveus Raffles | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="Raffles">
        {raffles.map((raffle) => {
          return (
            <a href={`/raffles/${raffle.id}`} key={raffle.id}>
              {raffle.label} &rarr;
            </a>
          );
        })}
      </DefaultPageLayout>
    </>
  );
};

export default RafflesPage;
