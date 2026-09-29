import { z } from "zod";

import type { Level } from "../permissions.ts";
import type { User } from "./types.ts";

export type CommandContext = {
  user: User;
  level: Level;
};

type ArgSchemas = readonly z.ZodType[];

type Args<TArgs extends ArgSchemas, TRest extends z.ZodType | undefined> = [
  ...{
    [K in keyof TArgs]: TArgs[K] extends z.ZodType ? z.output<TArgs[K]> : never;
  },
  ...(TRest extends z.ZodType ? z.output<TRest>[] : []),
];

export function command<
  const TArgs extends ArgSchemas,
  TRest extends z.ZodType | undefined = undefined,
>(config: {
  id: string;
  arguments: TArgs;
  /** Schema for any number of trailing arguments */
  rest?: TRest;
  aliases?: string[];
  description?: string;
  /** Lowest level allowed to run the command */
  permission: Level;
  execute: (
    args: Args<TArgs, TRest>,
    context: CommandContext,
  ) => Promise<string | void>;
}) {
  const tuple = z.tuple(
    config.arguments as unknown as [z.ZodType, ...z.ZodType[]],
  );
  const schema = config.rest ? tuple.rest(config.rest) : tuple;

  return {
    id: config.id,
    aliases: config.aliases,
    description: config.description,
    permission: config.permission,
    async run(raw: string[], context: CommandContext) {
      const result = schema.safeParse(raw);

      if (!result.success) {
        return {
          ok: false as const,
          error: result.error,
        };
      }

      try {
        const reply = await config.execute(result.data as never, context);
        return { ok: true as const, reply: reply ?? undefined };
      } catch (error) {
        return {
          ok: false as const,
          error: error,
        };
      }
    },
  };
}

export type Command = ReturnType<typeof command>;

export const isCommand = (text: string) => {
  return text.startsWith("!");
};

export const parse = (text: string) => {
  if (!isCommand(text)) return new Error("Invalid command");
  // Some chat clients append U+E0000 to let you send the same message twice
  const [command, ...args] = text
    .replaceAll("\u{E0000}", "")
    .slice(1)
    .trim()
    .split(/\s+/);
  if (!command) return new Error("Invalid command");
  return { command: command.toLowerCase(), args };
};
