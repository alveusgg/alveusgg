import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";
import Meta from "@/components/content/Meta";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { CalendarEvents } from "@/components/admin/calendar-events/CalendarEvents";

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
