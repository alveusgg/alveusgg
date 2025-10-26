import type { inferRouterOutputs } from "@trpc/server";
import { Fragment, useCallback, useState } from "react";

import type { MarkPostAsSeenMode } from "@/server/db/show-and-tell";
import type { AppRouter } from "@/server/trpc/router/_app";

import { trpc } from "@/utils/trpc";

import { Button } from "@/components/shared/form/Button";

import IconLoading from "@/icons/IconLoading";

import { Panel } from "../Panel";
import { AdminShowAndTellEntry } from "./AdminShowAndTellEntry";
import { AdminShowAndTellPreviewModal } from "./AdminShowAndTellPreviewModal";

type AdminShowAndTellEntriesPanelProps = {
  filter: "pendingApproval" | "approved";
};

type RouterOutput = inferRouterOutputs<AppRouter>;
type Entry = RouterOutput["adminShowAndTell"]["getEntries"]["items"][number];

export function AdminShowAndTellEntriesPanel({
  filter,
}: AdminShowAndTellEntriesPanelProps) {
  const [previewEntryId, setPreviewEntryId] = useState<string | null>(null);

  const entries = trpc.adminShowAndTell.getEntries.useInfiniteQuery(
    { filter },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const { data: previewEntry } = trpc.adminShowAndTell.getEntry.useQuery(
    previewEntryId || "",
    { enabled: !!previewEntryId },
  );

  const { data: postsFromANewLocation } =
    trpc.showAndTell.getPostsFromANewLocation.useQuery();

  const deletePost = trpc.adminShowAndTell.delete.useMutation({
    onSettled: async () => {
      await entries.refetch();
    },
  });
  const handleDeletePost = useCallback(
    (entry: Entry) => {
      deletePost.mutate(entry.id);
    },
    [deletePost],
  );

  const markAsSeen = trpc.adminShowAndTell.markAsSeen.useMutation({
    onSettled: async () => {
      await entries.refetch();
    },
  });
  const handleMarkAsSeen = useCallback(
    (entry: Entry, mode?: MarkPostAsSeenMode) => {
      markAsSeen.mutate({ id: entry.id, mode });
    },
    [markAsSeen],
  );

  const unmarkAsSeen = trpc.adminShowAndTell.unmarkAsSeen.useMutation({
    onSettled: async () => {
      await entries.refetch();
    },
  });
  const handleUnmarkAsSeen = useCallback(
    (entry: Entry) => {
      unmarkAsSeen.mutate({ id: entry.id });
    },
    [unmarkAsSeen],
  );

  const handlePreview = useCallback((entry: Entry) => {
    setPreviewEntryId(entry.id);
  }, []);

  const canLoadMore = entries.hasNextPage && !entries.isFetchingNextPage;

  return (
    <Panel>
      {entries.isPending && <p>Loading …</p>}
      {entries.status === "error" && <p>Error fetching entries!</p>}
      {entries.data?.pages && entries.data.pages.length > 0 && (
        <>
          <table className="w-full">
            <thead>
              <tr>
                <th scope="col" className="text-left">
                  Name
                </th>
                <th scope="col" className="w-3/5 text-left">
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
                      onPreview={handlePreview}
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
                    <IconLoading size={20} /> Loading…
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

      {previewEntry && postsFromANewLocation && (
        <AdminShowAndTellPreviewModal
          entry={previewEntry}
          newLocation={postsFromANewLocation.has(previewEntry.id)}
          isOpen={!!previewEntryId}
          closeModal={() => setPreviewEntryId(null)}
        />
      )}
    </Panel>
  );
}
