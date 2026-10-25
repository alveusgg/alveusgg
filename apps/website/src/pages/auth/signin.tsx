import type { ParsedUrlQuery } from "node:querystring";

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";

import { enabledLoginProviders } from "@/server/auth/providers";
import { getOAuthClient } from "@/server/oauth/config";

import { type LoginProvider, loginProviders } from "@/data/auth";

import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { Button } from "@/components/shared/form/Button";

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
  callbackUrl: string,
): ThirdPartyClient | undefined {
  const parsed = URL.parse(callbackUrl, "http://localhost");

  const clientId = parsed?.searchParams.get("client_id");
  const client = clientId ? getOAuthClient(clientId) : undefined;
  if (!client) return undefined;

  return {
    clientId: client.clientId,
    name: client.name,
  };
}

function getBannerFromQuery(query: ParsedUrlQuery) {
  const errorType = typeof query.error === "string" ? query.error : undefined;
  if (!errorType && query.mode !== "oauth") return null;
  const message =
    (errorType && messages[errorType.toLowerCase()]) ?? messages["default"]!;

  return { type: "error", message };
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const session = await getSession(context);

  if (session?.user?.id) {
    return {
      redirect: {
        permanent: false,
        destination: context.query.error
          ? "/account/connections?error=auth-failed"
          : "/",
      },
    };
  }

  const callbackUrl =
    typeof context.query.callbackUrl === "string"
      ? context.query.callbackUrl
      : undefined;

  const isOAuthMode = context.query.mode === "oauth";
  if (isOAuthMode) {
    const thirdPartyClient = callbackUrl && getThirdPartyClient(callbackUrl);

    if (thirdPartyClient) {
      return {
        props: {
          mode: "oauth",
          callbackUrl,
          thirdPartyClient,
          providers: enabledLoginProviders,
        },
      };
    }

    // Invalid OAuth input falls through to the sign-in error page below.
    context.res.statusCode = 400;
  }

  return {
    props: {
      mode: "error",
      banner: getBannerFromQuery(context.query),
      callbackUrl: isOAuthMode ? undefined : callbackUrl,
      providers: enabledLoginProviders,
    },
  };
};

function LoginChoices({
  providers,
  callbackUrl,
}: {
  providers: LoginProvider[];
  callbackUrl?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {providers.map((provider) => (
        <Button
          key={provider}
          onClick={() => signIn(provider, { callbackUrl })}
        >
          Continue with {loginProviders[provider]}
        </Button>
      ))}
      <p className="text-sm">
        Already have an account? Use your original login, then connect another
        provider in account settings.
      </p>
    </div>
  );
}

const SigninPage: NextPage<SigninPageProps> = (props) => {
  if (props.mode === "oauth" && props.thirdPartyClient && props.callbackUrl) {
    return (
      <>
        <Meta
          title={`Sign in to ${props.thirdPartyClient.name}`}
          description={`Sign in to authorize ${props.thirdPartyClient.name} to access your Alveus Sanctuary account.`}
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
                  {props.thirdPartyClient.name}
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
                      Sign in to continue. You will be returned to{" "}
                      <strong className="font-semibold">
                        {props.thirdPartyClient.name}
                      </strong>{" "}
                      once you&apos;re authenticated.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <LoginChoices
                  providers={props.providers}
                  callbackUrl={props.callbackUrl}
                />
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

        {props.mode === "error" &&
          props.banner &&
          props.banner.type === "error" && (
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
                    <p>{props.banner.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        <div className="max-w-md">
          <LoginChoices
            providers={props.providers}
            callbackUrl={props.callbackUrl}
          />
        </div>
      </Section>
    </>
  );
};

export default SigninPage;
