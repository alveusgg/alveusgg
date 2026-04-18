import type { ParsedUrlQuery } from "node:querystring";

import type {
  InferGetServerSidePropsType,
  NextPage,
  NextPageContext,
} from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";

import { getOAuthClient } from "@/server/oauth/config";

import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";

import IconInformationCircle from "@/icons/IconInformationCircle";
import IconXCircle from "@/icons/IconXCircle";

const messages: Record<string, string> = {
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

type ThirdPartyClient = {
  clientId: string;
  name: string;
};

export type SigninPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

function getThirdPartyClient(
  callbackUrl: string | undefined,
): ThirdPartyClient | null {
  if (!callbackUrl) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(callbackUrl, "http://localhost");
  } catch {
    return null;
  }

  const clientId = parsed.searchParams.get("client_id");
  if (!clientId) {
    return null;
  }

  const client = getOAuthClient(clientId);
  if (!client) {
    return null;
  }

  return {
    clientId: client.clientId,
    name: client.name,
  };
}

export const getServerSideProps = async (context: NextPageContext) => {
  const session = await getSession(context);

  if (session?.user?.id) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const callbackUrl =
    typeof context.query.callbackUrl === "string"
      ? context.query.callbackUrl
      : undefined;

  const mode = typeof context.query.mode === "string" ? context.query.mode : "";
  if (mode === "oauth") {
    const thirdPartyClient = getThirdPartyClient(callbackUrl);
    return { props: { thirdPartyClient, callbackUrl } };
  }

  return { props: { callbackUrl, banner: getBannerFromQuery(context.query) } };
};

const getBannerFromQuery = (query: ParsedUrlQuery) => {
  const errorType = typeof query.error === "string" ? query.error : undefined;
  if (errorType) {
    const errorMessage = messages[errorType.toLowerCase()] ?? messages.default;

    return {
      type: "error",
      message: errorMessage,
    };
  }

  return {
    type: "error",
    message: messages.default,
  };
};

const SigninPage: NextPage<SigninPageProps> = ({
  thirdPartyClient,
  callbackUrl,
  banner,
}) => {
  if (thirdPartyClient && callbackUrl) {
    return (
      <>
        <Meta
          title={`Sign in to ${thirdPartyClient.name}`}
          description={`Sign in to authorize ${thirdPartyClient.name} to access your Alveus Sanctuary account.`}
        />

        {/* Nav background */}
        <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

        {/* Grow the last section to cover the page */}
        <Section className="grow">
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-alveus-green/20 bg-alveus-tan/60 p-8 shadow-lg backdrop-blur-sm">
              <Heading className="my-0 text-center text-3xl">
                Authorize access
              </Heading>

              <p className="mt-4 text-center text-base text-alveus-green-900">
                <strong className="font-semibold">
                  {thirdPartyClient.name}
                </strong>{" "}
                wants to access your Alveus Sanctuary account.
              </p>

              <div className="mt-6 rounded-md bg-alveus-green-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <IconInformationCircle
                      className="size-5 text-alveus-green"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 text-sm text-alveus-green-900">
                    <p>
                      Sign in with Twitch to continue. You will be returned to{" "}
                      <strong className="font-semibold">
                        {thirdPartyClient.name}
                      </strong>{" "}
                      once you&apos;re authenticated.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <LoginWithTwitchButton callbackUrl={callbackUrl} />
                <Link
                  href="/"
                  className="text-center text-sm text-alveus-green-900 underline-offset-2 hover:underline"
                >
                  Cancel and return home
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <Meta title="Sign In" description="Sign in to your account." />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        <Heading className="my-3 text-3xl">Sign in</Heading>

        {banner && banner.type === "error" && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <IconXCircle
                  className="size-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error signing in
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{banner.message}</p>
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
