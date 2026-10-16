import type usePresetOperation from "@/hooks/preset-operation";

export default function OperationStatus({
  operation,
}: {
  operation: ReturnType<typeof usePresetOperation>;
}) {
  const { state } = operation;
  if (state.status === "idle") return null;
  return (
    <div
      role={state.status === "failed" ? "alert" : "status"}
      className="my-2 text-sm"
      aria-live="polite"
    >
      <p>
        {state.status === "pending"
          ? "Operation pending..."
          : state.status === "completed"
            ? "Operation completed."
            : state.status === "failed"
              ? "Operation failed."
              : "Completion unknown."}{" "}
        {state.message}
      </p>
      {state.command && (
        <p className="text-xs break-all opacity-75">
          {state.command.action}: {state.command.camera}
          {state.command.name ? ` / ${state.command.name}` : ""} — Operation:{" "}
          {state.command.id}
        </p>
      )}
      {state.status === "unknown" && (
        <button
          type="button"
          onClick={operation.retry}
          className="mt-1 underline"
        >
          Retry original request
        </button>
      )}
    </div>
  );
}
