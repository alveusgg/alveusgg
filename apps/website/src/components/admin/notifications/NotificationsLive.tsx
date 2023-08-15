import React, { Fragment } from "react";

import { trpc } from "@/utils/trpc";

import IconLoading from "@/icons/IconLoading";
import IconSync from "@/icons/IconSync";
import IconArchive from "@/icons/IconArchive";
import IconBolt from "@/icons/IconBolt";
import IconXCircleOutline from "@/icons/IconXCircleOutline";

import { NotificationEntry } from "@/components/notifications/NotificationEntry";
import DateTime from "@/components/content/DateTime";
import { Button } from "@/components/shared/Button";
import { MessageBox } from "@/components/shared/MessageBox";

export function NotificationsLive() {
  const recentNotifications =
    trpc.adminNotifications.getRecentNotifications.useInfiniteQuery(
      {},
      {
        refetchInterval: 2_000,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const cancelMutation = trpc.adminNotifications.cancelNotification.useMutation(
    {
      onSuccess: async () => {
        await recentNotifications.refetch();
      },
    },
  );

  const resendMutation = trpc.adminNotifications.resendNotification.useMutation(
    {
      onSuccess: async () => {
        await recentNotifications.refetch();
      },
    },
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
        {recentNotifications.data?.pages.map((page) => (
          <Fragment key={page.nextCursor}>
            {page.items.map((notification) => {
              const isActive = notification.expiresAt > now;

              return (
                <li
                  key={notification.id}
                  className="flex items-center gap-3 border-t border-t-white/20 p-1 px-2 first:border-t-0 hover:bg-black"
                >
                  {isActive ? (
                    <IconBolt
                      alt="Notification is active"
                      className="h-4 w-4"
                    />
                  ) : (
                    <IconArchive
                      alt="Notification is inactive"
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
                      <IconXCircleOutline className="h-5 w-5" />
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
                      <IconSync className="h-5 w-5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </Fragment>
        ))}
      </ul>

      <div className="mt-5">
        <Button
          onClick={() => recentNotifications.fetchNextPage()}
          disabled={
            !recentNotifications.hasNextPage ||
            recentNotifications.isFetchingNextPage
          }
        >
          {recentNotifications.isFetchingNextPage ? (
            <>
              <IconLoading size={20} /> Loading...
            </>
          ) : recentNotifications.hasNextPage ? (
            "Load more"
          ) : (
            "- End -"
          )}
        </Button>
      </div>
    </div>
  );
}
