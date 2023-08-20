import React, { Fragment } from "react";
import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";

import { trpc } from "@/utils/trpc";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { Headline } from "@/components/admin/Headline";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Panel } from "@/components/admin/Panel";
import { OutgoingWebhookFeedEntry } from "@/components/admin/activity-feed/outgoing-webhook-feed-entry";
import Meta from "@/components/content/Meta";
import IconLoading from "@/icons/IconLoading";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageForms);
  return adminProps ? { props: adminProps } : { notFound: true };
}

const AdminActivityFeedPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  const outgoingWebhooks =
    trpc.adminActivityFeed.getOutgoingWebhooks.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <>
      <Meta title="Activity Feed | Admin" />

      <AdminPageLayout title="Activity Feed" menuItems={menuItems}>
        <Headline>Outgoing webhook calls</Headline>

        <Panel>
          {outgoingWebhooks.isLoading && <p>Loading …</p>}
          {outgoingWebhooks.status === "error" && (
            <p>Error fetching activity feed!</p>
          )}

          <ul>
            {outgoingWebhooks.data?.pages.map((page) => (
              <Fragment key={page.nextCursor}>
                {page.items.map((item) => (
                  <li
                    key={item.id}
                    className="border-gry-600 border-b last:border-b-0"
                  >
                    <OutgoingWebhookFeedEntry item={item} />
                  </li>
                ))}
              </Fragment>
            ))}
          </ul>

          <div className="mt-5">
            <button
              className="block w-full rounded-lg border border-gray-700 p-2"
              onClick={() => outgoingWebhooks.fetchNextPage()}
              disabled={
                !outgoingWebhooks.hasNextPage ||
                outgoingWebhooks.isFetchingNextPage
              }
            >
              {outgoingWebhooks.isFetchingNextPage ? (
                <>
                  <IconLoading size={20} /> Loading...
                </>
              ) : outgoingWebhooks.hasNextPage ? (
                "Load more"
              ) : (
                "- End -"
              )}
            </button>
          </div>
        </Panel>
      </AdminPageLayout>
    </>
  );
};

export default AdminActivityFeedPage;
