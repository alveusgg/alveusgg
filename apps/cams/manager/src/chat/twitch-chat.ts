import { DurableObject } from "cloudflare:workers";

import { hasLevel, levelOf } from "../permissions.ts";
import { type Command, isCommand, parse } from "./command.ts";
import commands from "./commands";
import type { ChatMessage } from "./types.ts";

// Chatters below VIP can only run the same command on the same camera this often
const THROTTLE_MS = 1500;

export class TwitchChat extends DurableObject {
  private lookup: Map<string, Command>;
  private last = new Map<string, number>();
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    const lookup = new Map<string, Command>();

    for (const command of commands) {
      lookup.set(command.id, command);
      if (!command.aliases) continue;
      for (const alias of command.aliases) {
        lookup.set(alias, command);
      }
    }

    this.lookup = lookup;
  }

  get(name: string) {
    const command = this.lookup.get(name);
    if (!command) return new Error(`Command ${name} not found`);
    return command;
  }

  private throttled(key: string) {
    const now = Date.now();
    const last = this.last.get(key);
    if (last !== undefined && now - last < THROTTLE_MS) return true;
    this.last.set(key, now);
    return false;
  }

  async onChatMessage(message: ChatMessage) {
    // Unknown commands and chatters without access are ignored silently, as
    // the chat is shared with plenty of other bots and commands
    if (!isCommand(message.text)) return;
    const command = parse(message.text);
    if (command instanceof Error) return;

    const tool = this.get(command.command);
    if (tool instanceof Error) return;

    const level = levelOf(message.user);
    if (!level || !hasLevel(level, tool.permission)) return;

    if (!hasLevel(level, "vip")) {
      const key = `${tool.id}:${command.args[0]?.toLowerCase() ?? ""}`;
      if (this.throttled(key)) return;
    }

    const result = await tool.run(command.args, { user: message.user, level });
    if (!result.ok) {
      console.warn(
        `!${command.command} from ${message.user.login} failed`,
        result.error,
      );
      return;
    }
    if (result.reply) await this.send(result.reply);
  }

  async send(message: string) {}
}
