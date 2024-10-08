import type { AnyProcedure } from "@trpc/server";
import type { TRPCClientErrorLike } from "@trpc/client";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { camelToSentence } from "@/utils/string-case";

type MutationErrorMessageProps<T extends AnyProcedure> = {
  error: TRPCClientErrorLike<T>;
};

export function ProcedureErrorMessage<T extends AnyProcedure>({
  error,
}: MutationErrorMessageProps<T>) {
  if (error?.data?.zodError) {
    return (
      <ul>
        {(error.data.zodError.formErrors as Array<string>).map(
          (error, index) => (
            <li key={`form-error-${index}`}>{error}</li>
          ),
        )}

        {typeSafeObjectEntries(error.data.zodError.fieldErrors).map(
          ([field, error]) => (
            <li key={String(field)}>
              {camelToSentence(String(field))}: {error}
            </li>
          ),
        )}
      </ul>
    );
  }

  return error.message;
}
