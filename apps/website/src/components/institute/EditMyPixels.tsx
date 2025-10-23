import type { User } from "next-auth";
import { useState } from "react";

import { trpc } from "@/utils/trpc";

import { EditPixelsForm } from "@/components/institute/EditPixelsForm";

import IconCheck from "@/icons/IconCheck";

export function EditMyPixels({ user }: { user: User }) {
  const utils = trpc.useUtils();
  const pixels = trpc.donations.getMyPixels.useQuery();
  const username = user.name ?? "anonymous";
  const email = user.email ?? "no-email";
  const [overrideIdentifier, setOverrideIdentifier] = useState<string>(
    `@${username}`,
  );

  return (
    <>
      <p className="mb-4 flex flex-row items-center gap-2">
        <IconCheck className="size-6" />
        You are logged in as <strong>{username}</strong> ({email}).
      </p>

      <EditPixelsForm
        pixelsQuery={pixels}
        renameMutation={trpc.donations.renameMyPixel}
        renameAllMutation={trpc.donations.renameAllMyPixels}
        overrideIdentifier={overrideIdentifier}
        setOverrideIdentifier={setOverrideIdentifier}
        onRename={(mutate, pixel, newIdentifier) => {
          mutate(
            {
              provider: pixel.provider,
              donationId: pixel.donationId,
              pixelId: pixel.id,
              newIdentifier,
            },
            {
              onSuccess: () => {
                utils.donations.getMyPixels.invalidate();
              },
            },
          );
        }}
        onRenameAll={(mutate) => {
          mutate(
            { newIdentifier: overrideIdentifier },
            {
              onSuccess: () => {
                utils.donations.getMyPixels.invalidate();
              },
            },
          );
        }}
      />
    </>
  );
}
