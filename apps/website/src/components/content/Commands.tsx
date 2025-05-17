import {
  type Argument,
  type Command,
  isOverloadedArguments,
} from "@/data/tech/commands";

import { classes } from "@/utils/classes";

import CopyToClipboardButton from "../CopyToClipboardButton";

export interface NamedCommand extends Command {
  name: string;
}

const signatureArg = (arg: Argument) =>
  [
    arg.required ? "<" : "[",
    arg.type !== "choice" || arg.choices.length > 1 ? `${arg.name}:` : "",
    arg.prefix ? `'${arg.prefix}' + ` : "",
    arg.type === "choice"
      ? arg.choices.map((choice) => `'${choice}'`).join("|")
      : arg.type,
    arg.variadic ? "..." : "",
    arg.suffix ? ` + '${arg.suffix}'` : "",
    arg.required ? ">" : "]",
  ].join("");

export const signature = (command: NamedCommand, noOverload = false) => {
  const { name, args } = command;
  const cmd = `!${name}`;
  if (!args) return cmd;

  const cmdArgs = isOverloadedArguments(args)
    ? args
        .map(
          (nestedArgs) =>
            nestedArgs.map((arg) => signatureArg(arg)).join(" ") || "[]",
        )
        .slice(0, noOverload ? 1 : undefined)
        .join(`\n${" ".repeat(cmd.length - 1)}| `)
    : args.map((arg) => signatureArg(arg)).join(" ");

  return `${cmd} ${cmdArgs}`;
};

const Commands = ({
  commands,
  className,
}: {
  commands: NamedCommand[];
  className?: string;
}) => (
  <dl className={classes("max-w-full overflow-x-auto", className)}>
    {commands.map((command) => (
      <div
        key={command.name}
        className="mb-4 flex flex-col items-baseline lg:mb-0 lg:flex-row lg:gap-2"
      >
        <dt>
          <pre>
            <code className="text-sm">{signature(command)}</code>
          </pre>
        </dt>

        <dd className="flex items-center gap-1">
          <CopyToClipboardButton text={signature(command, true)} />
          <p className="text-sm text-alveus-green-400 italic">
            {command.description}
          </p>
        </dd>
      </div>
    ))}
  </dl>
);

export default Commands;
