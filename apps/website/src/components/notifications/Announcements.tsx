import { trpc } from "@/utils/trpc";
import { Announcement } from "@/components/notifications/Announcement";

export function Announcements() {
  const announcements = trpc.notifications.getActiveAnnouncements.useQuery(
    undefined,
    {
      refetchInterval: 10 * 60 * 1000,
    },
  );

  if (announcements.isLoading) {
    return <p className="">Loading announcements...</p>;
  }

  if (announcements.data?.length === 0) {
    return <p className="">No current announcements.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 pb-6">
      {announcements.data?.map((notification) => (
        <li key={notification.id}>
          <Announcement notification={notification} />
        </li>
      ))}
    </ul>
  );
}
