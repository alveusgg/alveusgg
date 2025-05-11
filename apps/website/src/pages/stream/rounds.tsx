import { DateTime } from "luxon";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";

import { queryArray } from "@/utils/array";
import { DATETIME_ALVEUS_ZONE } from "@/utils/datetime";

import Video from "@/components/content/Video";
import Checks, { type Check, useChatChecks } from "@/components/overlay/Checks";

import roundsDayBackground from "@/assets/rounds/day.webm";
import roundsNightBackground from "@/assets/rounds/night.webm";

const checks: Record<string, Omit<Check, "status" | "description">> = {
  wolfdogs: {
    name: "Wolfdogs",
    icon: getAmbassadorImages("awa")[0],
  },
  foxes: {
    name: "Foxes",
    icon: getAmbassadorImages("reed")[0],
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
  insects: {
    name: "Insects",
    icon: getAmbassadorImages("barbaraBakedBean")[0],
  },
  reptiles: {
    name: "Reptiles",
    icon: getAmbassadorImages("toasterStrudel")[0],
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

  const { query } = useRouter();
  const chatChecks = useChatChecks(
    useMemo(() => {
      const param = queryArray(query.channels);
      return param.length > 0 ? param : ["AlveusSanctuary", "AlveusGG"];
    }, [query.channels]),
    checks,
    useMemo(() => queryArray(query.users), [query.users]),
  );

  return (
    <div className="h-screen w-full">
      <Video
        sources={background.sources}
        poster={background.poster}
        className="absolute inset-0 h-full w-full object-cover object-top-left"
        width={1920}
        height={1080}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
      />

      <div className="flex h-full justify-start overflow-hidden px-16">
        <Checks
          checks={chatChecks}
          className="h-full origin-center animate-wiggle-slow"
        />
      </div>
    </div>
  );
};

export default RoundsPage;
