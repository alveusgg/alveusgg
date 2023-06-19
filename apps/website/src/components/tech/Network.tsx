import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Handle,
  Position,
  useEdges,
  EdgeLabelRenderer,
  useNodes,
  getBezierPath,
  BaseEdge,
  type NodeProps,
  type EdgeProps,
} from "reactflow";

import network, { type NetworkItem } from "@/data/network";
import Tree, { type TreeNode } from "@/components/tech/Tree";
import { classes } from "@/utils/classes";

type Data = {
  label: string;
  item: NetworkItem;
};

const toTree = (items: NetworkItem[]): TreeNode<Data>[] =>
  items.map((item) => ({
    id: `${item.name}-${item.type}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-"),
    type: "network",
    data: {
      label: `${item.name} (${item.type})`,
      item,
    },
    children: "links" in item && item.links ? toTree(item.links) : [],
  }));

const nodeTypes: {
  [k in NetworkItem["type"]]: {
    container: string;
    eyebrow: {
      name: string;
      color: string;
    };
  };
} = {
  switch: {
    container: "border-blue-700",
    eyebrow: { name: "Network Switch", color: "text-blue-700" },
  },
  accessPoint: {
    container: "border-blue-400",
    eyebrow: { name: "WiFi Access Point", color: "text-blue-400" },
  },
  camera: {
    container: "border-green-700",
    eyebrow: { name: "Camera", color: "text-green-700" },
  },
  microphone: {
    container: "border-green-400",
    eyebrow: { name: "Microphone", color: "text-green-400" },
  },
};

const NetworkNode: React.FC<NodeProps<Data>> = ({
  id,
  data,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
  isConnectable,
}) => {
  const edges = useEdges();
  let targetEdge, sourceEdge;
  for (const edge of edges) {
    if (!targetEdge && edge.target === id) targetEdge = edge;
    if (!sourceEdge && edge.source === id) sourceEdge = edge;
    if (targetEdge && sourceEdge) break;
  }

  return (
    <div
      className={classes(
        "flex h-20 w-40 cursor-pointer flex-col rounded-xl border-2 bg-white px-2 py-1 hover:min-w-min hover:shadow-md focus:min-w-min focus:shadow-md",
        nodeTypes[data.item.type].container
      )}
      tabIndex={-1}
    >
      {(targetEdge || isConnectable) && (
        <Handle
          type="target"
          position={targetPosition}
          isConnectable={isConnectable}
        />
      )}
      {(sourceEdge || isConnectable) && (
        <Handle
          type="source"
          position={sourcePosition}
          isConnectable={isConnectable}
        />
      )}

      <p
        className={classes("text-xs", nodeTypes[data.item.type].eyebrow.color)}
      >
        {nodeTypes[data.item.type].eyebrow.name}
      </p>
      <div className="my-auto">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-alveus-green-900">
          {data.item.name}
        </p>
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-alveus-green-700">
          {data.item.model}
        </p>
      </div>
    </div>
  );
};

const edgeTypes: {
  [k in NetworkItem["connection"]["type"]]: {
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
};

const NetworkEdge: React.FC<EdgeProps> = ({
  source,
  sourceX,
  sourceY,
  sourcePosition,
  target,
  targetX,
  targetY,
  targetPosition,
}) => {
  // Get the source and target nodes
  const nodes = useNodes<Data>();
  let sourceNode, targetNode;
  for (const node of nodes) {
    if (!sourceNode && node.id === source) sourceNode = node;
    if (!targetNode && node.id === target) targetNode = node;
    if (sourceNode && targetNode) break;
  }
  if (!sourceNode || !targetNode) throw new Error("Missing source or target");
  const targetConnection = targetNode.data.item.connection;

  // Track if the user is hovering, or if the edge is focused
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const cleanup = useRef<() => void>();
  const ref = useCallback((node: SVGGElement | null) => {
    if (cleanup.current) {
      cleanup.current();
      cleanup.current = undefined;
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
          edgeTypes[targetConnection.type].stroke.color,
          !hovered && !focused && "opacity-75"
        )}
      >
        <BaseEdge
          path={edgePath}
          style={{
            stroke: "inherit",
            strokeWidth: 2,
            strokeDasharray: edgeTypes[targetConnection.type].stroke.dash,
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
            className="absolute rounded-xl border-2 border-alveus-green-100 bg-white px-2 py-1 shadow-md"
          >
            {edgeTypes[targetConnection.type].name}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

const Network = () => (
  <div className="h-[80vh] rounded-2xl border border-alveus-green bg-alveus-tan">
    <Tree
      data={useMemo(() => toTree(network), [])}
      nodeTypes={useMemo(() => ({ network: NetworkNode }), [])}
      edgeType={NetworkEdge}
      nodeSize={useMemo(() => ({ width: 160, height: 80 }), [])}
      defaultZoom={0.75}
    />
  </div>
);

export default Network;
