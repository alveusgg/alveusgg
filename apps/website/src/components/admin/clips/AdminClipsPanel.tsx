import { Fragment, useCallback } from "react";
import type { Clip } from "@prisma/client";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/shared/form/Button";
import IconLoading from "@/icons/IconLoading";
import { Panel } from "../Panel";
import { AdminClip } from "./AdminClip";

type AdminClipsPanelProps = {
  filter: "unapproved" | "approved";
};

export function AdminClipsPanel({ filter }: AdminClipsPanelProps) {
  const entries = trpc.clips.getClips.useInfiniteQuery(
    { filter },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const approveClip = trpc.adminClips.approveClip.useMutation({
    onSettled: () => entries.refetch(),
  });
  const handleApproveClip = useCallback(
    (clip: Clip) => {
      approveClip.mutate(clip.id);
    },
    [approveClip],
  );

  const unapproveClip = trpc.adminClips.unapproveClip.useMutation({
    onSettled: () => entries.refetch(),
  });
  const handleUnapproveClip = useCallback(
    (clip: Clip) => {
      unapproveClip.mutate(clip.id);
    },
    [unapproveClip],
  );

  const deleteClip = trpc.adminClips.deleteClip.useMutation({
    onSettled: () => entries.refetch(),
  });
  const handleDeleteClip = useCallback(
    (clip: Clip) => {
      deleteClip.mutate(clip.id);
    },
    [deleteClip],
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
                  Clip
                </th>
                <th scope="col" className="text-left">
                  Submitted
                </th>
                <th scope="col" className="text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.data?.pages.map((page) => (
                <Fragment key={page.nextCursor || "default"}>
                  {page.clips.map((clip) => (
                    <AdminClip
                      key={clip.id}
                      clip={clip}
                      approveClip={handleApproveClip}
                      unapproveClip={handleUnapproveClip}
                      deleteClip={handleDeleteClip}
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
    </Panel>
  );
}
