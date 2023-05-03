import { trpc } from "@/utils/trpc";
import { Announcement } from "@/components/notifications/Announcement";

export function Announcements() {
  const announcements = trpc.notifications.getActiveAnnouncements.useQuery(
    undefined,
    {
      refetchInterval: 10 * 60 * 1000,
    }
  );

  return (
    <ul className="flex flex-col gap-2">
      {announcements.data?.map((notification) => (
        <Announcement key={notification.id} notification={notification} />
      ))}
    </ul>
  );
}
