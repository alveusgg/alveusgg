import type { RouterInputs } from "@/utils/trpc";

export type PresetCommand = RouterInputs["presets"]["userCommand"];
export type PresetIntent = Omit<PresetCommand, "id">;
export type PresetOperationState = {
  command?: PresetCommand;
  status: "idle" | "pending" | "completed" | "failed" | "unknown";
  // A terminal unknown outcome needs acknowledgement, rather than more retries.
  terminal?: boolean;
  message?: string;
};
export function operationFailure(error: unknown): {
  definitive: boolean;
  message: string;
} {
  const data =
    error && typeof error === "object" && "data" in error
      ? error.data
      : undefined;
  const code =
    data && typeof data === "object" && "code" in data ? data.code : undefined;
  const definitive = [
    "UNAUTHORIZED",
    "FORBIDDEN",
    "BAD_REQUEST",
    "CONFLICT",
    "PRECONDITION_FAILED",
    "NOT_FOUND",
    "TOO_MANY_REQUESTS",
  ].includes(String(code));
  return {
    definitive,
    message:
      definitive && error instanceof Error
        ? error.message
        : "Completion is unknown. Checking the original operation; retry uses the same request.",
  };
}
export function commandForRetry(
  state: PresetOperationState,
): PresetCommand | undefined {
  return state.status === "unknown" && !state.terminal
    ? state.command
    : undefined;
}
