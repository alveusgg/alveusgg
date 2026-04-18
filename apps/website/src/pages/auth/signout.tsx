import type { InferGetServerSidePropsType, NextPage } from "next";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import Meta from "@/components/content/Meta";

export type SignoutPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export const getServerSideProps = async () => {
  return { props: {} };
};

const SignoutPage: NextPage<SignoutPageProps> = () => {
  const router = useRouter();
  const callbackUrl =
    typeof router.query.callbackUrl === "string"
      ? router.query.callbackUrl
      : "/";

  const startedSignOutRef = useRef<Promise<void> | undefined>(undefined);
  useEffect(() => {
    if (startedSignOutRef.current) {
      return;
    }
    startedSignOutRef.current = signOut().then(() => {
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
