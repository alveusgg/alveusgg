import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";

import { getSession } from "next-auth/react";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";
import Meta from "@/components/content/Meta";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { CalendarEvents } from "@/components/admin/calendar-events/CalendarEvents";

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
          : "/auth/signin?callbackUrl=/admin/calendar-events",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminCalendarEventsPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Calendar Events | Admin" />
      <AdminPageLayout title="Calendar Events" menuItems={menuItems}>
        <CalendarEvents />
      </AdminPageLayout>
    </>
  );
};

export default AdminCalendarEventsPage;
