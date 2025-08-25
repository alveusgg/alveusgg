import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { scopeGroups } from "@/data/twitch";

import { type RouterInputs, trpc } from "@/utils/trpc";

import IconVideoCamera from "@/icons/IconVideoCamera";

import ActionButton from "./ActionButton";
import getActionPreviewTooltip from "./ActionPreviewTooltip";

type Command = RouterInputs["stream"]["runCommand"];

interface RunCommandButtonProps extends Command {
  subOnly?: boolean;
  tooltip?: string;
  className?: string;
}

const RunCommandButton = ({
  command,
  args,
  subOnly = false,
  tooltip = "Run command",
  className,
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

  const PreviewTooltip = useMemo(
    () => getActionPreviewTooltip(`!${[command, ...(args ?? [])].join(" ")}`),
    [command, args],
  );

  if (!hasScopes || (subOnly && !subscription.data)) return null;

  return (
    <ActionButton
      onClick={onClick}
      icon={IconVideoCamera}
      tooltip={{
        text: statusText ?? tooltip,
        elm: statusText ? undefined : PreviewTooltip,
        force: !!statusText,
      }}
      className={className}
    />
  );
};

export default RunCommandButton;
