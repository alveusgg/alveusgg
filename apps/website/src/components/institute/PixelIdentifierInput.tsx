import { classes } from "@/utils/classes";

import {
  PIXEL_IDENTIFIER_MAX_LENGTH,
  PIXEL_IDENTIFIER_MIN_LENGTH,
  normalizePixelIdentifier,
} from "@/hooks/pixels";

export function PixelIdentifierInput({
  id,
  value,
  setValue,
  isDisabled,
}: {
  id: string;
  value: string;
  setValue: (value: string) => void;
  isDisabled?: boolean;
}) {
  return (
    <>
      <label htmlFor={id} className="block text-sm">
        Your label:
      </label>
      <textarea
        id={id}
        name="identifier"
        autoComplete="username nickname given-name"
        required
        minLength={PIXEL_IDENTIFIER_MIN_LENGTH}
        maxLength={PIXEL_IDENTIFIER_MAX_LENGTH}
        value={value}
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
          setValue(normalizePixelIdentifier(e.target.value));
        }}
      />
    </>
  );
}
