import type { ChatMessage } from "@twurple/chat";
import { type NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { queryArray } from "@/utils/array";
import { classes } from "@/utils/classes";
import { getToday } from "@/utils/datetime";

import useChat from "@/hooks/chat";

import Cycle from "@/components/overlay/Cycle";
import Datetime from "@/components/overlay/Datetime";
import Disclaimer from "@/components/overlay/Disclaimer";
import Event from "@/components/overlay/Event";
import Raid from "@/components/overlay/Raid";
import Rounds from "@/components/overlay/Rounds";
import Socials from "@/components/overlay/Socials";
import Subs from "@/components/overlay/Subs";
import Timecode from "@/components/overlay/Timecode";
import Weather from "@/components/overlay/Weather";

import border6camChristmas from "@/assets/stream/border-6cam-christmas.png";
import border6cam from "@/assets/stream/border-6cam.png";

const cycleTime = 60;

const layouts = ["fullscreen", "6cam"] as const;
type Layout = (typeof layouts)[number];
const isLayout = (layout: unknown): layout is Layout =>
  layouts.includes(layout as Layout);

const OverlayPage: NextPage = () => {
  // Allow the hide query parameter to hide components
  const { query } = useRouter();
  const layout = isLayout(query.layout) ? query.layout : "fullscreen";
  const hide = useMemo(() => new Set(queryArray(query.hide)), [query.hide]);

  const [disclaimer, setDisclaimer] = useState(false);
  const [rounds, setRounds] = useState(false);

  const [raid, setRaid] = useState(false);
  const raidEnded = useCallback(() => {
    setRaid(false);
  }, []);

  // Add chat commands to toggle certain features
  const channels = useMemo(() => {
    const param = queryArray(query.channels);
    return param.length > 0 ? param : ["AlveusSanctuary", "AlveusGG"];
  }, [query.channels]);
  const users = useMemo(() => {
    return query.users
      ? queryArray(query.users).map((user) => user.toLowerCase().trim())
      : undefined;
  }, [query.users]);
  useChat(
    channels,
    useCallback(
      (message: ChatMessage) => {
        const { text, userInfo } = message;
        const [command, arg] = text.trim().toLowerCase().split(/\s+/);

        // Anyone can run the command to toggle the disclaimer
        if (command === "!disclaimer" || command === "!wolftext") {
          setDisclaimer((prev) => {
            if (arg === "on" || arg === "enable") return true;
            if (arg === "off" || arg === "disable") return false;
            return !prev;
          });
          return;
        }

        if (
          userInfo.isMod ||
          userInfo.isBroadcaster ||
          users?.includes(userInfo.userName.toLowerCase().trim())
        ) {
          // Mods (or trusted users) can run the command to toggle the rounds overlay
          if (command === "!rounds") {
            setRounds((prev) => {
              if (arg === "on" || arg === "start") return true;
              if (arg === "off" || arg === "stop") return false;
              return !prev;
            });
            return;
          }

          // Mods (or trusted users) can run the command to toggle the raid video
          if (command === "!raidvideo") {
            setRaid((prev) => {
              if (arg === "on" || arg === "start") return true;
              if (arg === "off" || arg === "stop") return false;
              return !prev;
            });
            return;
          }
        }
      },
      [users],
    ),
  );

  // Track the current date to switch 6cam borders during December
  const [date, setDate] = useState<`${number}-${number}`>();
  useEffect(() => {
    const updateDate = () => {
      const today = getToday();
      const month = String(today.month).padStart(2, "0");
      const day = String(today.day).padStart(2, "0");
      setDate(`${month}-${day}` as `${number}-${number}`);
    };

    updateDate();
    const interval = setInterval(updateDate, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Request fullscreen when the page is clicked
  useEffect(() => {
    const fullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          // Ignore errors
        });
      }
    };

    document.body.addEventListener("click", fullscreen);
    return () => {
      document.body.removeEventListener("click", fullscreen);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-clip">
      {/* Raid video should render below the cam borders and text elements */}
      {raid && (
        <Raid
          onEnded={raidEnded}
          className={classes(
            "absolute",
            layout === "6cam" ? "top-0 left-1/3 h-2/3 w-2/3" : "inset-0",
          )}
        />
      )}

      {layout === "6cam" && (
        <Image
          src={date?.startsWith("12-") ? border6camChristmas : border6cam}
          alt=""
          fill
          priority
          className="pointer-events-none select-none"
        />
      )}

      {/* Rounds overlay should render above the cam borders, but below text elements */}
      {rounds && <Rounds channels={channels} users={users} />}

      {!hide.has("datetime") && (
        <Datetime className="absolute top-2 right-2 text-right">
          {!hide.has("weather") && <Weather />}
        </Datetime>
      )}

      <Cycle
        items={useMemo(
          () =>
            [
              !hide.has("socials") && (
                // Cycle every third of the total cycle time, so that we're always back on the logo when this shows
                <Socials interval={cycleTime / 3} key="socials" />
              ),
              !hide.has("event") && <Event key="event" />,
            ].filter((x) => !!x),
          [hide],
        )}
        interval={cycleTime}
        className="absolute bottom-2 left-2"
      />

      {!hide.has("disclaimer") && disclaimer && (
        <Disclaimer
          className={classes(
            "absolute text-4xl",
            layout === "6cam"
              ? "bottom-1/3 left-1/3 w-2/3 pb-6 pl-6"
              : "inset-x-0 bottom-2 w-full text-center",
          )}
        />
      )}

      <Cycle
        items={useMemo(
          () =>
            [
              !hide.has("disclaimer") && !disclaimer && (
                <Disclaimer key="disclaimer" className="text-xl text-stroke" />
              ),
              !hide.has("subs") && <Subs key="subs" />,
            ].filter((x) => !!x),
          [hide, disclaimer],
        )}
        interval={cycleTime / 2}
        className="absolute right-2 bottom-2 text-right"
      />

      {!hide.has("timecode") && (
        <Timecode className="absolute right-0 bottom-0" />
      )}
    </div>
  );
};

export default OverlayPage;
