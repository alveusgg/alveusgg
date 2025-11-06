import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  type Node as ReactFlowNode,
  getBezierPath,
  useNodes,
} from "@xyflow/react";
import pluralize from "pluralize";
import { useCallback, useMemo, useRef, useState } from "react";

import network, {
  type NestedNetworkItem,
  type NetworkConnection,
  type NetworkItem,
  isNestedNetworkItem,
} from "@/data/tech/network";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries, typeSafeObjectKeys } from "@/utils/helpers";
import { convertToSlug } from "@/utils/slugs";

import Link from "@/components/content/Link";
import Node, { type NodeData } from "@/components/tech/Node";
import Tree, { type TreeInstance, type TreeNode } from "@/components/tech/Tree";

type Data = NodeData & {
  connection?: NetworkConnection;
};

const nodeTypes: {
  [k in NetworkItem["type"]]: {
    container: string;
    stats: boolean;
    eyebrow: {
      text: string;
      color: string;
    };
  };
} = {
  switch: {
    container: "border-blue-700",
    stats: true,
    eyebrow: { text: "Network Switch", color: "text-blue-700" },
  },
  converter: {
    container: "border-blue-700 border-dashed",
    stats: false,
    eyebrow: { text: "Media Converter", color: "text-blue-700" },
  },
  accessPoint: {
    container: "border-blue-400",
    stats: true,
    eyebrow: { text: "WiFi Access Point", color: "text-blue-400" },
  },
  camera: {
    container: "border-green-700",
    stats: true,
    eyebrow: { text: "Camera", color: "text-green-700" },
  },
  microphone: {
    container: "border-green-400",
    stats: true,
    eyebrow: { text: "Microphone", color: "text-green-400" },
  },
  speaker: {
    container: "border-green-400",
    stats: false,
    eyebrow: { text: "Speaker", color: "text-green-400" },
  },
  interface: {
    container: "border-green-400",
    stats: false,
    eyebrow: { text: "Audio I/O Interface", color: "text-green-400" },
  },
  server: {
    container: "border-yellow-700",
    stats: false,
    eyebrow: { text: "Server", color: "text-yellow-700" },
  },
  controlunit: {
    container: "border-red-700",
    stats: false,
    eyebrow: { text: "Camera Control Unit", color: "text-red-700" },
  },
};

const toTree = (items: NetworkItem[]): TreeNode<Data>[] =>
  items.map((item) => ({
    id: convertToSlug(`${item.name}-${item.type}`),
    type: "network",
    data: {
      container: classes("h-20 w-44", nodeTypes[item.type].container),
      eyebrow: nodeTypes[item.type].eyebrow,
      name: item.name,
      description: item.model,
      url: item.url,
      connection: isNestedNetworkItem(item) ? item.connection : undefined,
    },
    children: "links" in item && item.links ? toTree(item.links) : [],
  }));

const edgeTypes: {
  [k in NestedNetworkItem["connection"]["type"]]: {
    name: string;
    stroke: {
      color: string;
      dash?: number | `${number} ${number}`;
    };
  };
} = {
  ethernet: {
    name: "Ethernet",
    stroke: {
      color: "stroke-blue-700",
    },
  },
  fiber: {
    name: "Fiber",
    stroke: {
      color: "stroke-blue-700",
      dash: "8 8",
    },
  },
  wifi: {
    name: "WiFi",
    stroke: {
      color: "stroke-blue-400",
      dash: "4 8",
    },
  },
  cloud: {
    name: "Cloud",
    stroke: {
      color: "stroke-yellow-700",
      dash: "4 8",
    },
  },
  coax: {
    name: "Coax",
    stroke: {
      color: "stroke-red-700",
      dash: "16 8",
    },
  },
};

