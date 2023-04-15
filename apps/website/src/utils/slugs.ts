import slugify from "slugify";

export const SLUG_PATTERN = "[a-z][0-9a-z-]*";
export const SLUG_REGEX = RegExp(SLUG_PATTERN);

export function convertToSlug(str: string) {
  return slugify(str, {
    replacement: "-",
    lower: true,
    locale: "en",
    trim: true,
    strict: true,
  });
}
