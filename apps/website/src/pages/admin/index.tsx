import type { NextPageContext } from "next";
import { type NextPage } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";

import DefaultPageLayout from "../../components/DefaultPageLayout";
import { checkIsSuperUser } from "../../utils/auth";
import { Headline } from "../../components/shared/Headline";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (checkIsSuperUser(session)) {
    return {
      props: {
        authorized: true,
        superUser: true,
      },
    };
  }

  return {
    notFound: true,
  };
}

const Admin: NextPage = () => {
  return (
    <>
      <Head>
        <title>Admin | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="Admin">
        <Headline>Twitch Channels</Headline>
        <p>Add channel webhooks to post notification messages …</p>

        <Headline>Discord Webhooks</Headline>
        <p>Add channel webhooks to post notification messages …</p>

        <Headline>Actions</Headline>
        <p>Run actions manually …</p>
      </DefaultPageLayout>
    </>
  );
};

export default Admin;
