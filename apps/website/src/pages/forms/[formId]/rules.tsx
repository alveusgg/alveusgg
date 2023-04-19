import React from "react";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import type { Form } from "@prisma/client";

import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";
import { calcFormConfig } from "@/utils/forms";
import { findActiveForm } from "@/server/db/forms";
import Markdown from "@/components/content/Markdown";

export type FormPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export const getServerSideProps: GetServerSideProps<{
  form: Form;
  rules: string;
}> = async (context) => {
  // Check params
  const formSlugOrId = context.params?.formId;
  if (typeof formSlugOrId !== "string") {
    return {
      notFound: true,
    };
  }

  // Find the forms
  const form = await findActiveForm(formSlugOrId);
  if (!form) {
    return {
      notFound: true,
    };
  }

  const config = calcFormConfig(form.config);
  if (!config.hasRules || !config.rules) {
    return {
      notFound: true,
    };
  }

  return {
    props: { form, rules: config.rules },
  };
};

const FormPage: NextPage<FormPageProps> = ({ form, rules }) => {
  return (
    <>
      <Meta
        title={`Rules | ${form.label} | Forms`}
        description={`Rules for the ${form.label} form at Alveus.`}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <header>
          <Heading className="my-3 text-3xl">Rules - {form.label}</Heading>
        </header>

        <Markdown content={rules} />
      </Section>
    </>
  );
};

export default FormPage;
