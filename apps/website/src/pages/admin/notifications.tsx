import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { SendNotificationForm } from "@/components/admin/notifications/SendNotificationForm";
import Meta from "@/components/content/Meta";
import { NotificationStats } from "@/components/admin/notifications/NotificationStats";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(
    context,
    permissions.manageNotifications
  );
  if (!adminProps) {
    return { notFound: true };
  }

  return { props: { ...adminProps } };
}

const AdminNotificationsPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Notifications | Admin" />

      <AdminPageLayout title="Notifications" menuItems={menuItems}>
        <div className="flex w-full gap-4">
          <div className="flex-1">
            <Headline>Create a notification</Headline>
            <Panel>
              <SendNotificationForm />
            </Panel>
          </div>
          <div className="flex-1">
            <Headline>Stats</Headline>
            <Panel>
              <NotificationStats />
            </Panel>
          </div>
        </div>
      </AdminPageLayout>
    </>
  );
};
export default AdminNotificationsPage;
