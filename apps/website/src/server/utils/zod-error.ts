import { type ZodError } from "zod";

import { camelToSentence } from "@/utils/string-case";

/**
 * Zod's own message is a JSON dump of all issues. This returns one line per
 * issue instead, prefixed with the field it belongs to (the last named key of
 * its path, e.g. "Postal code" for `mailingAddress.postalCode`).
 */
export const formatZodError = (error: ZodError) => {
  const lines = error.issues.map(({ path, message }) => {
    const field = path.findLast((key) => typeof key === "string");
    return field ? `${camelToSentence(field)}: ${message}` : message;
  });

  return [...new Set(lines)].join("\n");
};
