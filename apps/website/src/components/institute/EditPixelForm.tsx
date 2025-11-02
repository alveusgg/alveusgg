import { type FormEvent, useState } from "react";

import { env } from "@/env";

import type { DonationPixel } from "@/server/trpc/router/donations";

import { classes } from "@/utils/classes";
import { formatDateTimeLocal } from "@/utils/datetime";

import type { SharedEditPixelProps } from "@/components/institute/EditPixelsForm";
import { PixelIdentifierInput } from "@/components/institute/PixelIdentifierInput";
import PixelPreview from "@/components/institute/PixelPreview";
import { coordsToGridRef } from "@/components/institute/Pixels";
import DonationProviderIcon from "@/components/shared/DonationProviderIcon";
import { Button } from "@/components/shared/form/Button";

import IconLoading from "@/icons/IconLoading";

import { RenderTimeLocked } from "../shared/RenderTimeLocked";

export function formatPixelRenameLockDuration() {
  const duration = env.NEXT_PUBLIC_PIXELS_RENAME_LOCK_DURATION_MS;

  return duration >= 60 * 60 * 1000
    ? `${duration / (60 * 60 * 1000)} hours`
    : `${duration / (60 * 1000)} minutes`;
}

const confirmationMessage = (oldIdent: string, newIdent: string) =>
  `Are you sure you want to rename your pixel from "${oldIdent}" to "${newIdent}"? ` +
  `Pixels can only be renamed once every ${formatPixelRenameLockDuration()}.`;

type EditPixelFormProps = SharedEditPixelProps & {
  pixel: DonationPixel;
  provider: "twitch" | "paypal";
};

export function EditPixelForm({
  pixel,
  provider,
  overrideIdentifier,
  renameMutation,
  onRename,
}: EditPixelFormProps) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newIdentifier = formData.get("identifier");
    if (typeof newIdentifier !== "string" || !newIdentifier) return;

    onRename(newIdentifier, pixel.id);
  };

  const [identifier, setIdentifier] = useState("");

  const gridRef = coordsToGridRef({ x: pixel.column, y: pixel.row });

  const hasOverride = !!overrideIdentifier;

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
          <RenderTimeLocked lockedUntil={pixel.lockedUntil}>
            {(isLocked) => (
              <PixelPreview
                x={pixel.column}
                y={pixel.row}
                identifier={
                  isLocked
                    ? pixel.identifier
                    : overrideIdentifier || identifier || pixel.identifier
                }
              />
            )}
          </RenderTimeLocked>
        </div>
      </div>

      <RenderTimeLocked lockedUntil={pixel.lockedUntil}>
        {(isLocked) => (
          <div
            className={classes("w-full", !isLocked && hasOverride && "hidden")}
          >
            <PixelIdentifierInput
              id={`${pixel.id}-identifier`}
              value={identifier}
              setValue={setIdentifier}
              placeholder={pixel.identifier}
              isDisabled={hasOverride || isLocked}
            />
          </div>
        )}
      </RenderTimeLocked>

      <RenderTimeLocked lockedUntil={pixel.lockedUntil}>
        {(isLocked) => (
          <Button
            type="submit"
            size="small"
            confirmationMessage={confirmationMessage(
              pixel.identifier,
              identifier,
            )}
            disabled={
              !identifier ||
              identifier === pixel.identifier ||
              renameMutation.isPending ||
              isLocked
            }
            hidden={!isLocked && hasOverride}
          >
            {renameMutation.isPending ? (
              <>
                <IconLoading /> Saving…
              </>
            ) : isLocked ? (
              `Locked until ${formatDateTimeLocal(pixel.lockedUntil!, {
                time: "minutes",
                timezone: false,
              })}`
            ) : (
              "Save pixel"
            )}
          </Button>
        )}
      </RenderTimeLocked>

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
                  Error: {res.errorMessage ?? "Failed to rename pixel!"}
                </em>
              );
            } else if (res.isSkipped && res.reason === "locked") {
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
