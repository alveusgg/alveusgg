import { Field, Label, Switch } from "@headlessui/react";
import { type FormEvent, type ReactNode, useState } from "react";

import type { DonationPixel } from "@/server/trpc/router/donations";

import type { trpc } from "@/utils/trpc";

import Box from "@/components/content/Box";
import { EditPixelForm } from "@/components/institute/EditPixelForm";
import { PixelIdentifierInput } from "@/components/institute/PixelIdentifierInput";
import { MessageBox } from "@/components/shared/MessageBox";
import { Button } from "@/components/shared/form/Button";

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

export function EditPixelsForm({
  overrideIdentifier,
  setOverrideIdentifier,
  renameMutation,
  pixelsQuery,
  onRename,
  defaultIdentifier = "",
}: EditPixelsFormProps) {
  const [enableOverridePreview, setEnableOverridePreview] = useState(false);

  const submitRenameAll = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onRename(overrideIdentifier ?? "Anonymous");
  };

  let infoBox: ReactNode;
  if (renameMutation.isPending) {
    infoBox = <MessageBox>Renaming all your Pixels…</MessageBox>;
  } else if (renameMutation.isError) {
    infoBox = (
      <MessageBox variant="failure">
        Error renaming Pixels: {renameMutation.error.message}
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
          {skippedCount} Pixels were skipped because they could not be renamed
          at this time.
        </p>
      ) : (
        ""
      );

    if (failedCount > 0) {
      infoBox = (
        <MessageBox variant="failure">
          {!renamedCount ? (
            <>Failed to rename Pixels.</>
          ) : (
            <>
              Renamed {renamedCount} Pixels, but failed to rename {failedCount}{" "}
              Pixels.
            </>
          )}
          {skippedMessage}
        </MessageBox>
      );
    } else if (renamedCount > 0) {
      infoBox = (
        <MessageBox variant="success">
          Successfully renamed {renamedCount} Pixels!
          {skippedMessage}
        </MessageBox>
      );
    } else {
      infoBox = (
        <MessageBox variant="warning">
          No Pixels were renamed.
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
      {totalCount > 1 ? (
        <>
          <h3 className="mt-8 mb-4 font-bold">Rename all your pixels</h3>
          <Box className="bg-white p-4">
            <div className="flex flex-row items-center justify-between leading-none">
              <strong className="text-lg">All Pixels</strong>
            </div>

            <form
              onSubmit={submitRenameAll}
              className="mt-4 justify-between gap-6 md:flex md:flex-row"
            >
              <div className="flex max-w-sm grow flex-col gap-2">
                <PixelIdentifierInput
                  id="all-identifier"
                  value={overrideIdentifier ?? ""}
                  setValue={setOverrideIdentifier}
                  placeholder={defaultIdentifier}
                />
              </div>

              <div className="flex max-w-sm grow flex-col gap-4">
                <Field className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="flex flex-col leading-tight">
                    <span>Enable preview mode</span>
                    <span className="text-sm text-alveus-green-400 italic">
                      (updates preview below without saving)
                    </span>
                  </Label>

                  <Switch
                    checked={enableOverridePreview}
                    onChange={setEnableOverridePreview}
                    className="group inline-flex h-6 w-11 items-center rounded-full bg-alveus-green-300 transition-colors data-checked:bg-alveus-green"
                  >
                    <span className="size-4 translate-x-1 rounded-full bg-alveus-tan transition-transform group-data-checked:translate-x-6" />
                  </Switch>
                </Field>

                <Button
                  size="small"
                  type="submit"
                  disabled={overridablePixelsCount === 0}
                >
                  Save pixels ({overridablePixelsCount})
                </Button>

                <p className="text-center text-sm">
                  {totalCount - overridablePixelsCount} of {totalCount} Pixels
                  are currently locked!
                </p>

                {infoBox}
              </div>
            </form>
          </Box>
        </>
      ) : null}

      <h3 className="mt-8 mb-4 font-bold">Rename individual pixels</h3>

      {pixelsQuery.isError && pixelsQuery.error ? (
        <MessageBox variant="failure">
          Error loading Pixels: {pixelsQuery.error.message}
        </MessageBox>
      ) : null}

      {("isLoading" in pixelsQuery && pixelsQuery.isLoading) ||
      ("isPending" in pixelsQuery && pixelsQuery.isPending) ? (
        <MessageBox>Loading your Pixels…</MessageBox>
      ) : totalCount < 1 ? (
        <MessageBox>Could not find any Pixels!</MessageBox>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                overrideIdentifier={
                  enableOverridePreview ? overrideIdentifier : null
                }
                onRename={onRename}
              />
            </Box>
          );
        })}
      </div>
    </>
  );
}
