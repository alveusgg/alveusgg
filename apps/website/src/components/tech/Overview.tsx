import { useMemo } from "react";
import { Handle, Position, useEdges, type NodeProps } from "reactflow";

import { classes } from "@/utils/classes";

import Tree, { type TreeNode } from "@/components/tech/Tree";
import steps, { upstream, type Step } from "@/data/tech/overview";
import { convertToSlug } from "@/utils/slugs";

interface Data {
  label: string;
  step: Step;
}

const toTree = (
  step: Step,
  cache?: Map<Step, TreeNode<Data>>,
): TreeNode<Data> => {
  if (!cache) cache = new Map();

  // If we've already processed this step, return the cached result
  // This ensures we preserve shared steps
  const cached = cache.get(step);
  if (cached) return cached;

  const tree = {
    id: step.id,
    type: "overview",
    data: {
      label: `${step.name} (${step.type})`,
      step,
    },
    children: [] as TreeNode<Data>[],
  };
  cache.set(step, tree);

  // Process the children after we've cached this node
  // This allows us to handle circular dependencies
  tree.children = (step.children || []).map((child) => toTree(child, cache));

  return tree;
};

const nodeTypes: {
  [k in Step["type"]]: {
    container: string;
    eyebrow: {
      name: string;
      color: string;
    };
  };
} = {
  server: {
    container: "border-yellow-700",
    eyebrow: { name: "Server", color: "text-yellow-700" },
  },
  source: {
    container: "border-green-700",
    eyebrow: { name: "Source", color: "text-green-700" },
  },
  service: {
    container: "border-blue-700",
    eyebrow: { name: "Service", color: "text-blue-700" },
  },
  control: {
    container: "border-blue-400",
    eyebrow: { name: "Control", color: "text-blue-400" },
  },
};

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
        "group flex h-20 w-48 cursor-pointer flex-col rounded-xl border-2 bg-white px-2 py-1 hover:min-w-min hover:shadow-md focus:min-w-min focus:shadow-md",
        nodeTypes[data.step.type].container,
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
        className={classes("text-sm", nodeTypes[data.step.type].eyebrow.color)}
      >
        {nodeTypes[data.step.type].eyebrow.name}
      </p>
      <div className="my-auto">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-lg text-alveus-green-900">
          {data.step.name}
        </p>
      </div>
    </div>
  );
};

interface StepWithUpstream extends Step {
  upstream: Step[];
}

const OverviewList = ({
  items,
  className,
}: {
  items: (Step | StepWithUpstream)[];
  className?: string;
}) => (
  <ul className={className}>
    {items.map((item) => (
      <li key={convertToSlug(`${item.name}-${item.type}`)} className="my-2">
        <p>
          {nodeTypes[item.type].eyebrow.name}: {item.name}
        </p>

        {"upstream" in item && item.upstream && (
          <>
            <p>Broadcasting to:</p>
            <OverviewList items={item.upstream} className="ml-4" />
          </>
        )}

        {"children" in item && item.children && (
          <>
            <p>Connected to:</p>
            <OverviewList items={item.children} className="ml-4" />
          </>
        )}
      </li>
    ))}
  </ul>
);

const stepsList = [
  {
    ...steps,
    upstream,
  },
];

const Overview = () => (
  <>
    <div
      className="h-[50vh] min-h-[50vh] resize-y overflow-hidden rounded-2xl rounded-br-none border border-alveus-green bg-alveus-tan"
      aria-hidden
    >
      <Tree
        data={fullTree}
        nodeTypes={useMemo(() => ({ overview: OverviewNode }), [])}
        nodeSize={useMemo(() => ({ width: 192, height: 80 }), [])}
        nodeSpacing={useMemo(() => ({ ranks: 60, siblings: 20 }), [])}
        defaultZoom={0.75}
      />
    </div>

    <OverviewList items={stepsList} className="sr-only" />
  </>
);

export default Overview;
