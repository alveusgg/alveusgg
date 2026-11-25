import { trpc } from "@/utils/trpc";

import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { MessageBox } from "@/components/shared/MessageBox";
import { ProcedureErrorMessage } from "@/components/shared/ProcedureErrorMessage";
import { CheckboxField } from "@/components/shared/form/CheckboxField";

export function WishlistChatChannels() {
  const utils = trpc.useUtils();
  const channelsQuery = trpc.adminWishlist.adminGetChatChannels.useQuery();
  const setChatChannel = trpc.adminWishlist.setChatChannel.useMutation({
    // Tick the box right away, then reload the saved state
    onMutate: ({ channelId, enabled }) =>
      utils.adminWishlist.adminGetChatChannels.setData(undefined, (data) =>
        data?.map((channel) =>
          channel.channelId === channelId
            ? { ...channel, wishlistChatMessages: enabled }
            : channel,
        ),
      ),
    onSettled: () => utils.adminWishlist.adminGetChatChannels.invalidate(),
  });

  return (
    <>
      <Headline>Chat messages</Headline>

      <Panel>
        <p className="mb-4">
          The AlveusGG account posts each new donation in the chat of the
          selected channels, like &quot;alveusLove Name donated $25 towards
          Item!&quot;. If no channel is selected, nothing is posted.
        </p>

        {setChatChannel.error && (
          <MessageBox variant="failure" className="mb-4">
            <ProcedureErrorMessage error={setChatChannel.error} />
          </MessageBox>
        )}

        {channelsQuery.error ? (
          <MessageBox variant="failure">
            <ProcedureErrorMessage error={channelsQuery.error} />
          </MessageBox>
        ) : channelsQuery.isPending ? (
          <MessageBox>Loading …</MessageBox>
        ) : channelsQuery.data.length === 0 ? (
          <MessageBox>No Twitch channels are set up yet.</MessageBox>
        ) : (
          <div className="flex flex-col gap-2">
            {channelsQuery.data.map((channel) => (
              <CheckboxField
                key={channel.channelId}
                isSelected={channel.wishlistChatMessages}
                isDisabled={setChatChannel.isPending}
                onChange={(enabled) =>
                  setChatChannel.mutate({
                    channelId: channel.channelId,
                    enabled,
                  })
                }
              >
                {channel.label} ({channel.username})
              </CheckboxField>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
