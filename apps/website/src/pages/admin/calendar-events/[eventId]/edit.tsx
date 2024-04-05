import type {
  InferGetStaticPropsType,
  NextPage,
  GetServerSidePropsContext,
} from "next";

import { getSession } from "next-auth/react";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { CalendarEventForm } from "@/components/admin/calendar-events/CalendarEventForm";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { trpc } from "@/utils/trpc";
import { MessageBox } from "@/components/shared/MessageBox";

export async function getServerSideProps(context: GetServerSidePropsContext) {
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
          : `/auth/signin?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  const id = context.params?.eventId;
  if (!id) {
    return { notFound: true };
  }

  return {
    props: {
      ...adminProps,
      eventId: String(id),
    },
  };
}

const AdminEditFormPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, eventId }) => {
  const event = trpc.adminCalendarEvents.getCalendarEvent.useQuery(eventId);

  return (
    <>
      <Meta title="Edit Calendar Event | Admin" />

      <AdminPageLayout title="Edit Calendar Event" menuItems={menuItems}>
        <Headline>Edit Calendar Event</Headline>

        <Panel>
          {event.data ? (
            <CalendarEventForm action="edit" calendarEvent={event.data} />
          ) : (
            <MessageBox>Loading …</MessageBox>
          )}
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminEditFormPage;
