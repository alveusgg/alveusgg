import type { InferGetStaticPropsType } from "next";
import { type NextPage } from "next";
import Head from "next/head";

import DefaultPageLayout from "../../components/DefaultPageLayout";
import { Headline } from "../../components/shared/Headline";
import { getNotificationsConfig } from "../../config/notifications";
import { SendNotificationForm } from "../../components/admin/SendNotificationForm";

export async function getServerSideProps() {
  return {
    props: {
      authorized: true,
      superUser: true,
      notificationConfig: await getNotificationsConfig(),
    },
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
      </DefaultPageLayout>
    </>
  );
};

export default Admin;
