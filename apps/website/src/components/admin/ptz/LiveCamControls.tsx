import { useCallback, useMemo, useState } from "react";

import { channels } from "@/data/twitch";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import useChat from "@/hooks/chat";

import LiveCamFeed from "./LiveCamFeed";

const chatChannels = [channels.alveus.username, channels.alveusgg.username];

const positions = [
  {
    scene: "custom",
    positions: [
      "col-start-2 col-span-2 row-start-1 row-span-2",
      "col-start-1 col-span-1 row-start-1 row-span-1",
      "col-start-1 col-span-1 row-start-2 row-span-1",
      "col-start-1 col-span-1 row-start-3 row-span-1",
      "col-start-2 col-span-1 row-start-3 row-span-1",
      "col-start-3 col-span-1 row-start-3 row-span-1",
    ],
  },
];

const useCamLayout = () => {
  const { mutateAsync: runCommand } = trpc.stream.runCommand.useMutation();
  const [scene, setScene] = useState<string | null>(null);
  const [cams, setCams] = useState<string[]>([]);

  const camLayout = useMemo(() => {
    const matching = positions.find(
      (p) => p.scene === scene && p.positions.length === cams.length,
    );
    if (matching) {
      return cams.map((cam, idx) => ({
        cam,
        position: matching.positions[idx]!,
      }));
    }
    return null;
  }, [scene, cams]);

  useChat(
    chatChannels,
    useCallback(
      (message) => {
        const { text, userInfo } = message;

        // Look for !ptzlist response
        const ptzlist = text.match(
          /^Current Scene: (.+) Cams: ((?:\d+: .+(?:,|$))+)$/,
        );
        if (ptzlist && userInfo.userId === channels.alveus.id) {
          const [_, scene, cams] = ptzlist;
          if (scene && cams) {
            const camList = cams
              ?.split(",")
              .map((cam) => cam.match(/(\d+): (.+)/)?.[2])
              .filter((cam) => cam !== undefined);

            console.log("!ptzlist", { scene, cams: camList });
            setScene(scene);
            setCams(camList);
          }
        }
      },
      [setScene, setCams],
    ),
    useCallback(() => {
      setScene(null);
      setCams([]);

      runCommand({
        command: "ptzlist",
      });
    }, [setScene, setCams, runCommand]),
  );

  return camLayout;
};

const LiveCamControls = ({ url }: { url?: string }) => {
  const cams = useCamLayout();
  const [active, setActive] = useState<number>(0);

  return (
    <div className="grid aspect-video grid-cols-3 grid-rows-3">
      {cams?.map(({ cam, position }, idx) => (
        <div
          key={cam}
          title={cam}
          className={classes(
            position,
            "relative border-2",
            active === idx + 1
              ? "cursor-crosshair border-red"
              : "cursor-pointer border-blue bg-black/25 backdrop-blur-xs",
          )}
          onClick={() => {
            setActive(idx + 1);
          }}
        ></div>
      ))}

      <div className="col-span-full row-span-full">
        <LiveCamFeed url={url} />
      </div>
    </div>
  );
};

export default LiveCamControls;
