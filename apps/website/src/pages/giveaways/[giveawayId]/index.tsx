import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { GiveawayEntryForm } from "../../../components/giveaway/GiveawayEntryForm";
import Heading from "../../../components/content/Heading";
import Section from "../../../components/content/Section";
import { trpc } from "../../../utils/trpc";
import { TRPCError } from "@trpc/server";

const GiveawayPage: NextPage = () => {
  const query = useRouter().query;
  const data = trpc.giveaways.getGiveaway.useQuery(
    {
      giveawaySlugOrId: String(query.giveawayId),
    },
    { enabled: query.giveawayId !== undefined }
  );
  const giveaway = data.data?.giveaway;
  const existingEntry = data.data?.existingEntry;

  return (
    <>
      <Head>
        <title>{`${
          data.data?.giveaway.label || "Alveus Giveaway"
        } | Alveus.gg`}</title>
      </Head>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow" containerClassName="max-w-lg">
        <header>
          <Heading className="my-3 text-3xl">{giveaway?.label}</Heading>
        </header>

        {data.isLoading && <p>Loading …</p>}
        {data.isError &&
          (data.error instanceof TRPCError && data.error.code === "NOT_FOUND"
            ? "Giveaway not found!"
            : "Error loading giveaway.")}

        {giveaway && existingEntry && (
          <GiveawayEntryForm
            giveaway={giveaway}
            existingEntry={existingEntry}
          />
        )}
      </Section>
    </>
  );
};

export default GiveawayPage;
