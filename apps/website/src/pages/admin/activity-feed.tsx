import React, { Fragment } from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";
import type { GiveawayEntry, User, OutgoingWebhook } from "@prisma/client";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

import { checkIsSuperUser } from "../../utils/auth";
import { trpc } from "../../utils/trpc";
import { Headline } from "../../components/shared/Headline";
import { LocalTime } from "../../components/shared/LocalTime";
import { AdminPageLayout } from "../../components/admin/AdminPageLayout";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (checkIsSuperUser(session)) {
    return {
      props: {
        authorized: true,
        superUser: true,
      },
    };
  }

  return {
    notFound: true,
  };
}

type OutgoingWebhookWithGiveawayEntry = OutgoingWebhook & {
  user: User | null;
  giveawayEntry: GiveawayEntry | null;
};

const OutgoingWebhookFeedEntry: React.FC<{
  item: OutgoingWebhookWithGiveawayEntry;
}> = ({ item }) => {
  let details = <>{item.body}</>;
  let label = item.type;

  const utils = trpc.useContext();
  const retryOutgoingWebhook =
    trpc.adminActivityFeed.retryOutgoingWebhook.useMutation({
      onSettled: async () => {
        await utils.adminActivityFeed.getOutgoingWebhooks.invalidate();
      },
    });

  if (item.type === "giveaway-entry") {
    {
      label = "Giveaway entry: " + item.user?.name;
      details = <div>User #{item.user?.name}</div>;
    }
  }

  const lastAttemptWasSuccessful =
    item.deliveredAt && (!item.failedAt || item.deliveredAt > item.failedAt);

  return (
    <details className="flex flex-col gap-4 py-2">
      <summary className="flex cursor-pointer flex-row gap-3">
        <span
          className="cursor-help"
          title={
            `${item.attempts} attempts, ` +
            (lastAttemptWasSuccessful
              ? `last success: ${item.deliveredAt?.toISOString()}`
              : `last failure: ${item.failedAt?.toISOString()}`)
          }
        >
          {retryOutgoingWebhook.isLoading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : lastAttemptWasSuccessful ? (
            "✅"
          ) : (
            `❌`
          )}
        </span>
        <span className="tabular-nums">
          <LocalTime dateTime={item.createdAt} />
        </span>
        <span className="flex-1 font-bold">{label}</span>

        <div>
          <button
            type="button"
            onClick={() => retryOutgoingWebhook.mutate({ id: item.id })}
          >
            {item.deliveredAt ? "Replay" : "Retry"}
          </button>
        </div>
      </summary>
      <div className="mt-3 border-t border-gray-600 p-4">
        <div>Webhook: {item.url}</div>
        <div>{details}</div>
      </div>
    </details>
  );
};

const ActivityFeed: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({}) => {
  const outgoingWebhooks =
    trpc.adminActivityFeed.getOutgoingWebhooks.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <>
      <Head>
        <title>Activity Feed | Alveus.gg</title>
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      <AdminPageLayout title="Activity Feed">
        <section>
          <header>
            <Headline>Outgoing webhook calls</Headline>

            <div className="rounded-lg bg-white p-5 shadow-xl">
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
                  {outgoingWebhooks.isFetchingNextPage
                    ? "Loading more..."
                    : outgoingWebhooks.hasNextPage
                    ? "Load more"
                    : "- End -"}
                </button>
              </div>
            </div>
          </header>
        </section>
      </AdminPageLayout>
    </>
  );
};

export default ActivityFeed;
