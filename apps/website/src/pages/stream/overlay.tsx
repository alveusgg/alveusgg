import type { ChatMessage } from "@twurple/chat";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";

import { queryArray } from "@/utils/array";

import useChat from "@/hooks/chat";

import Cycle from "@/components/overlay/Cycle";
import Datetime from "@/components/overlay/Datetime";
import Disclaimer from "@/components/overlay/Disclaimer";
import Event from "@/components/overlay/Event";
import Socials from "@/components/overlay/Socials";
import Subs from "@/components/overlay/Subs";
import Timecode from "@/components/overlay/Timecode";
import Weather from "@/components/overlay/Weather";

const cycleTime = 60;

const OverlayPage: NextPage = () => {
  // Allow the hide query parameter to hide components
  const { query } = useRouter();
  const hide = useMemo(() => new Set(queryArray(query.hide)), [query.hide]);

  // Add a chat command to toggle the large disclaimer
  const channels = useMemo(() => {
    const param = queryArray(query.channels);
    return param.length > 0 ? param : ["AlveusSanctuary", "AlveusGG"];
  }, [query.channels]);
  const [disclaimer, setDisclaimer] = useState(false);
  useChat(
    channels,
    useCallback((message: ChatMessage) => {
      const { text } = message;
      const [command] = text.toLowerCase().split(" ");

      // Anyone can run the command to toggle the disclaimer
      if (command === "!disclaimer") {
        setDisclaimer((prev) => !prev);
        return;
      }
    }, []),
  );

  return (
    <div className="h-screen w-full">
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
        <Disclaimer className="absolute inset-x-0 bottom-2 w-full text-center text-4xl" />
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
