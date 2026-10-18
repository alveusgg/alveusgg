type ProcedureErrorMessageProps = {
  error: { message: string };
};

/**
 * Shows the message of a failed tRPC procedure. Input validation errors come
 * with one line per issue (see the error formatter), which we show as a list.
 */
export function ProcedureErrorMessage({ error }: ProcedureErrorMessageProps) {
  const lines = error.message.split("\n");
  if (lines.length < 2) return error.message;

  return (
    <ul className="list-disc pl-5">
      {lines.map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  );
}
