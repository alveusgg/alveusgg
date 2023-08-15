import React from "react";
import { trpc } from "@/utils/trpc";

export function EventSubscriptions() {
  const channels = trpc.adminTwitch.getChannels.useQuery();
  const twitchEventSubs =
    trpc.adminTwitch.getActiveEventSubscriptions.useQuery().data;

  if (!twitchEventSubs) {
    return <p>Loading…</p>;
  }

  return (
    <>
      <ul>
        {twitchEventSubs.map((sub) => {
          const channel = channels.data?.find(
            (c) => c.channelId === sub.condition.broadcaster_user_id,
          );
          const label = channel?.label || "";

          return (
            <li key={sub.id} className="my-4">
              <div className="font-bold">
                {`${label} #${sub.condition.broadcaster_user_id} ${sub.type}`}
              </div>
              <div>{sub.status}</div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
