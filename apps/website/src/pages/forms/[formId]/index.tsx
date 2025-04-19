import type {
  NextPage,
  InferGetServerSidePropsType,
  GetServerSideProps,
} from "next";
import { getSession } from "next-auth/react";

import type { Form, FormEntry, MailingAddress } from "@/server/db/client";
import { findActiveForm, getFormEntry } from "@/server/db/forms";

import { EntryForm } from "@/components/forms/EntryForm";
import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";
import { MessageBox } from "@/components/shared/MessageBox";

export type FormPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export type FormEntryWithAddress = FormEntry & {
  mailingAddress: MailingAddress | null;
};

export const getServerSideProps: GetServerSideProps<
  { form: Form } & (
    | { error: string }
    | { existingEntry: FormEntryWithAddress | null }
  )
> = async (context) => {
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

  // Require active session or redirect to log in
  let existingEntry: FormEntryWithAddress | null = null;
  const session = await getSession(context);
  if (session?.user?.id) {
    try {
      existingEntry = await getFormEntry(session.user.id, form.id);
    } catch (e) {
      console.error(e);
      return {
        props: { form, error: "Unknown error" },
      };
    }
  }

  return {
    props: { form, existingEntry },
  };
};

const FormPage: NextPage<FormPageProps> = ({ form, ...props }) => (
  <>
    <Meta
      title={form.label}
      description={`Check out the ${form.label} form at Alveus.`}
      noindex
    />

    {/* Nav background */}
    <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

    {"error" in props ? (
      <>
        {/* Grow the last section to cover the page */}
        <Section className="grow" containerClassName="max-w-lg">
          <header>
            <Heading className="my-3 text-3xl">{form.label}</Heading>
          </header>

          <MessageBox variant="failure">{props.error}</MessageBox>
        </Section>
      </>
    ) : (
      <EntryForm form={form} existingEntry={props.existingEntry} />
    )}
  </>
);

export default FormPage;
