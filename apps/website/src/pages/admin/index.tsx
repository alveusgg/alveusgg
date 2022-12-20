import type { InferGetStaticPropsType, NextPageContext } from "next";
import { type NextPage } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";

import DefaultPageLayout from "../../components/DefaultPageLayout";
import { checkIsSuperUser } from "../../utils/auth";
import { Headline } from "../../components/shared/Headline";
import { getNotificationsConfig } from "../../config/notifications";
import { SendNotificationForm } from "../../components/admin/SendNotificationForm";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (checkIsSuperUser(session)) {
    return {
      props: {
        authorized: true,
        superUser: true,
        notificationConfig: await getNotificationsConfig(),
      },
    };
  }

  return {
    notFound: true,
  };
}

const Admin: NextPage<InferGetStaticPropsType<typeof getServerSideProps>> = ({
  notificationConfig,
}) => {
  return (
    <>
      <Head>
        <title>Admin | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="Admin">
        <Headline>Actions</Headline>

        <h3>Send a notification</h3>
        <SendNotificationForm notificationConfig={notificationConfig} />

        <p>Run actions manually …</p>

        <hr />

        <Headline>Twitch Channels</Headline>
        <p>Manage twitch channels …</p>

        <Headline>Discord Webhooks</Headline>
        <p>Add discord channel webhooks to post notification messages …</p>
      </DefaultPageLayout>
    </>
  );
};

export default Admin;
