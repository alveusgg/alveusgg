import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";
import Link from "next/link";

import { prisma, type Form } from "@/server/db/client";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

export type FormsPageProps = InferGetStaticPropsType<typeof getStaticProps>;

export const getStaticProps: GetStaticProps<{
  forms: Form[];
}> = async () => {
  const now = new Date().toISOString();
  const forms = await prisma.form.findMany({
    where: {
      active: true,
      showInLists: true,
      startAt: { lt: now },
      OR: [{ endAt: null }, { endAt: { gt: now } }],
    },
  });

  return {
    props: { forms },
    revalidate: 60,
  };
};

const FormsPage: NextPage<FormsPageProps> = ({ forms }) => {
  return (
    <>
      <Meta
        title="Forms"
        description="Check out the latest forms at Alveus."
        noindex
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        <header>
          <Heading className="my-3 text-3xl">Forms</Heading>
        </header>

        {forms.length ? (
          <ul>
            {forms.map((form) => (
              <li key={form.id}>
                <Link
                  className="group transition-colors hover:text-alveus-green"
                  href={`/forms/${form.slug || form.id}`}
                >
                  {form.label}{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>There are currently no open forms.</p>
        )}
      </Section>
    </>
  );
};

export default FormsPage;
