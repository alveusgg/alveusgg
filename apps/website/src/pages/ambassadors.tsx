import type { InferGetStaticPropsType } from "next";
import { type NextPage } from "next";
import Head from "next/head";

import DefaultPageLayout from "../components/DefaultPageLayout";
import fetch from "node-fetch";
import { z } from "zod";
import { formatDistanceToNow, parse } from "date-fns";
import React from "react";

const ambassadorSchema = z.object({
  name: z.string(),
  species: z.string(),
  img: z.object({
    src: z.string(),
    altText: z.string(),
  }),
  scientificName: z.string(),
  sex: z.string(),
  dateOfBirth: z.union([
    z.string().length(0),
    z.string().regex(/\d{4}-\d{2}-\d{2}/),
  ]),
  iucnStatus: z.string(),
  story: z.string(),
  conservationMission: z.string(),
});

const ambassadorsSchema = z.array(ambassadorSchema);

export async function getStaticProps() {
  const ambassadorsRes = await fetch(
    "https://alveusgg.github.io/data/ambassadors.json"
  );
  const ambassadors = await ambassadorsSchema.safeParseAsync(
    await ambassadorsRes.json()
  );

  return {
    props: {
      ambassadors,
    },
  };
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function AmbassadorDefinition({
  term,
  children,
}: {
  term: string | JSX.Element;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="mt-4 mb-2 font-bold">{term}</dt>
      <dd className="my-2">{children}</dd>
    </>
  );
}

function Ambassador({
  ambassador,
}: {
  ambassador: z.infer<typeof ambassadorSchema>;
}) {
  const dateOfBirth = ambassador.dateOfBirth
    ? parse(ambassador.dateOfBirth, "yyyy-mm-dd", new Date())
    : null;

  return (
    <article
      key={ambassador.name}
      className="w-full rounded-2xl bg-alveus-green px-6 py-4 text-white shadow-xl md:w-1/2 lg:w-1/3 xl:w-1/5"
    >
      <h3 className="text-bold mb-3 font-serif text-3xl">{ambassador.name}</h3>

      <dl>
        <AmbassadorDefinition term="Species">
          <strong>{ambassador.species}</strong>
          <em className="text-italic">{ambassador.scientificName}</em>
        </AmbassadorDefinition>
        <AmbassadorDefinition term="Sex">{ambassador.sex}</AmbassadorDefinition>
        <AmbassadorDefinition term="Age">
          {dateOfBirth ? formatDistanceToNow(dateOfBirth) : "Unknown"}
        </AmbassadorDefinition>
        <AmbassadorDefinition term="Birthday">
          {dateOfBirth ? dateFormatter.format(dateOfBirth) : "Unknown"}
        </AmbassadorDefinition>
        <AmbassadorDefinition term="IUCN Status">
          {ambassador.iucnStatus}
        </AmbassadorDefinition>
        <AmbassadorDefinition term="Story">
          {ambassador.story}
        </AmbassadorDefinition>
        <AmbassadorDefinition term="Conservation Missing">
          {ambassador.conservationMission}
        </AmbassadorDefinition>
      </dl>
    </article>
  );
}

const AmbassadorsPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ ambassadors }) => {
  return (
    <>
      <Head>
        <title>Ambassadors | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="About">
        <section className="flex w-full flex-wrap gap-5">
          {ambassadors.success &&
            ambassadors.data.map((ambassador) => (
              <Ambassador key={ambassador.name} ambassador={ambassador} />
            ))}
        </section>
      </DefaultPageLayout>
    </>
  );
};

export default AmbassadorsPage;
