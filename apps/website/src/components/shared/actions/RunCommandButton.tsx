import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import type { z } from "zod";

import type { runCommandSchema } from "@/server/trpc/router/stream";

import { scopeGroups } from "@/data/twitch";

import { trpc } from "@/utils/trpc";

import IconVideoCamera from "@/icons/IconVideoCamera";

import ActionButton from "./ActionButton";

const RunCommandButton = ({
  command,
  args,
}: z.infer<typeof runCommandSchema>) => {
  const { data } = useSession();

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

  if (!scopeGroups.chat.every((scope) => data?.user?.scopes?.includes(scope)))
    return null;

  return (
    <ActionButton
      onClick={onClick}
      icon={IconVideoCamera}
      alt="Run command"
      tooltip={{ text: statusText ?? "Run command", force: !!statusText }}
    />
  );
};

export default RunCommandButton;
