import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { z } from "zod";

import type { runCommandSchema } from "@/server/trpc/router/stream";

import { scopeGroups } from "@/data/twitch";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import IconVideoCamera from "@/icons/IconVideoCamera";

import ActionButton from "./ActionButton";

const getCommandTooltip = (command: string, args?: string[]) => {
  const CommandTooltip = ({
    className,
    children,
  }: {
    className: string;
    children: string;
  }) => (
    <div className={classes(className, "flex flex-col")}>
      <span>{children}</span>
      <span className="font-mono text-xs text-alveus-green-300">
        !{[command, ...(args ?? [])].join(" ")}
      </span>
    </div>
  );
  return CommandTooltip;
};

interface RunCommandButtonProps extends z.infer<typeof runCommandSchema> {
  subOnly?: boolean;
}

const RunCommandButton = ({
  command,
  args,
  subOnly = false,
}: RunCommandButtonProps) => {
  const { data: session } = useSession();
  const hasScopes = scopeGroups.chat.every((scope) =>
    session?.user?.scopes?.includes(scope),
  );

  const subscription = trpc.stream.getSubscription.useQuery(undefined, {
    enabled: subOnly && hasScopes,
  });

  const { mutateAsync: runCommand, status } =
    trpc.stream.runCommand.useMutation();
  const onClick = useCallback(async () => {
    await runCommand({
      command,
      args,
    });
  }, [runCommand, command, args]);

  const [statusText, setStatusText] = useState<string>();
  useEffect(() => {
    if (status === "idle") {
      setStatusText(undefined);
      return;
    }

    if (status === "pending") {
      setStatusText("Sending command...");
      return;
    }

    if (status === "success") {
      setStatusText("Command sent!");
      const timeout = setTimeout(() => {
        setStatusText(undefined);
      }, 2000);
      return () => clearTimeout(timeout);
    }

    if (status === "error") {
      setStatusText("Error sending command");
      const timeout = setTimeout(() => {
        setStatusText(undefined);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const CommandTooltip = useMemo(
    () => getCommandTooltip(command, args),
    [command, args],
  );

  if (!hasScopes || (subOnly && !subscription.data)) return null;

  return (
    <ActionButton
      onClick={onClick}
      icon={IconVideoCamera}
      tooltip={{
        text: statusText ?? "Run command",
        elm: statusText ? undefined : CommandTooltip,
        force: !!statusText,
      }}
    />
  );
};

export default RunCommandButton;
