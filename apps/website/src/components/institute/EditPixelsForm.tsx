import pluralize from "pluralize";
import { type FormEvent, type ReactNode } from "react";

import type { DonationPixel } from "@/server/trpc/router/donations";

import type { trpc } from "@/utils/trpc";

import Box from "@/components/content/Box";
import {
  EditPixelForm,
  formatPixelRenameLockDuration,
} from "@/components/institute/EditPixelForm";
import { PixelIdentifierInput } from "@/components/institute/PixelIdentifierInput";
import { MessageBox } from "@/components/shared/MessageBox";
import {
  Button,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";

import IconLoading from "@/icons/IconLoading";
import IconX from "@/icons/IconX";

export type SharedEditPixelProps = {
  overrideIdentifier: string | null;
  renameMutation:
    | ReturnType<(typeof trpc.donations.renameMyPixels)["useMutation"]>
    | ReturnType<(typeof trpc.donations.renamePayPalPixels)["useMutation"]>;
  onRename: (newIdentifier: string, pixelId?: string) => unknown;
};

type EditPixelsFormProps = SharedEditPixelProps & {
  defaultIdentifier: string;
  setOverrideIdentifier: (identifier: string) => void;
  pixelsQuery: {
    isError: boolean;
    isPending: boolean;
    isLoading?: boolean;
    isSuccess: boolean;
    data?: DonationPixel[];
    error: { message: string } | null;
  };
};

const confirmationMessage = (numberOfPixels: number, newIdent: string) =>
  `Are you sure you want to rename ${numberOfPixels} ${pluralize("pixel", numberOfPixels)} to "${newIdent}"? ` +
  `Pixels can only be renamed once every ${formatPixelRenameLockDuration()}.`;

export function EditPixelsForm({
  overrideIdentifier,
  setOverrideIdentifier,
  renameMutation,
  pixelsQuery,
  onRename,
  defaultIdentifier = "",
}: EditPixelsFormProps) {
  const submitRenameAll = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onRename(overrideIdentifier ?? "Anonymous");
  };

  let infoBox: ReactNode;
  if (renameMutation.isPending) {
    infoBox = (
      <MessageBox className="flex flex-row items-center gap-4">
        <IconLoading />
        Renaming your pixels…
      </MessageBox>
    );
  } else if (renameMutation.isError) {
    infoBox = (
      <MessageBox variant="failure">
        Error renaming pixels: {renameMutation.error.message}
      </MessageBox>
    );
  } else if (renameMutation.isSuccess) {
    let renamedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    (renameMutation.data || []).forEach((result) => {
      if (result.isError) {
        failedCount++;
      } else if (result.isSkipped) {
        skippedCount++;
      } else if (result.isSuccess) {
        renamedCount++;
      }
    });

    const skippedMessage =
      skippedCount > 0 ? (
        <p className="mt-2 text-sm text-gray-700 italic">
          {skippedCount} pixels were skipped because they could not be renamed
          at this time.
        </p>
      ) : (
        ""
      );

    if (failedCount > 0) {
      infoBox = (
        <MessageBox variant="failure">
          {!renamedCount ? (
            <>Failed to rename pixels.</>
          ) : (
            <>
              Renamed {renamedCount} pixels, but failed to rename {failedCount}{" "}
              pixels.
            </>
          )}
          {skippedMessage}
        </MessageBox>
      );
    } else if (renamedCount > 0) {
      infoBox = (
        <MessageBox variant="success">
          Successfully renamed {renamedCount} pixels!
          {skippedMessage}
        </MessageBox>
      );
    } else {
      infoBox = (
        <MessageBox variant="warning">
          No pixels were renamed.
          {skippedMessage}
        </MessageBox>
      );
    }
  }

  const totalCount = pixelsQuery.data?.length ?? 0;
  const overridablePixelsCount =
    pixelsQuery.data?.filter(
      (pixel) => !pixel.lockedUntil || pixel.lockedUntil < new Date(),
    ).length ?? 0;

  return (
    <>
      {infoBox}

      {totalCount > 1 ? (
        <>
          <h3 className="mt-8 mb-4 font-bold">Rename all your pixels</h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            <Box className="bg-white p-4 lg:col-span-2">
              <strong className="text-lg">All pixels</strong>

              <form
                onSubmit={submitRenameAll}
                onReset={() => setOverrideIdentifier("")}
                className="mt-4 flex flex-col gap-6"
              >
                <PixelIdentifierInput
                  id="all-identifier"
                  value={overrideIdentifier ?? ""}
                  setValue={setOverrideIdentifier}
                  placeholder={defaultIdentifier}
                />

                <div>
                  <div className="flex items-center gap-6">
                    <div className="grow">
                      <Button
                        size="small"
                        type="submit"
                        disabled={
                          !overrideIdentifier || overridablePixelsCount === 0
                        }
                        confirmationMessage={confirmationMessage(
                          overridablePixelsCount,
                          overrideIdentifier ?? "",
                        )}
                      >
                        {renameMutation.isPending ? (
                          <>
                            <IconLoading />
                            Saving…
                          </>
                        ) : (
                          `Save ${overridablePixelsCount} ${pluralize("pixel", overridablePixelsCount)}`
                        )}
                      </Button>
                    </div>
                    <div className="shrink">
                      <Button
                        size="small"
                        type="reset"
                        className={secondaryButtonClasses}
                        disabled={!overrideIdentifier}
                      >
                        <IconX /> Reset
                      </Button>
                    </div>
                  </div>

                  {overridablePixelsCount < totalCount ? (
                    <p className="mt-2 text-center text-sm">
                      {totalCount - overridablePixelsCount} of {totalCount}{" "}
                      pixels are currently locked!
                    </p>
                  ) : null}
                </div>
              </form>
            </Box>
          </div>
        </>
      ) : null}

      <h3 className="mt-8 mb-4 font-bold">Individual pixels</h3>

      {pixelsQuery.isError && pixelsQuery.error ? (
        <MessageBox variant="failure">
          Error loading pixels: {pixelsQuery.error.message}
        </MessageBox>
      ) : null}

      {("isLoading" in pixelsQuery && pixelsQuery.isLoading) ||
      ("isPending" in pixelsQuery && pixelsQuery.isPending) ? (
        <MessageBox className="flex flex-row items-center gap-4">
          <IconLoading />
          Loading your pixels…
        </MessageBox>
      ) : totalCount < 1 ? (
        <MessageBox>Could not find any pixels!</MessageBox>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {pixelsQuery.data?.map((pixel) => {
          if (pixel.provider !== "paypal" && pixel.provider !== "twitch") {
            return null;
          }

          return (
            <Box className="bg-white p-4" key={pixel.id}>
              <EditPixelForm
                provider={pixel.provider}
                renameMutation={renameMutation}
                pixel={pixel}
                overrideIdentifier={overrideIdentifier}
                onRename={onRename}
              />
            </Box>
          );
        })}
      </div>
    </>
  );
}
