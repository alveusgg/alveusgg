import { Field, Label, Switch } from "@headlessui/react";
import { type FormEvent, type ReactNode, useState } from "react";

import type {
  AnyRenameAllPixelsMutation,
  AnyRenamePixelMutation,
  DonationPixel,
  MyPixel,
} from "@/server/trpc/router/donations";

import {
  PIXEL_IDENTIFIER_MAX_LENGTH,
  PIXEL_IDENTIFIER_MIN_LENGTH,
  normalizePixelIdentifier,
} from "@/hooks/pixels";

import Box from "@/components/content/Box";
import { EditPixelForm } from "@/components/institute/EditPixelForm";
import { MessageBox } from "@/components/shared/MessageBox";
import { Button } from "@/components/shared/form/Button";

type EditPixelsFormProps<
  TMutation extends AnyRenamePixelMutation,
  TAllMutation extends AnyRenameAllPixelsMutation,
> = {
  pixelsQuery: {
    isError: boolean;
    isPending: boolean;
    isLoading?: boolean;
    isSuccess: boolean;
    data?: DonationPixel[];
    error: { message: string } | null;
  };
  overrideIdentifier: string;
  setOverrideIdentifier: (identifier: string) => void;
  renameMutation: TMutation;
  renameAllMutation: TAllMutation;
  onRename: (
    mutate: ReturnType<TMutation["useMutation"]>["mutate"],
    pixel: MyPixel,
    newIdentifier: string,
  ) => unknown;
  onRenameAll: (
    mutate: ReturnType<TAllMutation["useMutation"]>["mutate"],
  ) => unknown;
};

export function EditPixelsForm<
  TMutation extends AnyRenamePixelMutation,
  TAllMutation extends AnyRenameAllPixelsMutation,
>({
  overrideIdentifier,
  setOverrideIdentifier,
  renameMutation,
  renameAllMutation,
  pixelsQuery,
  onRename,
  onRenameAll,
}: EditPixelsFormProps<TMutation, TAllMutation>) {
  const [enableOverridePreview, setEnableOverridePreview] = useState(false);
  const renameAll = renameAllMutation.useMutation();

  const submitRenameAll = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onRenameAll(renameAll.mutate);
  };

  let infoBox: ReactNode;
  if (renameAll.isPending) {
    infoBox = <MessageBox>Renaming all your Pixels…</MessageBox>;
  } else if (renameAll.isError) {
    infoBox = (
      <MessageBox variant="failure">
        Error renaming Pixels: {renameAll.error.message}
      </MessageBox>
    );
  } else if (renameAll.isSuccess) {
    const { renamedCount, failedCount, skippedCount } = renameAll.data || {};
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
          Renamed {renamedCount} Pixels, but failed to rename {failedCount}{" "}
          Pixels.
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
          <h3 className="mt-8 mb-4 font-bold">
            Change all your Pixels at once
          </h3>
          <Box className="bg-white p-4">
            <div className="flex flex-row items-center justify-between leading-none">
              <strong className="text-lg">All Pixels</strong>
            </div>

            <form
              onSubmit={submitRenameAll}
              className="mt-4 justify-between gap-6 md:flex md:flex-row"
            >
              <div className="flex max-w-sm grow flex-col gap-2">
                <label htmlFor="all-identifier" className="text-sm">
                  Your label:
                </label>
                <textarea
                  id="all-identifier"
                  name="identifier"
                  autoComplete="username nickname given-name"
                  required
                  minLength={PIXEL_IDENTIFIER_MIN_LENGTH}
                  maxLength={PIXEL_IDENTIFIER_MAX_LENGTH}
                  value={overrideIdentifier}
                  wrap="hard"
                  rows={2}
                  cols={20}
                  className="block max-h-[calc(2lh+2*var(--sizing))] resize-none overflow-hidden rounded border border-gray-300 bg-white p-2"
                  onChange={(e) => {
                    setOverrideIdentifier(
                      normalizePixelIdentifier(e.target.value),
                    );
                  }}
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
                  Change My Pixels ({overridablePixelsCount})
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

      <h3 className="mt-8 mb-4 font-bold">
        Preview and change individual Pixels
      </h3>

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
