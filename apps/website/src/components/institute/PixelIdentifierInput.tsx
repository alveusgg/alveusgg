import { z } from "zod";

import { classes } from "@/utils/classes";

const PIXEL_IDENTIFIER_MIN_LENGTH = 2;
const PIXEL_IDENTIFIER_MAX_LENGTH = 32;

export const pixelIdentifierSchema = z
  .string()
  .trim()
  .min(PIXEL_IDENTIFIER_MIN_LENGTH)
  .max(PIXEL_IDENTIFIER_MAX_LENGTH)
  .transform(normalizePixelIdentifier);

function normalizePixelIdentifier(ident: string) {
  let normalized = ident
    // Allow (L)etter, (N)umbers (P)unctuation (S)ymbols, Spaces and newlines
    .replace(/[^\p{L}\p{N}\p{P}\p{S} \n]/gu, "")
    // Then filter those symbols to not allow emoji
    .replace(/\p{Extended_Pictographic}/gu, "");

  // Only keep the first line break and replace subsequent line breaks with spaces
  const firstLineBreakIndex = normalized.indexOf("\n");
  if (firstLineBreakIndex !== -1) {
    const before = normalized.slice(0, firstLineBreakIndex + 1);
    const after = normalized.slice(firstLineBreakIndex + 1).replace(/\n/g, " ");
    normalized = before + after;
  }

  return normalized;
}

export function PixelIdentifierInput({
  id,
  value,
  setValue,
  isDisabled,
  placeholder,
}: {
  id: string;
  value: string;
  setValue: (value: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only block text-sm">
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
        inputMode="text"
        disabled={isDisabled}
        className={classes(
          "block min-h-[calc(2lh+2*var(--sizing))] w-full resize-y overflow-hidden rounded border border-gray-300 p-2",
          isDisabled
            ? "cursor-not-allowed bg-gray-100 text-gray-500"
            : "bg-white",
        )}
        onChange={(e) => {
          setValue(normalizePixelIdentifier(e.target.value));
        }}
        placeholder={placeholder}
      />
    </>
  );
}
