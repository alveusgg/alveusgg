import type { ChatMessage } from "@twurple/chat";
import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
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

import border4camChristmas from "@/assets/stream/border-4cam-christmas.png";
import border4cam from "@/assets/stream/border-4cam.png";
import border6camChristmas from "@/assets/stream/border-6cam-christmas.png";
import border6cam from "@/assets/stream/border-6cam.png";

const cycleTime = 60;

const layouts = ["fullscreen", "4cam", "6cam"] as const;
type Layout = (typeof layouts)[number];
const isLayout = (layout: unknown): layout is Layout =>
  layouts.includes(layout as Layout);

interface Grid {
  grid: string;
  border?: {
    default: StaticImageData;
    xmas?: StaticImageData;
  };
  slots: [string, ...string[]];
}

const grid: Record<Layout, Grid> = {
  fullscreen: {
    grid: "grid-cols-1 grid-rows-1",
    slots: ["1 / 1 / span 1 / span 1"],
  },
  "4cam": {
    grid: "grid-cols-2 grid-rows-2",
    border: {
      default: border4cam,
      xmas: border4camChristmas,
    },
    slots: [
      "1 / 1 / span 1 / span 1", // top-left
      "1 / 2 / span 1 / span 1", // top-right
      "2 / 1 / span 1 / span 1", // bottom-left
      "2 / 2 / span 1 / span 1", // bottom-right
    ],
  },
  "6cam": {
    grid: "grid-cols-3 grid-rows-3",
    border: {
      default: border6cam,
      xmas: border6camChristmas,
    },
    slots: [
      "1 / 2 / span 2 / span 2", // top-right
      "1 / 1 / span 1 / span 1", // top-left
      "2 / 1 / span 1 / span 1", // middle-left
      "3 / 1 / span 1 / span 1", // bottom-left
      "3 / 2 / span 1 / span 1", // bottom-center
      "3 / 3 / span 1 / span 1", // bottom-right
    ],
  },
};

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
      <div className={classes("absolute inset-0 grid", grid[layout].grid)}>
        {grid[layout].slots.map((slot, index) => (
          <div
            key={`${layout}-${index}`}
            className="relative h-full w-full"
            style={{
              gridArea: slot,
            }}
          >
            {index === 0 && !hide.has("raid") && raid && (
              <Raid onEnded={raidEnded} className="absolute inset-0" />
            )}

            {index === 0 && !hide.has("disclaimer") && disclaimer && (
              <Disclaimer
                className={classes(
                  "absolute inset-x-0 bottom-0 p-6 text-4xl",
                  layout === "fullscreen" && "text-center",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {!hide.has("border") && grid[layout].border && (
        <Image
          src={
            (date?.startsWith("12-") && grid[layout].border.xmas) ||
            grid[layout].border.default
          }
          alt=""
          fill
          priority
          className="pointer-events-none select-none"
        />
      )}

      {!hide.has("rounds") && rounds && (
        <Rounds channels={channels} users={users} />
      )}

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
