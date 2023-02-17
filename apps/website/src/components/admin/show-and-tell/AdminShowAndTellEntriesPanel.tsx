import React, { Fragment } from "react";
import { Panel } from "../Panel";
import { trpc } from "../../../utils/trpc";
import { Button } from "../../shared/Button";
import { AdminShowAndTellEntry } from "./AdminShowAndTellEntry";
import IconLoading from "@/icons/IconLoading";

type AdminShowAndTellEntriesPanelProps = {
  filter: "pendingApproval" | "approved";
};

export function AdminShowAndTellEntriesPanel({
  filter,
}: AdminShowAndTellEntriesPanelProps) {
  const entries = trpc.adminShowAndTell.getEntries.useInfiniteQuery(
    { filter },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.data?.pages.map((page) => (
                <Fragment key={page.nextCursor}>
                  {page.items.map((entry) => (
                    <AdminShowAndTellEntry key={entry.id} entry={entry} />
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
