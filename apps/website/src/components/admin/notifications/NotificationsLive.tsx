import ArrowPathIcon from "@heroicons/react/20/solid/ArrowPathIcon";
import XCircleIcon from "@heroicons/react/24/outline/XCircleIcon";
import { ArchiveBoxIcon, BoltIcon } from "@heroicons/react/20/solid";
import { trpc } from "@/utils/trpc";
import { NotificationEntry } from "@/components/notifications/NotificationEntry";
import DateTime from "@/components/content/DateTime";
import { Button } from "@/components/shared/Button";
import { MessageBox } from "@/components/shared/MessageBox";

export function NotificationsLive() {
  const recentNotifications =
    trpc.adminNotifications.getRecentNotifications.useQuery(undefined, {
      refetchInterval: 2_000,
    });

  const cancelMutation = trpc.adminNotifications.cancelNotification.useMutation(
    {
      onSuccess: async () => {
        await recentNotifications.refetch();
      },
    }
  );

  const resendMutation = trpc.adminNotifications.resendNotification.useMutation(
    {
      onSuccess: async () => {
        await recentNotifications.refetch();
      },
    }
  );

  if (!recentNotifications.data) {
    return <p>Loading …</p>;
  }

  const now = new Date();

  return (
    <div className="flex flex-col gap-4">
      {resendMutation.isLoading && (
        <MessageBox>Resending notification …</MessageBox>
      )}
      {cancelMutation.isLoading && (
        <MessageBox>Cancelling notification …</MessageBox>
      )}
      {resendMutation.isError && (
        <MessageBox variant="failure">
          Failed to resend notification: {resendMutation.error.message}
        </MessageBox>
      )}
      {cancelMutation.isError && (
        <MessageBox variant="failure">
          Failed to cancel notification: {cancelMutation.error.message}
        </MessageBox>
      )}

      <small className="block text-base text-gray-400">
        Last updated{" "}
        {recentNotifications.dataUpdatedAt ? (
          <DateTime
            format={{ style: "short", time: "seconds" }}
            date={new Date(recentNotifications.dataUpdatedAt)}
          />
        ) : (
          "-/-"
        )}
        {":"}
      </small>

      <ul>
        {recentNotifications.data?.map((notification) => {
          const isActive = notification.expiresAt > now;

          return (
            <li
              key={notification.id}
              className="flex items-center gap-3 border-t border-t-white/20 p-1 px-2 first:border-t-0 hover:bg-black"
            >
              {isActive ? (
                <BoltIcon title="Notification is active" className="h-4 w-4" />
              ) : (
                <ArchiveBoxIcon
                  title="Notification is inactive"
                  className="h-4 w-4"
                />
              )}
              <div className="flex-1 pl-2">
                <NotificationEntry notification={notification} />
              </div>
              <div className="flex w-28 justify-end gap-1 border-l border-gray-400">
                <Button
                  width="auto"
                  size="small"
                  title="Cancel announcement"
                  confirmationMessage="Are you sure you want to cancel this notification?"
                  onClick={() => {
                    cancelMutation.mutate(notification.id);
                  }}
                >
                  <XCircleIcon className="h-5 w-5" />
                </Button>
                <Button
                  width="auto"
                  size="small"
                  title="Resend notification"
                  confirmationMessage="Are you sure you want to resend this notification?"
                  onClick={() => {
                    resendMutation.mutate(notification.id);
                  }}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
