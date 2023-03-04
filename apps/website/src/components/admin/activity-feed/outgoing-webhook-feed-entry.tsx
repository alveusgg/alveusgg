import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { GiveawayEntry, OutgoingWebhook, User } from "@prisma/client";
import { trpc } from "../../../utils/trpc";
import { LocalDateTime } from "../../shared/LocalDateTime";

type OutgoingWebhookWithGiveawayEntry = OutgoingWebhook & {
  user: User | null;
  giveawayEntry: GiveawayEntry | null;
};
export const OutgoingWebhookFeedEntry: React.FC<{
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
          <LocalDateTime dateTime={item.createdAt} />
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
