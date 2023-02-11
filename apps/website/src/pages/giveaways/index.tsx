import Head from "next/head";
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";
import type { Giveaway } from "@prisma/client";
import React from "react";
import { prisma } from "../../server/db/client";
import DefaultPageLayout from "../../components/DefaultPageLayout";
import Section from "../../components/content/Section"
import Heading from "../../components/content/Heading"
import Link from "next/link"

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

      <Section className="flex-grow">
        <header>
          <Heading className="my-3 text-3xl">Giveaways</Heading>
        </header>

        <ul>
          {giveaways.map(giveaway => (
            <li key={giveaway.id}>
              <Link
                className="group hover:text-alveus-green transition-colors"
                href={`/giveaways/${giveaway.slug || giveaway.id}`}
              >
                {giveaway.label}
                {' '}
                <span className="inline-block group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
};

export default GiveawaysPage;
