import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import { getProviders, getSession } from "next-auth/react";

import { XCircleIcon } from "@heroicons/react/20/solid";

import React from "react";
import Section from "../../components/content/Section";
import Heading from "../../components/content/Heading";
import Head from "next/head";
import { LoginWithTwitchButton } from "../../components/shared/LoginWithTwitchButton";

const errorMessages: Record<string, string> = {
  default: "Unable to sign in.",
  signin: "Try signing in with a different account.",
  oauthsignin: "Try signing in with a different account.",
  oauthcallback: "Try signing in with a different account.",
  oauthcreateaccount: "Try signing in with a different account.",
  emailcreateaccount: "Try signing in with a different account.",
  callback: "Try signing in with a different account.",
  oauthaccountnotlinked:
    "To confirm your identity, sign in with the same account you used originally.",
  emailsignin: "The e-mail could not be sent.",
  credentialssignin:
    "Sign in failed. Check the details you provided are correct.",
  sessionrequired: "Please sign in to access this page.",
};

export type SigninPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export const getServerSideProps: GetServerSideProps<{
  providers: Awaited<ReturnType<typeof getProviders>>;
}> = async (context) => {
  const session = await getSession(context);

  if (session?.user?.id) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  return {
    props: {
      providers: await getProviders(),
    },
  };
};

const SigninPage: NextPage<SigninPageProps> = ({ providers }) => {
  const router = useRouter();
  const errorType =
    typeof router.query.error === "string" ? router.query.error : undefined;
  const callbackUrl =
    typeof router.query.callbackUrl === "string"
      ? router.query.callbackUrl
      : undefined;

  const error =
    (errorType && errorMessages[errorType.toLowerCase()]) ||
    errorMessages["default"];

  return (
    <>
      <Head>
        <title>Sign In | Alveus.gg</title>
      </Head>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Heading className="my-3 text-3xl">Sign in</Heading>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error signing in
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <LoginWithTwitchButton callbackUrl={callbackUrl} />
      </Section>
    </>
  );
};

export default SigninPage;
