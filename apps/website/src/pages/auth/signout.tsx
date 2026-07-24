import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

import { isAllowedRedirectUri } from "@/server/oauth/config";

import Meta from "@/components/content/Meta";

export type SignoutPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

function getQueryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const getServerSideProps: GetServerSideProps<{
  callbackUrl: string;
}> = async (context) => {
  const clientId = getQueryString(context.query.clientId);
  const callbackUrl = getQueryString(context.query.callbackUrl);

  if (!clientId || !callbackUrl) {
    return {
      props: {
        callbackUrl: "/",
      },
    };
  }

  if (!isAllowedRedirectUri(clientId, callbackUrl)) {
    return {
      props: {
        callbackUrl: "/",
      },
    };
  }

  return { props: { callbackUrl } };
};

const SignoutPage: NextPage<SignoutPageProps> = ({ callbackUrl }) => {
  const startedSignOutRef = useRef<Promise<void> | undefined>(undefined);
  useEffect(() => {
    if (startedSignOutRef.current) {
      return;
    }
    startedSignOutRef.current = signOut({ redirect: false }).then(() => {
      window.location.href = callbackUrl;
    });
  }, [callbackUrl]);

  return (
    <>
      <Meta title="Sign out" description="Sign out of your account." />
    </>
  );
};

export default SignoutPage;
