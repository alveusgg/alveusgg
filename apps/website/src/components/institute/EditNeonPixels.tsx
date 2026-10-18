import { useState } from "react";

import type { MuralId } from "@/data/murals";

import { trpc } from "@/utils/trpc";

import Link from "@/components/content/Link";
import { EditPixelsForm } from "@/components/institute/EditPixelsForm";
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
  hasLoggedOut,
  neonLogoutUrl,
}: {
  muralId: MuralId;
  isLoggedIn: boolean;
  hasLoginFailed: boolean;
  hasLoggedOut: boolean;
  neonLogoutUrl: string | null;
}) {
  const utils = trpc.useUtils();
  const pixels = trpc.donations.getNeonPixels.useQuery(
    { muralId },
    { enabled: isLoggedIn },
  );
  const [overrideIdentifier, setOverrideIdentifier] = useState("");

  const renameMutation = trpc.donations.renameNeonPixels.useMutation();

  const returnTo = `/institute/pixels/${muralId}/rename`;

  if (!isLoggedIn) {
    return (
      <>
        {hasLoginFailed ? (
          <MessageBox variant="failure" className="mb-4">
            Logging in with your donor account did not work. Please try again.
          </MessageBox>
        ) : null}

        {hasLoggedOut ? (
          <MessageBox variant="success" className="mb-4">
            You are logged out here.
            {neonLogoutUrl ? (
              <>
                {" "}
                On a shared device, also{" "}
                <Link href={neonLogoutUrl} external>
                  log out of your donor account
                </Link>{" "}
                so the next person can&apos;t log in as you.
              </>
            ) : null}
          </MessageBox>
        ) : null}

        <MessageBox>
          <p className="mb-4">
            Donated through the donation form on our website? Log in with the
            donor account you use to manage your donations to view and rename
            the pixels of those donations.
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
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="flex flex-row items-center gap-2">
          <IconCheck className="size-6" />
          You are logged in with your donor account.
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
    </>
  );
}
