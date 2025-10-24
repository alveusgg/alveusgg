import { type FormEvent, useState } from "react";

import type { MyPixel } from "@/server/trpc/router/donations";

import { formatDateTimeLocal } from "@/utils/datetime";

import { PIXEL_RENAME_LOCK_DURATION_TEXT } from "@/hooks/pixels";
import { useTimestamp } from "@/hooks/timestamp";

import type { SharedEditPixelProps } from "@/components/institute/EditPixelsForm";
import MyPixelPreview from "@/components/institute/MyPixelPreview";
import { PixelIdentifierInput } from "@/components/institute/PixelIdentifierInput";
import { coordsToGridRef } from "@/components/institute/Pixels";
import DonationProviderIcon from "@/components/shared/DonationProviderIcon";
import { Button } from "@/components/shared/form/Button";

const confirmationMessage = (oldIdent: string, newIdent: string) =>
  `Are you sure you want to change your Pixel label from ${oldIdent} to ${newIdent}? ` +
  `You will only be able to change your Pixel every ${PIXEL_RENAME_LOCK_DURATION_TEXT}. ` +
  `The last date to change Pixel labels will be announced on Alveus channels!`;

type EditPixelFormProps = SharedEditPixelProps & {
  pixel: MyPixel;
  provider: "twitch" | "paypal";
};

export function EditPixelForm({
  pixel,
  provider,
  overrideIdentifier,
  renameMutation,
  onRename,
}: EditPixelFormProps) {
  // Refresh every 30 seconds to update locked status
  useTimestamp(30_000);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newIdentifier = formData.get("identifier");
    if (typeof newIdentifier !== "string" || !newIdentifier) return;

    onRename(newIdentifier, pixel.id);
  };

  const [identifier, setIdentifier] = useState(pixel.identifier);

  const gridRef = coordsToGridRef({ x: pixel.column, y: pixel.row });

  const isLocked = pixel.lockedUntil && pixel.lockedUntil > new Date();
  const isDisabled = overrideIdentifier !== null || isLocked;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between leading-none">
        <strong className="text-lg">
          {gridRef.x}:{gridRef.y}
        </strong>
        <div className="flex shrink-0 flex-row items-center gap-1 text-xs text-gray-600">
          {formatDateTimeLocal(pixel.receivedAt, {
            time: "minutes",
            timezone: false,
          })}
          <DonationProviderIcon className="size-3" provider={provider} />
        </div>
      </div>

      <div className="flex flex-row items-center justify-center">
        <div className="overflow-hidden rounded-sm border border-gray-300 shadow-sm">
          <MyPixelPreview
            x={pixel.column}
            y={pixel.row}
            identifier={
              isLocked ? pixel.identifier : overrideIdentifier || identifier
            }
          />
        </div>
      </div>

      <div className="w-full">
        <PixelIdentifierInput
          id={`${pixel.id}-identifier`}
          value={identifier}
          setValue={setIdentifier}
          isDisabled={isDisabled}
        />
      </div>

      <Button
        type="submit"
        size="small"
        confirmationMessage={confirmationMessage(pixel.identifier, identifier)}
        disabled={renameMutation.isPending || isDisabled}
      >
        {renameMutation.isPending
          ? "Saving..."
          : isLocked
            ? `Locked until ${formatDateTimeLocal(pixel.lockedUntil!, {
                time: "minutes",
                timezone: false,
              })}`
            : isDisabled
              ? "- Save all Pixels -"
              : "Save change"}
      </Button>

      {renameMutation.isError ? (
        <em className="text-red-600">Error: {renameMutation.error.message}</em>
      ) : null}

      {renameMutation.isSuccess && renameMutation.data.length === 0 ? (
        <em className="text-red-600">Error: Could not find or verify pixel!</em>
      ) : null}

      {renameMutation.isSuccess
        ? renameMutation.data.map((res) => {
            if (res.pixelId !== pixel.id) return null;

            if (res.isSuccess) {
              return (
                <em key={res.pixelId} className="text-green-600">
                  Updated!
                </em>
              );
            } else if (res.isError) {
              return (
                <em key={res.pixelId} className="text-red-600">
                  Error: {res.errorMessage ?? "Failed to rename Pixel!"}
                </em>
              );
            } else if (res.isSkipped && res.reason === "lock") {
              return (
                <em key={res.pixelId} className="text-red-600">
                  Error: Pixel is currently locked!
                </em>
              );
            } else if (res.isSkipped && res.reason === "same") {
              return (
                <em key={res.pixelId} className="text-yellow">
                  Pixel already has that identifier (skipped)
                </em>
              );
            }
          })
        : null}
    </form>
  );
}
