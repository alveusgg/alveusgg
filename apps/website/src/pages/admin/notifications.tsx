import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";
import Head from "next/head";

import { getAdminSSP } from "@/server/utils/admin";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { SendNotificationForm } from "@/components/admin/SendNotificationForm";
import { getNotificationsConfig } from "@/config/notifications";
import { permissions } from "@/config/permissions";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(
    context,
    permissions.manageNotifications
  );
  if (!adminProps) {
    return { notFound: true };
  }

  const notificationConfig = await getNotificationsConfig();
  return { props: { ...adminProps, notificationConfig } };
}

const AdminNotificationsPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, notificationConfig }) => {
  return (
    <>
      <Head>
        <title>Admin Notifications | Alveus.gg</title>
      </Head>

      <AdminPageLayout title="Notifications" menuItems={menuItems}>
        <Headline>
          Send a notification{" "}
          <span className="font-semibold text-red">alpha</span>
        </Headline>
        <Panel>
          <SendNotificationForm notificationConfig={notificationConfig} />
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminNotificationsPage;
