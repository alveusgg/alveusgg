import { Fragment } from "react";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import { NotificationEntry } from "@/components/notifications/NotificationEntry";

import IconLoading from "@/icons/IconLoading";

import Button from "../content/Button";

export function RecentNotifications({ tags }: { tags: Array<string> }) {
  const recentNotifications =
    trpc.notifications.getRecentNotificationsForTags.useInfiniteQuery(
      { tags },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  if (recentNotifications.isPending) {
    return <p>Loading recent notifications...</p>;
  }

  if (recentNotifications.status === "error") {
    return <p>Error loading recent notifications.</p>;
  }

  const hasNotifications = recentNotifications.data?.pages.some(
    (page) => page.items.length > 0,
  );

  if (!hasNotifications) {
    return <p>No recent notifications.</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {recentNotifications.data?.pages.map((page, i) => (
          <Fragment
            key={page.nextCursor || `page-${page.items[0]?.id || "empty"}`}
          >
            {page.items.map((notification) => (
              <li
                key={notification.id}
                className={classes(
                  "flex items-center gap-3 rounded-xl bg-alveus-green/30 px-4 py-2 transition-all hover:scale-102 hover:bg-alveus-green/40",
                  i !== 0 && "starting:opacity-0",
                )}
              >
                <NotificationEntry notification={notification} />
              </li>
            ))}
          </Fragment>
        ))}
      </ul>

      {recentNotifications.hasNextPage && (
        <Button
          as="button"
          className="mt-4 flex w-full items-center justify-center"
          onClick={() => recentNotifications.fetchNextPage()}
          disabled={recentNotifications.isFetchingNextPage}
        >
          {recentNotifications.isFetchingNextPage ? (
            <IconLoading size={20} />
          ) : (
            "Load more"
          )}
        </Button>
      )}
    </>
  );
}
