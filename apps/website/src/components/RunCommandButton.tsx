import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import type { z } from "zod";

import type { runCommandSchema } from "@/server/trpc/router/stream";

import { scopeGroups } from "@/data/twitch";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import IconVideoCamera from "@/icons/IconVideoCamera";

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
    <div className="group relative inline-block">
      <button onClick={onClick} title="Run command">
        <IconVideoCamera className="m-1 inline size-4 cursor-pointer text-alveus-green-400 group-hover:text-black" />
      </button>

      <span
        className={classes(
          "pointer-events-none absolute top-1/2 left-full z-10 -translate-y-1/2 rounded-md bg-alveus-green-900 px-1 text-white transition-opacity",
          !statusText ? "opacity-0" : "opacity-100",
          "group-hover:opacity-100",
        )}
      >
        {statusText ?? "Run command"}
      </span>
    </div>
  );
};

export default RunCommandButton;
