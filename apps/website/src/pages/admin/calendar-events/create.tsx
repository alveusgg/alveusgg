import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { CalendarEventForm } from "@/components/admin/calendar-events/CalendarEventForm";
import Meta from "@/components/content/Meta";
import { permissions } from "@/data/permissions";
import { getAdminSSP } from "@/server/utils/admin";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(
    context,
    permissions.manageCalendarEvents,
  );
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/calendar-events/create",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminCreateShortLinkPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Create Calendar Event | Admin" />

      <AdminPageLayout title="Create Calendar Event" menuItems={menuItems}>
        <Headline>Create new calendar event</Headline>

        <Panel>
          <CalendarEventForm action="create" />
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminCreateShortLinkPage;