const NetworkEdge = ({
  source,
  sourceX,
  sourceY,
  sourcePosition,
  target,
  targetX,
  targetY,
  targetPosition,
  style,
}: EdgeProps) => {
  // Get the source and target nodes
  const nodes = useNodes<ReactFlowNode<Data>>();
  let sourceNode, targetNode;
  for (const node of nodes) {
    if (!sourceNode && node.id === source) sourceNode = node;
    if (!targetNode && node.id === target) targetNode = node;
    if (sourceNode && targetNode) break;
  }
  if (!sourceNode || !targetNode) throw new Error("Missing source or target");
  if (!targetNode.data.connection) throw new Error("Invalid target");

  // Track if the user is hovering, or if the edge is focused
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const cleanup = useRef<() => void>(null);
  const ref = useCallback((node: SVGGElement | null) => {
    if (cleanup.current) {
      cleanup.current();
      cleanup.current = null;
    }

    if (node) {
      const parent = node.parentElement;
      if (parent) {
        const mouseEnter = () => setHovered(true);
        const mouseLeave = () => setHovered(false);
        const focus = () => setFocused(true);
        const blur = () => setFocused(false);

        parent.addEventListener("mouseenter", mouseEnter);
        parent.addEventListener("mouseleave", mouseLeave);
        parent.addEventListener("focus", focus);
        parent.addEventListener("blur", blur);

        let setTabIndex = false;
        if (!parent.hasAttribute("tabindex")) {
          parent.setAttribute("tabindex", "-1");
          setTabIndex = true;
        }

        cleanup.current = () => {
          parent.removeEventListener("mouseenter", mouseEnter);
          parent.removeEventListener("mouseleave", mouseLeave);
          parent.removeEventListener("focus", focus);
          parent.removeEventListener("blur", blur);

          if (setTabIndex) parent.removeAttribute("tabindex");
        };
      }
    }
  }, []);

  // Get the path and label position
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <g
        ref={ref}
        className={classes(
          edgeTypes[targetNode.data.connection.type].stroke.color,
          !hovered && !focused && "opacity-75",
        )}
      >
        <BaseEdge
          path={edgePath}
          style={{
            stroke: "inherit",
            strokeWidth: 2,
            strokeDasharray:
              edgeTypes[targetNode.data.connection.type].stroke.dash,
            ...style,
          }}
        />
      </g>
      <EdgeLabelRenderer>
        {(hovered || focused) && (
          <div
            style={{
              // Center the label on the edge path
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              // Ensure the label is always on top of all the nodes
              // (the first node will have the highest z-index)
              zIndex: ((nodes[0] && nodes[0].zIndex) || 0) + 1,
            }}
            className="absolute rounded-xl border-2 border-alveus-green-100 bg-white px-2 py-1 text-black shadow-md"
          >
            {edgeTypes[targetNode.data.connection.type].name}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

const NetworkList = ({
  items,
  className,
}: {
  items: NetworkItem[];
  className?: string;
}) => (
  <ul className={className}>
    {items.map((item) => (
      <li key={convertToSlug(`${item.name}-${item.type}`)} className="my-2">
        <p>
          {nodeTypes[item.type].eyebrow.text}: {item.name}
        </p>
        <p>
          Model:{" "}
          {item.url ? (
            <Link href={item.url} external>
              {item.model}
            </Link>
          ) : (
            item.model
          )}
        </p>
        {isNestedNetworkItem(item) && (
          <p>Connection: {edgeTypes[item.connection.type].name}</p>
        )}

        {"links" in item && item.links && (
          <>
            <p>Links:</p>
            <NetworkList items={item.links} className="ml-4" />
          </>
        )}
      </li>
    ))}
  </ul>
);

const Network = () => {
  const tree = useMemo(
    () => ({
      data: toTree(network),
      nodeTypes: { network: Node },
      edgeType: NetworkEdge,
      nodeSize: { width: 176, height: 80 },
      onInit: (instance: TreeInstance<Data>) => {
        // After the initial fit, vertically center on the first node
        window.requestAnimationFrame(() => {
          const nodes = instance.getNodes();

          const firstNode = nodes[0];
          if (!firstNode) return;

          const centerX =
            nodes.reduce((acc, node) => acc + node.position.x, 0) /
            nodes.length;

          const viewport = instance.getViewport();
          instance.setCenter(centerX, firstNode.position.y, {
            zoom: viewport.zoom,
          });
        });
      },
    }),
    [], // network is a static import, so no dependencies needed
  );

  return (
    <>
      <div
        className="h-[80vh] min-h-[80vh] resize-y overflow-hidden rounded-2xl rounded-br-none border border-alveus-green bg-alveus-tan shadow-lg dark:bg-gray-800"
        aria-hidden
      >
        <Tree {...tree} />
      </div>

      <NetworkList items={network} className="sr-only" />
    </>
  );
};

export default Network;

const toCounts = (items: NetworkItem[]) => {
  const stats = typeSafeObjectKeys(nodeTypes).reduce(
    (acc, key) => ({ ...acc, [key]: 0 }),
    {} as { [k in NetworkItem["type"]]: number },
  );

  for (const item of items) {
    stats[item.type] += 1;

    if ("links" in item && item.links) {
      const nestedStats = toCounts(item.links);
      for (const [key, value] of typeSafeObjectEntries(nestedStats)) {
        stats[key] = (stats[key] || 0) + value;
      }
    }
  }

  return stats;
};

const stats = typeSafeObjectEntries(toCounts(network)).filter(
  ([key, value]) => nodeTypes[key].stats && value,
);

export const NetworkStats = ({ className }: { className?: string }) => (
  <ul
    className={classes(
      "flex flex-wrap gap-2 font-mono text-sm text-alveus-green-700",
      className,
    )}
  >
    {stats.map(([key, value], idx) => (
      <li key={key}>
        {value.toLocaleString()} {pluralize(nodeTypes[key].eyebrow.text, value)}
        {idx < stats.length - 1 && ", "}
      </li>
    ))}
  </ul>
);
