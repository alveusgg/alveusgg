import type { ChatMessage } from "@twurple/chat";
import { useCallback, useEffect, useMemo, useState } from "react";

import { isActiveAmbassadorKey } from "@alveusgg/data/build/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";

import type { RoundsCheck } from "@alveusgg/database";

import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";
import { trpc } from "@/utils/trpc";

import useChat from "@/hooks/chat";

import type { Check } from "@/components/overlay/Checks";

const isNotNull = <T>(value: T | null): value is T => value !== null;

const transformChecks = (
  checks: RoundsCheck[],
  statues: Record<string, boolean>,
): Check[] =>
  checks
    .map((check) => {
      if (!isActiveAmbassadorKey(check.ambassador)) return null;

      return {
        name: check.name,
        description: `!check ${check.command}`,
        icon: getAmbassadorImages(check.ambassador)[0],
        status: statues[check.command] ?? false,
      };
    })
    .filter(isNotNull);

const useChecks = (channels: string[], users?: string[]) => {
  const checks = trpc.stream.getRoundsChecks.useQuery(undefined, {
    refetchInterval: 15_000,
  });

  const [statues, setStatues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!checks.data) {
      setStatues({});
      return;
    }

    setStatues((prev) =>
      typeSafeObjectFromEntries(
        checks.data.map(({ command }) => [command, prev[command] ?? false]),
      ),
    );
  }, [checks.data]);

  const usersCleaned = useMemo(
    () => users?.map((user) => user.toLowerCase().trim()) ?? [],
    [users],
  );

  useChat(
    channels,
    useCallback(
      (message: ChatMessage) => {
        const { text, userInfo } = message;
        const [command, ...keys] = text.split(" ");

        if (command !== "!check") return;
        if (
          !userInfo.isMod &&
          !userInfo.isBroadcaster &&
          !usersCleaned.includes(userInfo.userName.toLowerCase().trim())
        )
          return;

        setStatues((prev) =>
          typeSafeObjectFromEntries(
            typeSafeObjectEntries(prev).map(([key, value]) => {
              if (keys[0] === "reset") return [key, false];
              return [key, keys.includes(key) ? !value : value];
            }),
          ),
        );
      },
      [usersCleaned],
    ),
  );

  return useMemo(
    () => transformChecks(checks.data ?? [], statues),
    [checks.data, statues],
  );
};

export default useChecks;
