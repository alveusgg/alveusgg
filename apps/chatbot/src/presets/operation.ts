import { createHash, randomUUID } from "node:crypto";
import {
  PresetClientError,
  presetError,
  type ChatPresetInput,
  type PresetTransport,
} from "./client";

export function presetOperationId({
  messageId,
  broadcasterId,
  userId,
}: {
  messageId?: string;
  broadcasterId: string;
  userId: string;
}) {
  if (!messageId) return randomUUID();
  const hex = createHash("sha1")
    .update(
      JSON.stringify([
        "alveus-preset-chat-v1",
        broadcasterId,
        userId,
        messageId,
      ]),
    )
    .digest("hex")
    .slice(0, 32)
    .split("");
  hex[12] = "5";
  hex[16] = ((parseInt(hex[16]!, 16) & 3) | 8).toString(16);
  const value = hex.join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}
async function bounded<T>(
  call: (signal: AbortSignal) => Promise<T>,
  deadline: number,
  now: () => number,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () => {
        controller.abort();
        reject(
          new PresetClientError(
            "UNAVAILABLE",
            "Website preset operation timed out.",
          ),
        );
      },
      Math.max(1, deadline - now()),
    );
  });
  try {
    return await Promise.race([call(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
export async function runPresetOperation(
  input: ChatPresetInput,
  transport: PresetTransport,
  {
    timeout = 15000,
    pollInterval = 500,
    wait = sleep,
    now = Date.now,
  }: {
    timeout?: number;
    pollInterval?: number;
    wait?: (ms: number) => Promise<void>;
    now?: () => number;
  } = {},
) {
  const id = input.command.id,
    deadline = now() + timeout;
  let operation,
    uncertain = false;
  for (let attempt = 0; attempt < 3 && now() < deadline; attempt++) {
    try {
      operation = await bounded(
        (signal) => transport.command(input, signal),
        deadline,
        now,
      );
      break;
    } catch (error) {
      const failure = presetError(error);
      if (!failure.transient && !uncertain)
        return `${failure.message} Operation: ${id}`;
      if (!failure.transient) break;
      uncertain = true;
      await wait(Math.min(pollInterval, Math.max(0, deadline - now())));
    }
  }
  while (now() < deadline) {
    if (operation?.id === id) {
      if (operation.status === "completed")
        return `Preset ${input.command.action} completed. Operation: ${id}`;
      if (operation.status === "failed")
        return `Preset ${input.command.action} failed. Check the website for details. Operation: ${id}`;
    }
    await wait(Math.min(pollInterval, Math.max(0, deadline - now())));
    if (now() >= deadline) break;
    try {
      operation = await bounded(
        (signal) =>
          transport.operation(
            { id, actor: { twitchUserId: input.actor.twitchUserId } },
            signal,
          ),
        deadline,
        now,
      );
    } catch (error) {
      const failure = presetError(error);
      if (["UNAUTHORIZED", "FORBIDDEN", "CONFIGURATION"].includes(failure.code))
        break;
      operation = undefined;
    }
  }
  return `Preset operation pending; completion unknown. Operation: ${id}. Check the website before trying another command.`;
}
