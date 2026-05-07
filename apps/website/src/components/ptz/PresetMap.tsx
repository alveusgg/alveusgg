import {
  Controls,
  type Node,
  type NodeProps,
  ReactFlow,
  useViewport,
} from "@xyflow/react";
import { useCallback, useMemo } from "react";

import { type Camera } from "@/data/tech/cameras";
import { type Preset } from "@/data/tech/cameras.types";

import { classes } from "@/utils/classes";

import useTooltip from "@/hooks/tooltip";

import PresetCard from "@/components/ptz/PresetCard";
import RunCommandButton from "@/components/shared/actions/RunCommandButton";

import "@xyflow/react/dist/style.css";

type PresetEntry = readonly [string, Preset];

type PresetMapNodeData = {
  camera: Camera;
  name: string;
  preset: Preset;
  highlight?: boolean;
};

const PresetMapNode = ({ data }: NodeProps<Node<PresetMapNodeData>>) => {
  const { zoom } = useViewport();
  const scale = zoom > 0 ? 1 / zoom : 1;

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (node?.parentElement) {
      node.parentElement.style.pointerEvents = "none";
    }
  }, []);

  const { props, element } = useTooltip({
    placement: "top",
    offset: 8,
    content: (
      <PresetCard
        key={data.name}
        title={data.name}
        image={data.preset.image}
        command={{
          command: "ptzload",
          args: [data.camera.toLowerCase(), data.name],
        }}
        className="w-64 overflow-hidden overscroll-none"
      >
        {data.preset.description}
      </PresetCard>
    ),
    aria: `${data.name}: ${data.preset.description}`,
    className: "z-90",
    interactive: true,
  });

  return (
    <div
      ref={ref}
      className="pointer-events-auto"
      style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
    >
      <div
        className={classes(
          "group relative flex items-center gap-1 rounded border px-1.5 py-0.5 text-sm leading-tight font-semibold text-alveus-green-900 shadow-sm",
          data.name === "home"
            ? "border-alveus-green-900 bg-alveus-green-200"
            : "border-alveus-green-700 bg-alveus-green-100",
          data.highlight === true && "outline-2 outline-highlight",
          data.highlight === false && "pointer-events-none opacity-35",
        )}
        {...props}
      >
        <p className="max-w-36 truncate">{data.name}</p>

        <RunCommandButton
          command="ptzload"
          args={[data.camera.toLowerCase(), data.name]}
          subOnly
          className="pointer-events-none relative top-px text-alveus-green-400 group-hover:text-alveus-green-900 [&>svg]:m-0 [&>svg]:size-3"
        />

        <RunCommandButton
          command="ptzload"
          args={[data.camera.toLowerCase(), data.name]}
          subOnly
          icon={() => null}
          className="absolute inset-0"
          tooltip={{
            offset: 8,
          }}
        />
      </div>

      {element}
    </div>
  );
};

const PresetMap = ({
  camera,
  presets,
  filter,
}: {
  camera: Camera;
  presets: readonly PresetEntry[];
  filter?: (entry: PresetEntry) => boolean;
}) => {
  const mapNodes = useMemo(() => {
    if (!presets.length) return [];

    const homePreset =
      presets.find(([name]) => name.toLowerCase() === "home") || presets[0];
    const homePan = homePreset?.[1].position.pan ?? 0;
    const wrapPan = (pan: number) => {
      const leftLimit = homePan - 180;
      const rightLimit = leftLimit + 360;
      if (pan < leftLimit) return pan + 360;
      if (pan > rightLimit) return pan - 360;
      return pan;
    };

    const tilts = presets.map(([, preset]) => preset.position.tilt);
    const tiltLow = Math.min(...tilts);
    const tiltHigh = Math.max(...tilts);
    const tiltPadding = 2;
    const tiltMin = tiltLow - tiltPadding;
    const tiltMax = tiltHigh + tiltPadding;
    const tiltRange = Math.max(tiltMax - tiltMin, 1);

    const width = 1000;
    const height = 700;

    return presets.map(([name, preset]) => {
      const wrappedPan = wrapPan(preset.position.pan);
      const x = ((wrappedPan - (homePan - 180)) / 360) * width;
      const y = (1 - (preset.position.tilt - tiltMin) / tiltRange) * height;

      return {
        id: name,
        type: "preset",
        position: { x, y },
        draggable: false,
        connectable: false,
        selectable: false,
        data: {
          camera,
          name,
          preset,
          highlight: filter && filter([name, preset]),
        },
      } satisfies Node<PresetMapNodeData>;
    });
  }, [camera, filter, presets]);

  const mapNodeTypes = useMemo(() => ({ preset: PresetMapNode }), []);

  return (
    <div className="relative mt-3 aspect-video h-auto max-h-full grow overflow-hidden rounded-lg border border-alveus-green-900 bg-alveus-tan shadow-lg">
      <ReactFlow
        nodes={mapNodes}
        edges={[]}
        nodeTypes={mapNodeTypes}
        minZoom={0.5}
        maxZoom={50}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export default PresetMap;
