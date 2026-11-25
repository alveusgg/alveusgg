import { type FormEvent, useState } from "react";

import { trpc } from "@/utils/trpc";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import Link from "@/components/content/Link";
import { MessageBox } from "@/components/shared/MessageBox";
import { ProcedureErrorMessage } from "@/components/shared/ProcedureErrorMessage";
import {
  Button,
  dangerButtonClasses,
  defaultButtonClasses,
} from "@/components/shared/form/Button";
import { TextField } from "@/components/shared/form/TextField";

import IconTrash from "@/icons/IconTrash";

export function WishlistChatChannels() {
  const [username, setUsername] = useState("");
  const channels = trpc.adminWishlist.adminGetChatChannels.useQuery();
  const refetch = () => void channels.refetch();
  const add = trpc.adminWishlist.addChatChannel.useMutation({
    onSuccess: () => setUsername(""),
    onSettled: refetch,
  });
  const remove = trpc.adminWishlist.removeChatChannel.useMutation({
    onSettled: refetch,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    add.mutate({ username });
  };

  return (
    <>
      <Headline>Chat messages</Headline>

      <Panel>
        <p className="mb-4">
          The chat bot from the Twitch admin, AlveusGG by default, posts each
          new donation in the chat of these channels, like &quot;alveusLove Name
          donated $25 towards Item!&quot;. It needs no access to the channels,
          but their chat rules apply, like followers-only mode. With no channels
          listed, nothing is posted.
        </p>

        {remove.error && (
          <MessageBox variant="failure" className="mb-4">
            <ProcedureErrorMessage error={remove.error} />
          </MessageBox>
        )}

        {channels.error ? (
          <MessageBox variant="failure">
            <ProcedureErrorMessage error={channels.error} />
          </MessageBox>
        ) : channels.isPending ? (
          <MessageBox>Loading …</MessageBox>
        ) : channels.data.length === 0 ? (
          <MessageBox>No channels, so donations aren&apos;t posted.</MessageBox>
        ) : (
          <ul className="flex flex-col gap-2">
            {channels.data.map((channel) => (
              <li key={channel.channelId} className="flex items-center gap-4">
                <Link
                  href={`https://www.twitch.tv/${channel.username}`}
                  external
                  dark
                  className="flex-1"
                >
                  {channel.username}
                </Link>
                <Button
                  size="small"
                  width="auto"
                  className={dangerButtonClasses}
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate({ channelId: channel.channelId })
                  }
                >
                  <IconTrash className="size-4" />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {add.error && (
            <MessageBox variant="failure">
              <ProcedureErrorMessage error={add.error} />
            </MessageBox>
          )}

          <TextField
            label="Twitch channel name"
            name="username"
            value={username}
            onChange={setUsername}
            placeholder="AlveusSanctuary"
            isRequired
          />

          <Button
            type="submit"
            className={defaultButtonClasses}
            disabled={add.isPending}
          >
            Add channel
          </Button>
        </form>
      </Panel>
    </>
  );
}
