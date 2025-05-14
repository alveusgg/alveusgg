import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
          return;
        }

        // Look for !ptzgetcam response
        const ptzgetcam = text.match(/^{"cam":"(.+)","position":(\d+)}$/);
        if (ptzgetcam && userInfo.userId === channels.alveus.id) {
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

        // Look for !swap command
        const swap = text.match(/^!swap (.+) (.+)$/);
        if (swap) {
          runCommand({
            command: "ptzlist",
          });
          return;
        }
      },
      [setScene, setCams, runCommand],
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
  const { mutateAsync: runCommand } = trpc.stream.runCommand.useMutation();
  const cams = useCamLayout();
  const [active, setActive] = useState<number>(0);

  const gridRef = useRef<HTMLDivElement>(null);
  const clickRef = useRef<{
    x: number;
    y: number;
    timer: NodeJS.Timeout;
  } | null>(null);
  const camClick = (cam: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (!cams) return;

    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xScaled = (x / rect.width) * 1920;
    const yScaled = (y / rect.height) * 1080;

    if (shift) {
      if (active && active !== cam) {
        runCommand({
          command: "swap",
          args: [active.toString(), cam.toString()],
        });
      }
      return;
    }

    if (active !== cam) {
      setActive(cam);
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

    if (clickRef.current) {
      const dx = Math.abs(clickRef.current.x - x);
      const dy = Math.abs(clickRef.current.y - y);
      if (dx < 10 && dy < 10) {
        clearTimeout(clickRef.current.timer);
        clickRef.current = null;

        runCommand({
          command: "ptzzoom",
          args: [cams[cam - 1]!.cam, alt ? "80" : "120"],
        });
        return;
      }
    }

    runCommand({
      command: "ptzclick",
      args: [
        Math.round(xScaled).toString(),
        Math.round(yScaled).toString(),
        "100",
      ],
    });

    clickRef.current = {
      x,
      y,
      timer: setTimeout(() => {
        clickRef.current = null;
      }, 150),
    };
  };

  const [shift, setShift] = useState(false);
  const [alt, setAlt] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShift(true);
      }

      if (e.key === "Alt") {
        setAlt(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShift(false);
      }

      if (e.key === "Alt") {
        setAlt(false);
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
      {cams?.map(({ cam, position }, idx) => (
        <div
          key={cam}
          title={cam}
          className={classes(
            position,
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
        <LiveCamFeed url={url} />
      </div>
    </div>
  );
};

export default LiveCamControls;
