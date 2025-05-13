import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

import useChat from "@/hooks/chat";

import Player from "./Player";

const channels = ["AlveusSanctuary", "AlveusGG"];

const positions = [
  {
    scene: "customcamsbig",
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
  const [layout, setLayout] = useState<string | null>(null);
  const [cams, setCams] = useState<string[]>([]);

  const camLayout = useMemo(() => {
    const matching = positions.find(
      (p) => p.scene === layout && p.positions.length === cams.length,
    );
    if (matching) {
      return cams.map((cam, idx) => ({
        cam,
        position: matching.positions[idx]!,
      }));
    }
    return null;
  }, [layout, cams]);

  return {
    setLayout,
    setCams,
    cams: camLayout,
  };
};

const LiveCamControls = () => {
  const { mutateAsync: runCommand } = trpc.stream.runCommand.useMutation();
  const { setLayout, setCams, cams } = useCamLayout();
  const [active, setActive] = useState<string | null>(null);

  useChat(
    channels,
    useCallback(
      (message) => {
        const { text } = message;

        // Look for !scenecams response
        const scenecams = text.match(
          /^Scene: (.+) Current Scene: (.+) Cams: ((?:\d+: .+(?:,|$))+)$/,
        );
        if (scenecams) {
          const [_, scene, _currentScene, cams] = scenecams;
          if (scene && cams) {
            const camList = cams
              ?.split(",")
              .map((cam) => cam.match(/(\d+): (.+)/)?.[2])
              .filter((cam) => cam !== undefined);

            console.log("!scenecams", { scene, cams: camList });
            setLayout(scene);
            setCams(camList);
          }
        }
      },
      [setLayout, setCams],
    ),
  );

  useEffect(() => {
    runCommand({
      command: "scenecams",
    });
  }, [runCommand]);

  const gridRef = useRef<HTMLDivElement>(null);
  const camClick = (cam: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (active !== cam) {
      setActive(cam);
      return;
    }

    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xScaled = (x / rect.width) * 1920;
    const yScaled = (y / rect.height) * 1080;

    runCommand({
      command: "ptzclick",
      args: [
        Math.round(xScaled).toString(),
        Math.round(yScaled).toString(),
        "100",
      ],
    });
  };

  return (
    <div ref={gridRef} className="grid aspect-video grid-cols-3 grid-rows-3">
      {cams?.map(({ cam, position }) => (
        <div
          key={cam}
          title={cam}
          className={classes(
            position,
            "relative border-2",
            active === cam
              ? "cursor-crosshair border-red"
              : "cursor-pointer border-blue bg-black/25 backdrop-blur-xs",
          )}
          onClick={(e) => camClick(cam, e)}
        ></div>
      ))}

      <div className="col-span-full row-span-full">
        <Player />
      </div>
    </div>
  );
};

export default LiveCamControls;
