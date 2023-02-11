import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { getProviders, getSession, signIn } from "next-auth/react";

import { XCircleIcon } from "@heroicons/react/20/solid";

import DefaultPageLayout from "../../components/DefaultPageLayout";

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
    <DefaultPageLayout title="Sign in">
      <>
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

        {providers &&
          Object.values(providers)
            .filter(({ type }) => type === "oauth")
            .map((provider) => (
              <div key={provider.id}>
                <button
                  type="button"
                  className="rounded border bg-white p-5"
                  onClick={() => signIn(provider.id, { callbackUrl })}
                >
                  <Image
                    src={`/assets/auth-provider-logos/${provider.id}.svg`}
                    width={50}
                    height={50}
                    alt=""
                  />
                  <span>Sign in with {provider.name}</span>
                </button>
              </div>
            ))}
      </>
    </DefaultPageLayout>
  );
};

export default SigninPage;
