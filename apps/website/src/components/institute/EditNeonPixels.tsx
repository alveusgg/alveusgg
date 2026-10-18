import { useState } from "react";

import type { MuralId } from "@/data/murals";

import { trpc } from "@/utils/trpc";

import { EditPixelsForm } from "@/components/institute/EditPixelsForm";
import { RenameStepsLayout } from "@/components/institute/rename/RenameStep";
import { MessageBox } from "@/components/shared/MessageBox";
import {
  Button,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";

import IconCheck from "@/icons/IconCheck";
import IconGift from "@/icons/IconGift";

export function EditNeonPixels({
  muralId,
  isLoggedIn,
  hasLoginFailed,
  returnTo = `/institute/pixels/${muralId}/rename`,
}: {
  muralId: MuralId;
  isLoggedIn: boolean;
  hasLoginFailed: boolean;
  returnTo?: string;
}) {
  const utils = trpc.useUtils();
  const pixels = trpc.donations.getNeonPixels.useQuery(
    { muralId },
    { enabled: isLoggedIn },
  );
  const [overrideIdentifier, setOverrideIdentifier] = useState("");

  const renameMutation = trpc.donations.renameNeonPixels.useMutation();

  if (!isLoggedIn) {
    return (
      <RenameStepsLayout
        confirm={
          <>
            {hasLoginFailed ? (
              <MessageBox variant="failure" className="mb-4">
                Logging in with your donor account did not work. Please try
                again.
              </MessageBox>
            ) : null}

            <MessageBox>
              <p className="mb-4">
                Log in with the donor account you use to manage your donations
                to see all pixels unlocked by donations through the form on our
                website.
              </p>

              <form method="get" action="/api/neon/login">
                <input type="hidden" name="returnTo" value={returnTo} />
                <Button type="submit" className="bg-alveus-green text-white">
                  <IconGift />
                  <span>Log in with your donor account</span>
                </Button>
              </form>
            </MessageBox>
          </>
        }
        rename={null}
        renamePlaceholder="Log in with your donor account first."
      />
    );
  }

  return (
    <RenameStepsLayout
      confirm={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="flex items-center gap-2">
            <IconCheck className="size-6 shrink-0" />
            <span>You are logged in with your donor account.</span>
          </p>

          <form
            method="post"
            action={`/api/neon/logout?returnTo=${encodeURIComponent(returnTo)}`}
          >
            <Button
              type="submit"
              size="small"
              width="auto"
              className={secondaryButtonClasses}
            >
              Log out
            </Button>
          </form>
        </div>
      }
      rename={
        <EditPixelsForm
          defaultIdentifier={pixels.data?.[0]?.identifier ?? ""}
          pixelsQuery={pixels}
          renameMutation={renameMutation}
          overrideIdentifier={overrideIdentifier}
          setOverrideIdentifier={setOverrideIdentifier}
          onRename={(newIdentifier, pixelId) => {
            renameMutation.mutate(
              { muralId, newIdentifier, pixelId },
              {
                onSuccess: () => {
                  utils.donations.getNeonPixels.invalidate();
                },
              },
            );
          }}
        />
      }
    />
  );
}
