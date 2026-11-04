import { type ZodError } from "zod";

import { camelToSentence } from "@/utils/string-case";

export type ProcedureError = {
  message: string;
  data?: { zodIssues?: ZodError["issues"] | null } | null;
};

/**
 * Format validation issues for display without changing the original error.
 * Use the last named key of each path, e.g. "Postal code" for
 * `mailingAddress.postalCode`, and leave other error messages as they are.
 */
export const getProcedureErrorMessages = (error: ProcedureError): string[] => {
  if (!error.data?.zodIssues?.length) return [error.message];

  const lines = error.data.zodIssues.map(({ path, message }) => {
    const field = path.findLast((key) => typeof key === "string");
    return field ? `${camelToSentence(field)}: ${message}` : message;
  });

  return [...new Set(lines)];
};
