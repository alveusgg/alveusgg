import { Fragment, useState } from "react";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import Heading from "@/components/content/Heading";
import { NotificationEntry } from "@/components/notifications/NotificationEntry";

import IconLoading from "@/icons/IconLoading";
import IconSearch from "@/icons/IconSearch";

import { selectionButtonClasses } from "../calendar/Schedule";
import Button from "../content/Button";

const notificationClasses =
  "rounded-xl bg-alveus-green/30 p-2 transition-all hover:scale-102 hover:bg-alveus-green/40";

export function RecentNotifications({ tags }: { tags: Array<string> }) {
  const [search, setSearch] = useState("");

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Heading level={3} id="recent" link>
          Recent Notifications
        </Heading>

        <label
          className={classes(
            selectionButtonClasses,
            "rounded-md border border-transparent px-2 py-1 not-has-placeholder-shown:border-alveus-green-700 not-has-placeholder-shown:bg-alveus-tan focus-within:border-alveus-green-700 focus-within:bg-alveus-tan",
          )}
        >
          <IconSearch size={16} className="shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications"
            aria-label="Search notifications"
            className="min-w-0 bg-transparent text-sm outline-none placeholder:text-inherit not-focus:placeholder-shown:cursor-pointer focus:placeholder:text-alveus-green-800/50"
          />
        </label>
      </div>

      <RecentNotificationsList tags={tags} search={search} />
    </>
  );
}

function RecentNotificationsList({
  tags,
  search,
}: {
  tags: Array<string>;
  search: string;
}) {
  const recentNotifications =
    trpc.notifications.getRecentNotificationsForTags.useInfiniteQuery(
      { tags, search },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  if (recentNotifications.isError) {
    return <p>Error loading recent notifications.</p>;
  }

  if (
    recentNotifications.isSuccess &&
    !recentNotifications.data?.pages.some((page) => page.items.length > 0)
  ) {
    return <p>No recent notifications.</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {recentNotifications.isPending
          ? Array.from({ length: 10 }).map((_, i) => (
              <li
                key={i}
                className={classes(notificationClasses, "animate-pulse")}
              >
                <div className="h-64" />
              </li>
            ))
          : recentNotifications.data?.pages.map((page, i) => (
              <Fragment
                key={page.nextCursor || `page-${page.items[0]?.id || "empty"}`}
              >
                {page.items.map((notification) => (
                  <li
                    key={notification.id}
                    className={classes(
                      notificationClasses,
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
