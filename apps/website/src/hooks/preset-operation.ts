import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

import {
  type PresetCommand,
  type PresetIntent,
  type PresetOperationState,
  commandForRetry,
  operationFailure,
} from "@/utils/preset-operation";
import { trpc } from "@/utils/trpc";

const savedCommandSchema = z.object({
  id: z.uuid(),
  action: z.enum(["load", "save", "rename", "remove", "clear"]),
  camera: z.string(),
  name: z.string().optional(),
  newName: z.string().optional(),
});
export default function usePresetOperation(baseStorageKey: string) {
  const { data: session } = useSession();
  const storageKey = `${baseStorageKey}:${session?.user?.id ?? "anonymous"}`;
  const utils = trpc.useUtils();
  const mutation = trpc.presets.userCommand.useMutation();
  const [state, setState] = useState<PresetOperationState>({ status: "idle" });
  const locked = useRef(false),
    generation = useRef(0);
  const terminalId = useRef<string | undefined>(undefined);
  const invalidateGeneration = useCallback(() => {
    generation.current++;
  }, []);
  const save = useCallback(
    (command?: PresetCommand) => {
      try {
        if (command)
          sessionStorage.setItem(storageKey, JSON.stringify(command));
        else sessionStorage.removeItem(storageKey);
      } catch {
        /* The in-memory UUID remains usable when storage is unavailable. */
      }
    },
    [storageKey],
  );
  useEffect(() => {
    generation.current++;
    terminalId.current = undefined;
    let command: PresetCommand | undefined;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) command = savedCommandSchema.parse(JSON.parse(raw));
    } catch {
      /* Ignore invalid or unavailable browser state. */
    }
    locked.current = !!command;
    setState(
      command
        ? {
            command,
            status: "unknown",
            message: "Checking the original operation...",
          }
        : { status: "idle" },
    );
    return invalidateGeneration;
  }, [storageKey, invalidateGeneration]);
  const accept = useCallback(
    (
      command: PresetCommand,
      result: {
        id: string;
        status: "pending" | "completed" | "failed" | "unknown";
        error: string | null;
      },
    ) => {
      if (terminalId.current === command.id) return;
      if (result.id !== command.id) {
        setState({
          command,
          status: "unknown",
          message:
            "Operation response did not match. Checking the original request.",
        });
        return;
      }
      const terminal = result.status !== "pending";
      locked.current = !terminal || result.status === "unknown";
      setState({
        command,
        status: result.status,
        terminal,
        message: result.error ?? undefined,
      });
      if (terminal) {
        terminalId.current = command.id;
        if (result.status !== "unknown") save();
        void utils.presets.catalog.invalidate();
      }
    },
    [save, utils],
  );
  const submit = useCallback(
    async (command: PresetCommand, recovery = false) => {
      const current = ++generation.current;
      locked.current = true;
      save(command);
      setState({ command, status: "pending" });
      try {
        const result = await mutation.mutateAsync(command);
        if (generation.current === current) accept(command, result);
      } catch (error) {
        if (generation.current !== current || terminalId.current === command.id)
          return;
        const failure = operationFailure(error);
        const definitive = failure.definitive && !recovery;
        locked.current = !definitive;
        if (definitive) {
          terminalId.current = command.id;
          save();
        }
        setState({
          command,
          status: definitive ? "failed" : "unknown",
          message: failure.message,
        });
      }
    },
    [accept, mutation, save],
  );
  const busy = state.status === "pending" || state.status === "unknown";
  const active = busy && !state.terminal;
  useEffect(() => {
    const command = state.command;
    if (!command || !active) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const result = await utils.presets.userOperation.fetch({
          id: command.id,
        });
        if (cancelled) return;
        accept(command, result);
        if (result.status !== "pending") return;
      } catch {
        if (cancelled || terminalId.current === command.id) return;
        setState((previous) =>
          previous.command?.id === command.id
            ? {
                ...previous,
                status: "unknown",
                message:
                  "Completion is unknown. Checking the original operation; retry uses the same request.",
              }
            : previous,
        );
      }
      timer = setTimeout(poll, 1000);
    };
    timer = setTimeout(poll, 750);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [accept, active, state.command, utils]);
  const run = useCallback(
    (intent: PresetIntent) => {
      if (locked.current) return;
      void submit({ ...intent, id: crypto.randomUUID() });
    },
    [submit],
  );
  const retry = useCallback(() => {
    const command = commandForRetry(state);
    if (command) void submit(command, true);
  }, [state, submit]);
  const acknowledge = useCallback(() => {
    if (state.status !== "unknown" || !state.terminal) return;
    invalidateGeneration();
    locked.current = false;
    save();
    setState({ status: "idle" });
  }, [state, invalidateGeneration, save]);
  return { state, busy, run, retry, acknowledge };
}
