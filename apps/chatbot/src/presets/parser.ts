export const presetCommands = [
  "ptzload",
  "ptzhome",
  "ptzsave",
  "ptzrename",
  "ptzremove",
  "ptzclear",
  "ptzlist",
] as const;
export type PresetCommandName = (typeof presetCommands)[number];
export type PresetIntent = {
  action: "save" | "load" | "rename" | "remove" | "clear";
  camera: string;
  name?: string;
  newName?: string;
};
export type ParsedPreset = PresetIntent | { action: "list"; camera: string };
export const usage: Record<PresetCommandName, string> = {
  ptzload: "!ptzload <camera> <preset>",
  ptzhome: "!ptzhome <camera>",
  ptzsave: "!ptzsave <camera> <preset>",
  ptzrename: "!ptzrename <camera> <old> <new>",
  ptzremove: "!ptzremove <camera> <preset>",
  ptzclear: "!ptzclear <camera> confirm",
  ptzlist: "!ptzlist <camera>",
};
// Easy-bot preserves whitespace-separated pieces; joining reconstructs quoted names.
export function quotedArguments(params: readonly string[]): string[] {
  const input = params.join(" "),
    tokens: string[] = [];
  let token = "",
    quote = "",
    started = false,
    closed = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i]!;
    if (quote) {
      if (c === quote) {
        quote = "";
        closed = true;
      } else if (c === "\\") {
        const next = input[++i];
        if (next !== quote && next !== "\\")
          throw new Error("Invalid quoted escape");
        token += next;
      } else token += c;
    } else if (/\s/.test(c)) {
      if (started) {
        tokens.push(token);
        token = "";
        started = false;
        closed = false;
      }
    } else if (c === '"' || c === "'") {
      if (started) throw new Error("Quotes must surround the complete name");
      quote = c;
      started = true;
    } else {
      if (closed) throw new Error("Unexpected text after quote");
      token += c;
      started = true;
    }
  }
  if (quote) throw new Error("Unclosed quote");
  if (started) tokens.push(token);
  return tokens;
}
export function parsePresetCommand(
  command: PresetCommandName,
  params: readonly string[],
): ParsedPreset {
  let args: string[];
  try {
    args = quotedArguments(params);
  } catch {
    throw new Error(`Usage: ${usage[command]}. Put multiword names in quotes.`);
  }
  const camera = args[0]?.toLowerCase();
  const count =
    command === "ptzhome" || command === "ptzlist"
      ? 1
      : command === "ptzrename"
        ? 3
        : 2;
  if (
    args.length !== count ||
    !camera ||
    camera === "all" ||
    !/^[a-z0-9_-]{1,100}$/.test(camera) ||
    args.some(
      (value) => !value.trim() || value.length > 100 || /\p{Cc}/u.test(value),
    ) ||
    (command === "ptzclear" && args[1] !== "confirm")
  )
    throw new Error(
      `Usage: ${usage[command]}. An explicit camera is required; quote multiword names.`,
    );
  if (command === "ptzlist") return { action: "list", camera };
  if (command === "ptzhome") return { action: "load", camera, name: "home" };
  if (command === "ptzclear") return { action: "clear", camera };
  if (command === "ptzrename")
    return { action: "rename", camera, name: args[1]!, newName: args[2]! };
  return {
    action:
      command === "ptzload"
        ? "load"
        : command === "ptzsave"
          ? "save"
          : "remove",
    camera,
    name: args[1]!,
  };
}
