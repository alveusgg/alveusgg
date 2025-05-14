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
        className: matching.positions[idx]!,
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
  const [active, setActive] = useState<number>(0);

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
          return;
        }

        // Look for !ptzgetcam response
        const ptzgetcam = text.match(/^{"cam":"(.+)","position":(\d+)}$/);
        if (ptzgetcam) {
          const [_, cam, position] = ptzgetcam;
          if (cam && position) {
            console.log("!ptzgetcam", { cam, position });
            setCams((prev) => {
              const newCams = [...prev];
              const newIdx = Number(position) - 1;

              // If the cam is already in the list at a different index,
              // update that index to contain the cam at the new index
              const existingIdx = newCams.findIndex((c) => c === cam);
              if (existingIdx !== -1 && existingIdx !== newIdx) {
                newCams[existingIdx] = newCams[newIdx] ?? "";
              }

              newCams[newIdx] = cam;
              return newCams;
            });
          }
          return;
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
  const camClick = (pos: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xScaled = (x / rect.width) * 1920;
    const yScaled = (y / rect.height) * 1080;

    if (shift) {
      if (active !== pos) {
        runCommand({
          command: "swap",
          args: [active.toString(), pos.toString()],
        });
      }
      return;
    }

    if (active !== pos) {
      setActive(pos);
      runCommand({
        command: "ptzgetcam",
        args: [
          Math.round(xScaled).toString(),
          Math.round(yScaled).toString(),
          "json",
        ],
      });
      return;
    }

    runCommand({
      command: "ptzclick",
      args: [
        Math.round(xScaled).toString(),
        Math.round(yScaled).toString(),
        "100",
      ],
    });
  };

  const [shift, setShift] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShift(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShift(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div
      ref={gridRef}
      className="grid aspect-video grid-cols-3 grid-rows-3 select-none"
    >
      {cams?.map(({ cam, className }, idx) => (
        <div
          key={`cam-${idx + 1}`}
          title={cam}
          className={classes(
            className,
            "relative border-2",

            active === idx + 1
              ? "border-red"
              : shift && active
                ? "border-green hover:border-yellow"
                : "border-blue",

            active === idx + 1
              ? shift && active
                ? "cursor-not-allowed"
                : "cursor-crosshair"
              : "cursor-pointer",

            active !== idx + 1 && "bg-black/25 backdrop-blur-xs",
          )}
          onClick={(e) => camClick(idx + 1, e)}
        >
          <p className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-sm text-white">
            {cam}
          </p>
        </div>
      ))}

      <div className="col-span-full row-span-full">
        <Player />
      </div>
    </div>
  );
};

export default LiveCamControls;
