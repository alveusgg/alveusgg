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
  const [overrideIdentifier, setOverrideIdentifier] = useState("");

  const renameMutation = trpc.donations.renameMyPixels.useMutation();

  return (
    <>
      <p className="mb-4 flex flex-row items-center gap-2">
        <IconCheck className="size-6" />
        You are logged in as <strong>{username}</strong> ({email}).
      </p>

      <EditPixelsForm
        defaultIdentifier={`@${username}`}
        pixelsQuery={pixels}
        renameMutation={renameMutation}
        overrideIdentifier={overrideIdentifier}
        setOverrideIdentifier={setOverrideIdentifier}
        onRename={(newIdentifier, pixelId) => {
          renameMutation.mutate(
            { newIdentifier, pixelId },
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
