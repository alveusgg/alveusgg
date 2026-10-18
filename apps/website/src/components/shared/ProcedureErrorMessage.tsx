import {
  type ProcedureError,
  getProcedureErrorMessages,
} from "@/utils/trpc-errors";

type ProcedureErrorMessageProps = {
  error: ProcedureError;
};

/**
 * Show readable validation issues while keeping the raw tRPC error available.
 */
export function ProcedureErrorMessage({ error }: ProcedureErrorMessageProps) {
  const messages = getProcedureErrorMessages(error);
  if (messages.length < 2) return messages[0];

  return (
    <ul className="list-disc pl-5">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}
