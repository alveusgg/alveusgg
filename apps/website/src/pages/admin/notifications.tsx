import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";
import { getNotificationsConfig } from "@/config/notifications";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { SendNotificationForm } from "@/components/admin/SendNotificationForm";
import Meta from "@/components/content/Meta";

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
      <Meta title="Notifications | Admin" />

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
