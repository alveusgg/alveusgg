import React from "react";
import { Handle, Position, useEdges, type NodeProps } from "reactflow";

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
    type: item.type,
    data: {
      label: `${item.name} (${item.type})`,
      item,
    },
    children: "links" in item && item.links ? toTree(item.links) : [],
  }));

const tree = toTree(network);

const types: { [k in NetworkItem["type"]]: string } = {
  switch: "Network Switch",
  accessPoint: "Access Point",
  camera: "Camera",
  microphone: "Microphone",
};

const colors: {
  [k in NetworkItem["type"]]: { container: string; eyebrow: string };
} = {
  switch: {
    container: "border-blue-700",
    eyebrow: "text-blue-700",
  },
  accessPoint: {
    container: "border-blue-400",
    eyebrow: "text-blue-400",
  },
  camera: {
    container: "border-green-700",
    eyebrow: "text-green-700",
  },
  microphone: {
    container: "border-green-400",
    eyebrow: "text-green-400",
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
  const targetEdge = edges.find((edge) => edge.target === id);
  const sourceEdge = edges.find((edge) => edge.source === id);

  return (
    <div
      className={classes(
        "flex h-20 w-40 flex-col rounded-xl border-2 bg-white px-2 py-1 hover:min-w-min hover:shadow-md focus:min-w-min focus:shadow-md",
        colors[data.item.type].container
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

      <p className={classes("text-xs", colors[data.item.type].eyebrow)}>
        {types[data.item.type]}
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

const nodes: { [k in NetworkItem["type"]]: React.FC<NodeProps<Data>> } = {
  switch: NetworkNode,
  accessPoint: NetworkNode,
  camera: NetworkNode,
  microphone: NetworkNode,
};

const Network = () => (
  <div className="h-[80vh] rounded-2xl border border-alveus-green bg-alveus-tan">
    <Tree
      data={tree}
      nodeTypes={nodes}
      nodeSize={{ width: 160, height: 80 }}
      defaultZoom={0.75}
    />
  </div>
);

export default Network;
