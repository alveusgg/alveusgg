import { useMemo } from "react";
import { Handle, Position, useEdges, type NodeProps } from "reactflow";

import { classes } from "@/utils/classes";

import Tree, { type TreeNode } from "@/components/tech/Tree";
import steps, { upstream, type Step } from "@/data/tech/overview";

interface Data {
  label: string;
  description?: string;
}

const toTree = (step: Step): TreeNode<Data> => ({
  id: step.id,
  type: "overview",
  data: {
    label: step.name,
    description: step.description,
  },
  children: (step.children || []).map(toTree),
});

// The upstream steps need to share the same root node below them
const stepsTree = toTree(steps);
const fullTree = upstream.map((step) => ({
  ...toTree(step),
  children: [stepsTree],
}));

const OverviewNode = ({
  id,
  data,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
  isConnectable,
}: NodeProps<Data>) => {
  // Get the source and target edges
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
        "group flex h-20 w-44 cursor-pointer flex-col rounded-xl border-2 bg-white px-2 py-1 hover:min-w-min hover:shadow-md focus:min-w-min focus:shadow-md",
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

      <div className="my-auto">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-alveus-green-900">
          {data.label}
        </p>
      </div>
    </div>
  );
};

const Overview = () => (
  <>
    <div
      className="h-[60vh] min-h-[60vh] resize-y overflow-hidden rounded-2xl rounded-br-none border border-alveus-green bg-alveus-tan"
      aria-hidden
    >
      <Tree
        data={fullTree}
        nodeTypes={useMemo(() => ({ overview: OverviewNode }), [])}
        nodeSize={useMemo(() => ({ width: 176, height: 80 }), [])}
        defaultZoom={0.75}
      />
    </div>
  </>
);

export default Overview;
