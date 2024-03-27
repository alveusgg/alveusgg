import type {
  InferGetServerSidePropsType,
  NextPage,
  NextPageContext,
} from "next";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import IconXCircle from "@/icons/IconXCircle";

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

export const getServerSideProps = async (context: NextPageContext) => {
  const session = await getSession(context);

  if (!session?.user?.isSuperUser) {
    return {
      props: { message: "You are not authorized to view that page" },
    };
  }

  return { props: {} };
};

const SigninPage: NextPage<SigninPageProps> = ({ message }) => {
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
      <Meta title="Sign In" description="Sign in to your account." />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        {message ? (
          <Heading className="my-2 text-xl text-red-600">{message}</Heading>
        ) : (
          ""
        )}
        <Heading className="my-3 text-3xl">Sign in</Heading>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <IconXCircle
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
