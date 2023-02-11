import React from "react";
import type {
  NextPage,
  InferGetServerSidePropsType,
  GetServerSideProps,
} from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";
import type { Raffle, RaffleEntry } from "@prisma/client";

import { prisma } from "../../server/db/client";

import DefaultPageLayout from "../../components/DefaultPageLayout";
import { RaffleEntryForm } from "../../components/RaffleEntryForm";

export type RafflePageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export const getServerSideProps: GetServerSideProps<{
  raffle: Raffle;
  existingEntry: RaffleEntry | null;
}> = async (context) => {
  // Check params
  const raffleSlugOrId = context.params?.raffleId;
  if (typeof raffleSlugOrId !== "string") {
    return {
      notFound: true,
    };
  }

  // Find the raffle
  const raffle = await prisma.raffle.findFirst({
    where: {
      OR: [{ id: raffleSlugOrId }, { slug: raffleSlugOrId }],
    },
  });
  if (!raffle) {
    return {
      notFound: true,
    };
  }

  // Require active session or redirect to log in
  let existingEntry = null;
  const session = await getSession(context);
  if (session?.user?.id) {
    existingEntry = await prisma.raffleEntry.findUnique({
      where: {
        raffleId_userId: {
          userId: session.user.id,
          raffleId: raffle.id,
        },
      },
    });
  }

  return {
    props: { raffle, existingEntry },
  };
};

const RafflePage: NextPage<RafflePageProps> = ({ raffle, existingEntry }) => {
  return (
    <>
      <Head>
        <title>Alveus Raffle {raffle.label} | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title={raffle.label}>
        <div className="max-w-[500px]">
          <RaffleEntryForm raffle={raffle} existingEntry={existingEntry} />
        </div>
      </DefaultPageLayout>
    </>
  );
};

export default RafflePage;
