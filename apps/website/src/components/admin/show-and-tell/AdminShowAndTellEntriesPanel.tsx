import React, { Fragment, useCallback } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/shared/Button";
import IconLoading from "@/icons/IconLoading";
import type { AppRouter } from "@/server/trpc/router/_app";
import { Panel } from "../Panel";
import { AdminShowAndTellEntry } from "./AdminShowAndTellEntry";

type AdminShowAndTellEntriesPanelProps = {
  filter: "pendingApproval" | "approved";
};

type RouterOutput = inferRouterOutputs<AppRouter>;
type Entry = RouterOutput["adminShowAndTell"]["getEntries"]["items"][number];

export function AdminShowAndTellEntriesPanel({
  filter,
}: AdminShowAndTellEntriesPanelProps) {
  const entries = trpc.adminShowAndTell.getEntries.useInfiniteQuery(
    { filter },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const deletePost = trpc.adminShowAndTell.delete.useMutation({
    onSettled: () => entries.refetch(),
  });
  const handleDeletePost = useCallback(
    (entry: Entry) => {
      deletePost.mutate(entry.id);
    },
    [deletePost],
  );

  const markAsSeen = trpc.adminShowAndTell.markAsSeen.useMutation({
    onSettled: () => entries.refetch(),
  });
  const handleMarkAsSeen = useCallback(
    (entry: Entry, retroactive = false) => {
      markAsSeen.mutate({ id: entry.id, retroactive });
    },
    [markAsSeen],
  );

  const unmarkAsSeen = trpc.adminShowAndTell.unmarkAsSeen.useMutation({
    onSettled: () => entries.refetch(),
  });
  const handleUnmarkAsSeen = useCallback(
    (entry: Entry) => {
      unmarkAsSeen.mutate({ id: entry.id });
    },
    [unmarkAsSeen],
  );

  const canLoadMore = entries.hasNextPage && !entries.isFetchingNextPage;

  return (
    <Panel>
      {entries.isLoading && <p>Loading …</p>}
      {entries.status === "error" && <p>Error fetching entries!</p>}
      {entries.data?.pages && entries.data.pages.length > 0 && (
        <>
          <table className="w-full">
            <thead>
              <tr>
                <th scope="col" className="text-left">
                  Name
                </th>
                <th scope="col" className="w-[60%] text-left">
                  Title
                </th>
                <th scope="col" className="text-left">
                  Created/Updated
                </th>
                <th scope="col" className="text-left">
                  Seen
                </th>
                <th scope="col" className="text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.data?.pages.map((page) => (
                <Fragment key={page.nextCursor || "default"}>
                  {page.items.map((entry) => (
                    <AdminShowAndTellEntry
                      key={entry.id}
                      entry={entry}
                      markSeen={handleMarkAsSeen}
                      unmarkSeen={handleUnmarkAsSeen}
                      deletePost={handleDeletePost}
                    />
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>

          <div className="mt-5">
            {canLoadMore ? (
              <Button onClick={() => entries.fetchNextPage()}>
                {entries.isFetchingNextPage ? (
                  <>
                    <IconLoading size={20} /> Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            ) : (
              <p className="p-2 text-center italic">
                {entries.isFetchingNextPage ? "Loading more …" : "- End -"}
              </p>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}
