import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { NotificationStats } from "@/components/admin/notifications/NotificationStats";
import { NotificationsLive } from "@/components/admin/notifications/NotificationsLive";
import { SendNotificationForm } from "@/components/admin/notifications/SendNotificationForm";
import Meta from "@/components/content/Meta";
import { permissions } from "@/data/permissions";
import { getAdminSSP } from "@/server/utils/admin";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(
    context,
    permissions.manageNotifications,
  );
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/notifications",
        permanent: false,
      },
    };
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
        <div className="flex w-full flex-col gap-4 lg:flex-row">
          <div className="flex-1">
            <Headline>Create a notification</Headline>
            <Panel>
              <SendNotificationForm />
            </Panel>
          </div>
          <div className="flex-1">
            <Headline>Stats</Headline>
            <NotificationStats />

            <Headline>Recent Notifications</Headline>
            <Panel>
              <NotificationsLive />
            </Panel>
          </div>
        </div>
      </AdminPageLayout>
    </>
  );
};
export default AdminNotificationsPage;
