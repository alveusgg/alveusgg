import { type FormEvent, useState } from "react";

import type {
  AnyRenamePixelMutation,
  MyPixel,
} from "@/server/trpc/router/donations";

import { classes } from "@/utils/classes";
import { formatDateTimeLocal } from "@/utils/datetime";

import {
  PIXEL_IDENTIFIER_MAX_LENGTH,
  PIXEL_IDENTIFIER_MIN_LENGTH,
  PIXEL_RENAME_LOCK_DURATION_TEXT,
  normalizePixelIdentifier,
} from "@/hooks/pixels";
import { useTimestamp } from "@/hooks/timestamp";

import MyPixelPreview from "@/components/institute/MyPixelPreview";
import { coordsToGridRef } from "@/components/institute/Pixels";
import DonationProviderIcon from "@/components/shared/DonationProviderIcon";
import { Button } from "@/components/shared/form/Button";

const confirmationMessage = (oldIdent: string, newIdent: string) =>
  `Are you sure you want to change your Pixel label from ${oldIdent} to ${newIdent}? ` +
  `You will only be able to change your Pixel every ${PIXEL_RENAME_LOCK_DURATION_TEXT}. ` +
  `The last date to change Pixel labels will be announced on Alveus channels!`;

type EditPixelFormProps<TMutation extends AnyRenamePixelMutation> = {
  pixel: MyPixel;
  provider: "twitch" | "paypal";
  overrideIdentifier?: string | null;
  renameMutation: TMutation;
  onRename: (
    mutate: ReturnType<TMutation["useMutation"]>["mutate"],
    pixel: MyPixel,
    newIdentifier: string,
  ) => unknown;
};

export function EditPixelForm<TMutation extends AnyRenamePixelMutation>({
  pixel,
  provider,
  overrideIdentifier = null,
  renameMutation,
  onRename,
}: EditPixelFormProps<TMutation>) {
  // Refresh every 30 seconds to update locked status
  useTimestamp(30_000);

  const rename = renameMutation.useMutation();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newIdentifier = formData.get("identifier");
    if (typeof newIdentifier !== "string" || !newIdentifier) return;

    onRename(rename.mutate, pixel, newIdentifier);
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
        <label htmlFor={`${pixel.id}-identifier`} className="block text-sm">
          Your label:
        </label>
        <textarea
          id={`${pixel.id}-identifier`}
          name="identifier"
          autoComplete="username nickname given-name"
          required
          minLength={PIXEL_IDENTIFIER_MIN_LENGTH}
          maxLength={PIXEL_IDENTIFIER_MAX_LENGTH}
          value={identifier}
          wrap="hard"
          rows={2}
          cols={20}
          disabled={isDisabled}
          className={classes(
            "block max-h-[calc(2lh+2*var(--sizing))] resize-none overflow-hidden rounded border border-gray-300 p-2",
            isDisabled
              ? "cursor-not-allowed bg-gray-100 text-gray-500"
              : "bg-white",
          )}
          onChange={(e) => {
            setIdentifier(normalizePixelIdentifier(e.target.value));
          }}
        />
      </div>
      <Button
        type="submit"
        size="small"
        confirmationMessage={confirmationMessage(pixel.identifier, identifier)}
        disabled={rename.isPending || isDisabled}
      >
        {rename.isPending
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

      {rename.isError ? (
        <em className="text-red-600">Error: {rename.error.message}</em>
      ) : null}

      {rename.isSuccess ? <em className="text-green-600">Updated!</em> : null}
    </form>
  );
}
