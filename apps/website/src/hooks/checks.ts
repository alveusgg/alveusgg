import type { ChatMessage } from "@twurple/chat";
import { useCallback, useEffect, useMemo, useState } from "react";

import { isActiveAmbassadorKey } from "@alveusgg/data/build/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";

import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";
import { type RouterOutputs, trpc } from "@/utils/trpc";

import useChat from "@/hooks/chat";

import type { Check } from "@/components/overlay/Rounds";

const isNotNull = <T>(value: T | null): value is T => value !== null;

type RoundsChecks = RouterOutputs["stream"]["getRoundsChecks"];

const transformChecks = (
  checks: RoundsChecks,
  statues: Record<string, boolean>,
): Check[] =>
  checks
    .map((check) => {
      let icon: Check["icon"];
      if (check.ambassador) {
        if (!isActiveAmbassadorKey(check.ambassador)) return null;
        icon = getAmbassadorImages(check.ambassador)[0];
      } else {
        if (!check.fileStorageObjectUrl) return null;
        icon = { src: check.fileStorageObjectUrl.toString() };
      }

      return {
        name: check.name,
        description: `!check ${check.command}`,
        icon,
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
    setStatues((prev) =>
      typeSafeObjectFromEntries(
        (checks.data ?? []).map(({ command }) => [
          command,
          prev[command] ?? false,
        ]),
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
        const [command, ...keys] = text.toLowerCase().split(" ");

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
