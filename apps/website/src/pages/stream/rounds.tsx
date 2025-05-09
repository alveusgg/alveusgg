import type { ChatMessage } from "@twurple/chat";
import { DateTime } from "luxon";
import { type NextPage } from "next";
import { useCallback, useEffect, useState } from "react";

import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";

import { DATETIME_ALVEUS_ZONE } from "@/utils/datetime";
import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
  typeSafeObjectKeys,
} from "@/utils/helpers";

import useChat from "@/hooks/chat";

import Video from "@/components/content/Video";
import Checks, { type Check } from "@/components/overlay/Checks";

import roundsDayBackground from "@/assets/rounds/day.webm";
import roundsNightBackground from "@/assets/rounds/night.webm";

const checks = {
  foxes: {
    name: "Foxes",
    icon: getAmbassadorImages("reed")[0],
  },
  wolfdogs: {
    name: "Wolfdogs",
    icon: getAmbassadorImages("awa")[0],
  },
  pushpop: {
    name: "Push Pop",
    icon: getAmbassadorImages("pushPop")[0],
  },
  crows: {
    name: "Crows",
    icon: getAmbassadorImages("abbott")[0],
  },
  marmosets: {
    name: "Marmosets",
    icon: getAmbassadorImages("appa")[0],
  },
  critters: {
    name: "Insects/Reptiles",
    icon: getAmbassadorImages("barbaraBakedBean")[0],
  },
  winnie: {
    name: "Winnie",
    icon: getAmbassadorImages("winnieTheMoo")[0],
  },
  stompy: {
    name: "Stompy",
    icon: getAmbassadorImages("stompy")[0],
  },
  donkeys: {
    name: "Donkeys",
    icon: getAmbassadorImages("jalapeno")[0],
  },
  parrots: {
    name: "Parrots",
    icon: getAmbassadorImages("siren")[0],
  },
  chickens: {
    name: "Chickens",
    icon: getAmbassadorImages("oliver")[0],
  },
} as const satisfies Record<string, Omit<Check, "status">>;

type CheckKey = keyof typeof checks;

const isCheckKey = (key: string): key is CheckKey => {
  return Object.keys(checks).includes(key);
};

const RoundsPage: NextPage = () => {
  const [night, setNight] = useState(false);
  useEffect(() => {
    const update = () => {
      const now = DateTime.now().setZone(DATETIME_ALVEUS_ZONE);
      setNight(now.hour < 6 || now.hour >= 18);
    };

    update();
    const interval = setInterval(update, 15_000);
    return () => clearInterval(interval);
  });

  const background = night ? roundsNightBackground : roundsDayBackground;

  const [checksWithStatus, setChecksWithStatus] = useState<
    Record<CheckKey, Check>
  >(
    typeSafeObjectFromEntries(
      typeSafeObjectEntries(checks).map(([key, check]) => {
        return [
          key,
          {
            ...check,
            status: false,
          },
        ] as const;
      }),
    ),
  );

  const setStatus = useCallback(
    (keys: CheckKey[], mode: "toggle" | "reset") => {
      if (keys.length === 0) return;

      setChecksWithStatus((prev) => {
        const newChecks = { ...prev };
        keys.forEach((key) => {
          newChecks[key] = {
            ...newChecks[key],
            status: mode === "toggle" ? !newChecks[key].status : false,
          };
        });
        return newChecks;
      });
    },
    [],
  );

  useChat(["AlveusSanctuary", "AlveusGG"], (message: ChatMessage) => {
    const { text, userInfo } = message;
    const [command, ...keys] = text.split(" ");

    if (command !== "!check") return;
    if (!userInfo.isMod && !userInfo.isBroadcaster) return;

    if (keys[0] === "reset") {
      setStatus(typeSafeObjectKeys(checks), "reset");
      return;
    }

    setStatus(keys.filter(isCheckKey), "toggle");
  });

  return (
    <div className="h-screen w-full">
      <Video
        sources={background.sources}
        poster={background.poster}
        className="h-full w-full object-cover absolute inset-0 object-top-left"
        width={1920}
        height={1080}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
      />

      <div className="h-full flex justify-start overflow-hidden px-16">
        <Checks
          checks={checksWithStatus}
          className="animate-wiggle-slow origin-center h-full"
        />
      </div>
    </div>
  );
};

export default RoundsPage;
