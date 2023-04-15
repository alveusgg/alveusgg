import React from "react";
import type {
  NextPage,
  InferGetServerSidePropsType,
  GetServerSideProps,
} from "next";
import { getSession } from "next-auth/react";
import type { Giveaway, GiveawayEntry, MailingAddress } from "@prisma/client";

import { findActiveGiveaway, getGiveawayEntry } from "@/server/db/giveaways";
import { GiveawayEntryForm } from "@/components/giveaway/GiveawayEntryForm";
import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";
import { MessageBox } from "@/components/shared/MessageBox";

export type GiveawayPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export type GiveawayEntryWithAddress = GiveawayEntry & {
  mailingAddress: MailingAddress | null;
};

export const getServerSideProps: GetServerSideProps<
  { giveaway: Giveaway } & (
    | { error: string }
    | { existingEntry: GiveawayEntryWithAddress | null }
  )
> = async (context) => {
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

  // Require active session or redirect to log in
  let existingEntry: GiveawayEntryWithAddress | null = null;
  const session = await getSession(context);
  if (session?.user?.id) {
    try {
      existingEntry = await getGiveawayEntry(session.user.id, giveaway.id);
    } catch (e) {
      return {
        props: { giveaway, error: "Unknown error" },
      };
    }
  }

  return {
    props: { giveaway, existingEntry },
  };
};

const GiveawayPage: NextPage<GiveawayPageProps> = ({ giveaway, ...props }) => (
  <>
    <Meta
      title={`${giveaway.label} | Giveaways`}
      description={`Check out the ${giveaway.label} giveaway at Alveus.`}
    />

    {/* Nav background */}
    <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

    {/* Grow the last section to cover the page */}
    <Section className="flex-grow" containerClassName="max-w-lg">
      <header>
        <Heading className="my-3 text-3xl">{giveaway.label}</Heading>
      </header>

      {"error" in props ? (
        <MessageBox variant="failure">{props.error}</MessageBox>
      ) : (
        <GiveawayEntryForm
          giveaway={giveaway}
          existingEntry={props.existingEntry}
        />
      )}
    </Section>
  </>
);

export default GiveawayPage;
