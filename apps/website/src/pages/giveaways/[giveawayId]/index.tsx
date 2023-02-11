import React from "react";
import type {
  NextPage,
  InferGetServerSidePropsType,
  GetServerSideProps,
} from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";
import type { Giveaway, GiveawayEntry } from "@prisma/client";

import { prisma } from "../../../server/db/client";

import DefaultPageLayout from "../../../components/DefaultPageLayout";
import { GiveawayEntryForm } from "../../../components/GiveawayEntryForm";

export type GiveawayPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export const getServerSideProps: GetServerSideProps<{
  giveaway: Giveaway;
  existingEntry: GiveawayEntry | null;
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

  // Require active session or redirect to log in
  let existingEntry = null;
  const session = await getSession(context);
  if (session?.user?.id) {
    existingEntry = await prisma.giveawayEntry.findUnique({
      where: {
        giveawayId_userId: {
          userId: session.user.id,
          giveawayId: giveaway.id,
        },
      },
    });
  }

  return {
    props: { giveaway, existingEntry },
  };
};

const GiveawayPage: NextPage<GiveawayPageProps> = ({
  giveaway,
  existingEntry,
}) => (
  <>
    <Head>
      <title>{`${giveaway.label} | Alveus.gg`}</title>
    </Head>

    <DefaultPageLayout title={giveaway.label}>
      <div className="max-w-[500px]">
        <GiveawayEntryForm giveaway={giveaway} existingEntry={existingEntry} />
      </div>
    </DefaultPageLayout>
  </>
);

export default GiveawayPage;
