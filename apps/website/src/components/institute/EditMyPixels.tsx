import type { User } from "next-auth";
import { useState } from "react";

import type { MuralId } from "@/data/murals";

import { trpc } from "@/utils/trpc";

import { EditPixelsForm } from "@/components/institute/EditPixelsForm";
import { RenameStepsLayout } from "@/components/institute/rename/RenameStep";

import IconCheck from "@/icons/IconCheck";

export function EditMyPixels({
  user,
  muralId,
}: {
  user: User;
  muralId: MuralId;
}) {
  const utils = trpc.useUtils();
  const pixels = trpc.donations.getMyPixels.useQuery({ muralId });
  const username = user.name ?? "anonymous";
  const email = user.email ?? "no-email";
  const [overrideIdentifier, setOverrideIdentifier] = useState("");

  const renameMutation = trpc.donations.renameMyPixels.useMutation();

  return (
    <RenameStepsLayout
      confirm={
        <p className="flex items-center gap-2">
          <IconCheck className="size-6 shrink-0" />
          <span>
            You are logged in as <strong>{username}</strong> ({email}).
          </span>
        </p>
      }
      rename={
        <EditPixelsForm
          defaultIdentifier={`@${username}`}
          pixelsQuery={pixels}
          renameMutation={renameMutation}
          overrideIdentifier={overrideIdentifier}
          setOverrideIdentifier={setOverrideIdentifier}
          onRename={(newIdentifier, pixelId) => {
            renameMutation.mutate(
              { muralId, newIdentifier, pixelId },
              {
                onSuccess: () => {
                  utils.donations.getMyPixels.invalidate();
                },
              },
            );
          }}
        />
      }
    />
  );
}
