import { DateTime } from "luxon";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { queryArray } from "@/utils/array";
import { DATETIME_ALVEUS_ZONE } from "@/utils/datetime";

import useChecks from "@/hooks/checks";

import Video from "@/components/content/Video";
import Checks from "@/components/overlay/Checks";

import roundsDayBackground from "@/assets/rounds/day.webm";
import roundsNightBackground from "@/assets/rounds/night.webm";

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
  const checks = useChecks(
    useMemo(() => {
      const param = queryArray(query.channels);
      return param.length > 0 ? param : ["AlveusSanctuary", "AlveusGG"];
    }, [query.channels]),
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
          checks={checks}
          className="h-full origin-center animate-wiggle-slow"
        />
      </div>
    </div>
  );
};

export default RoundsPage;
