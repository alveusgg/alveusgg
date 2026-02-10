import { Field, Label, Switch } from "@headlessui/react";
import { type GetStaticPaths, type GetStaticProps, type NextPage } from "next";
import Image from "next/image";
import { useState } from "react";

import newsletters, { type Newsletter } from "@/data/newsletters";

import { classes } from "@/utils/classes";
import { formatDateTime } from "@/utils/datetime";
import { getImageSrc } from "@/utils/image";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Transparency from "@/components/content/Transparency";

import IconArrowRight from "@/icons/IconArrowRight";
import IconLoading from "@/icons/IconLoading";

type NewsletterDatePageProps = {
  newsletter: Newsletter;
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: newsletters.map(({ date }) => ({
      params: { date },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<NewsletterDatePageProps> = async (
  context,
) => {
  const newsletter = newsletters.find(
    (newsletter) => newsletter.date === context.params?.date,
  );
  if (!newsletter) return { notFound: true };

  return {
    props: {
      newsletter,
    },
  };
};

const NewsletterDatePage: NextPage<NewsletterDatePageProps> = ({
  newsletter,
}) => {
  const dateFormatted = formatDateTime(new Date(newsletter.date), {
    style: "long",
  });
  const [graphic, setGraphic] = useState(true);

  return (
    <>
      <Meta
        title={`${dateFormatted} | Newsletter Archive`}
        description={newsletter.subject}
        image={getImageSrc(newsletter.image)}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-start"
      >
        <div>
          <Heading>{newsletter.subject}</Heading>

          <p className="flex items-center justify-between gap-2">
            <span>
              <span className="text-sm opacity-75">From</span>{" "}
              {newsletter.sender}
            </span>
            <span>
              <span className="text-sm opacity-75">Sent</span> {dateFormatted}
            </span>
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button href="/newsletters" dark>
            Read other newsletters
          </Button>

          <Field className="-mx-4 flex items-center text-sm leading-none">
            <button
              className="px-4 py-1"
              type="button"
              onClick={() => setGraphic(false)}
            >
              Text
            </button>

            <Label className="sr-only">Show newsletter graphic</Label>
            <Switch
              checked={graphic}
              onChange={setGraphic}
              className="group inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-alveus-green-300 transition-colors data-checked:bg-alveus-tan"
            >
              <span className="size-4 translate-x-1 rounded-full bg-alveus-green transition-transform group-data-checked:translate-x-6" />
            </Switch>

            <button
              className="px-4 py-1"
              type="button"
              onClick={() => setGraphic(true)}
            >
              Graphic
            </button>
          </Field>
        </div>
      </Section>

      <Section containerClassName="flex flex-col gap-16 items-center">
        {graphic && (
          <Box
            dark
            className="w-full max-w-3xl p-0"
            ringClassName="ring-black/15"
          >
            <IconLoading className="absolute top-1/2 left-1/2 -z-10 -translate-1/2" />
            <Image
              src={newsletter.image}
              quality={90}
              width={768}
              className="h-auto w-full"
              alt="Newsletter graphic"
              aria-describedby="newsletter"
            />
          </Box>
        )}

        <div
          className={classes("flex flex-col gap-8", graphic && "sr-only")}
          id="newsletter"
        >
          {newsletter.alt.map((paragraph, i) => (
            <Box
              key={i}
              dark
              className={classes(
                "lg:max-w-2/3",
                i % 2 === 0 && "lg:ml-auto",
                paragraph === paragraph.toUpperCase()
                  ? "mx-auto px-8 py-4"
                  : "p-4 lg:w-full",
              )}
            >
              <p
                className={classes(
                  paragraph === paragraph.toUpperCase() &&
                    "text-center text-xl font-bold",
                )}
              >
                {paragraph}
              </p>
            </Box>
          ))}
        </div>

        <Button
          href={newsletter.cta.href}
          external
          filled
          className="inline-flex items-center gap-2 text-xl"
        >
          {newsletter.cta.text} <IconArrowRight size={20} className="mt-0.5" />
        </Button>
      </Section>

      {/* Grow the last section to cover the page */}
      <Transparency className="grow" />
    </>
  );
};

export default NewsletterDatePage;
