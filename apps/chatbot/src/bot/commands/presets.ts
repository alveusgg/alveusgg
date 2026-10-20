import type { BotCommandContext } from "@twurple/easy-bot";
import { createBotCommand } from "@twurple/easy-bot";
import {
  createPresetClient,
  presetError,
  type PresetTransport,
} from "../../presets/client";
import {
  presetCommands,
  parsePresetCommand,
  type PresetCommandName,
} from "../../presets/parser";
import { presetOperationId, runPresetOperation } from "../../presets/operation";

type Context = Pick<
  BotCommandContext,
  "userId" | "userDisplayName" | "broadcasterId" | "reply"
> & { msg?: { id?: string } };
export function presetHandler(
  transport: PresetTransport,
  { run = runPresetOperation }: { run?: typeof runPresetOperation } = {},
) {
  const events = new Map<string, Promise<string>>();
  return async (
    command: PresetCommandName,
    params: string[],
    context: Context,
  ) => {
    if (!/^\d{1,100}$/.test(context.userId)) {
      await context.reply(
        "Cannot identify the Twitch user for this preset request.",
      );
      return;
    }
    let parsed;
    try {
      parsed = parsePresetCommand(command, params);
    } catch (error) {
      await context.reply(
        error instanceof Error ? error.message : "Invalid preset command.",
      );
      return;
    }
    const id = presetOperationId({
      messageId: context.msg?.id,
      broadcasterId: context.broadcasterId,
      userId: context.userId,
    });
    let result = events.get(id);
    if (!result) {
      result = (async () => {
        try {
          if (parsed.action === "list") {
            const rows = await transport.catalog(parsed.camera);
            return `Presets for ${parsed.camera}: ${
              rows
                .map((row) => row.name)
                .join(", ")
                .slice(0, 380) || "none"
            }`;
          }
          return await run(
            {
              command: { id, ...parsed },
              actor: {
                twitchUserId: context.userId,
                name: context.userDisplayName,
              },
            },
            transport,
          );
        } catch (error) {
          return presetError(error).message;
        }
      })();
      if (events.size >= 1000) events.delete(events.keys().next().value!);
      events.set(id, result);
    }
    await context.reply(await result);
  };
}
export function createPresetCommands({
  keyFile,
  apiBaseUrl,
  transport,
}: {
  keyFile?: string;
  apiBaseUrl: string;
  transport?: PresetTransport;
}) {
  if (!keyFile) return [];
  const client = transport ?? createPresetClient({ apiBaseUrl, keyFile });
  const handle = presetHandler(client);
  return presetCommands.map((name) =>
    createBotCommand(name, (params, context) => handle(name, params, context)),
  );
}
