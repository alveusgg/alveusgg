import React from "react";
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";
import Link from "next/link";

import type { Giveaway } from "@prisma/client";
import { prisma } from "@/server/db/client";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

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
      <Meta
        title="Giveaways"
        description="Check out the latest giveaways at Alveus."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <header>
          <Heading className="my-3 text-3xl">Giveaways</Heading>
        </header>

        {giveaways.length ? (
          <ul>
            {giveaways.map((giveaway) => (
              <li key={giveaway.id}>
                <Link
                  className="group transition-colors hover:text-alveus-green"
                  href={`/giveaways/${giveaway.slug || giveaway.id}`}
                >
                  {giveaway.label}{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>There are currently no open giveaways.</p>
        )}
      </Section>
    </>
  );
};

export default GiveawaysPage;
