import { useSession } from "next-auth/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { scopeGroups } from "@/data/twitch";

import { type RouterInputs, trpc } from "@/utils/trpc";

import type { UseTooltipProps } from "@/hooks/tooltip";

import IconVideoCamera from "@/icons/IconVideoCamera";

import ActionButton from "./ActionButton";
import ActionPreviewTooltip from "./ActionPreviewTooltip";

type Command = RouterInputs["stream"]["runCommand"];

interface RunCommandButtonProps extends Command {
  subOnly?: boolean;
  tooltip?: {
    text?: string;
    placement?: UseTooltipProps["placement"];
    offset?: UseTooltipProps["offset"];
  };
  icon?: ({ className }: { className: string }) => ReactNode;
  onClick?: () => void;
  className?: string;
}

const RunCommandButton = ({
  command,
  args,
  subOnly = false,
  tooltip,
  icon = IconVideoCamera,
  onClick,
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
  const onClickRun = useCallback(async () => {
    await runCommand({
      command,
      args,
    });
    onClick?.();
  }, [runCommand, command, args, onClick]);

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

  const textTooltip = tooltip?.text ?? "Run command";
  const previewTooltip = useMemo(
    () => (
      <ActionPreviewTooltip
        preview={`!${[command, ...(args ?? [])].join(" ")}`}
      >
        {textTooltip}
      </ActionPreviewTooltip>
    ),
    [command, args, textTooltip],
  );

  if (!hasScopes || (subOnly && !subscription.data)) return null;

  return (
    <ActionButton
      onClick={onClickRun}
      icon={icon}
      tooltip={{
        content: statusText ?? previewTooltip,
        aria: statusText ?? textTooltip,
        force: !!statusText,
        placement: tooltip?.placement,
        offset: tooltip?.offset,
      }}
      className={className}
    />
  );
};

export default RunCommandButton;
