import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { CalendarEventForm } from "@/components/admin/calendar-events/CalendarEventForm";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(
    context,
    permissions.manageCalendarEvents,
  );
  if (!adminProps) {
    return { notFound: true };
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
