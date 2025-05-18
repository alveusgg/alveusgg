import { useMemo } from "react";
import { Handle, type NodeProps, Position, useEdges } from "reactflow";

import steps, { type Step } from "@/data/tech/overview";

import { classes } from "@/utils/classes";
import { convertToSlug } from "@/utils/slugs";

import Tree, { type TreeNode } from "@/components/tech/Tree";

import IconExternal from "@/icons/IconExternal";

interface Data {
  label: string;
  step: Step;
}

const toTree = (
  steps: Step | Step[],
  cache?: Map<Step, TreeNode<Data>>,
): TreeNode<Data>[] => {
  if (!cache) cache = new Map();

  return (Array.isArray(steps) ? steps : [steps]).map((step) => {
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
    tree.children = toTree(step.children || [], cache);

    return tree;
  });
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
  github: {
    container: "border-alveus-green-700",
    eyebrow: { name: "GitHub", color: "text-alveus-green-700" },
  },
  service: {
    container: "border-blue-700",
    eyebrow: { name: "Service", color: "text-blue-700" },
  },
  output: {
    container: "border-pink-700",
    eyebrow: { name: "Output", color: "text-pink-700" },
  },
  control: {
    container: "border-blue-400",
    eyebrow: { name: "Control", color: "text-blue-400" },
  },
};

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

  // If this node has a link, we need some extra props
  const Element = data.step.link ? "a" : "div";
  const linkProps = useMemo(
    () =>
      data.step.link
        ? {
            href: data.step.link,
            target: "_blank",
            rel: "noopener noreferrer",
          }
        : {},
    [data.step.link],
  );

  return (
    <Element
      className={classes(
        "group flex h-20 w-48 cursor-pointer flex-col rounded-xl border-2 bg-white px-2 py-1 hover:min-w-min hover:shadow-md focus:min-w-min focus:shadow-md",
        nodeTypes[data.step.type].container,
      )}
      tabIndex={-1}
      {...linkProps}
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
        <p className="flex items-center gap-1 truncate text-lg text-alveus-green-900">
          <span className={classes(data.step.link && "group-hover:underline")}>
            {data.step.name}
          </span>

          {data.step.link && (
            <IconExternal className="shrink-0 grow-0" size={14} />
          )}
        </p>
      </div>
    </Element>
  );
};

const OverviewList = ({
  items,
  className,
}: {
  items: Step[];
  className?: string;
}) => (
  <ul className={className}>
    {items.map((item) => (
      <li key={convertToSlug(`${item.name}-${item.type}`)} className="my-2">
        <p>
          {nodeTypes[item.type].eyebrow.name}: {item.name}
        </p>
        {item.description && (
          <p className="text-sm text-alveus-green-700">{item.description}</p>
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

const tree = {
  data: toTree(steps),
  nodeTypes: { overview: OverviewNode },
  nodeSize: { width: 192, height: 80 },
  nodeSpacing: { ranks: 60, siblings: 20 },
  defaultZoom: 0.75,
};

const Overview = () => (
  <>
    <div
      className="h-[50vh] min-h-[50vh] resize-y overflow-hidden rounded-2xl rounded-br-none border border-alveus-green bg-alveus-tan shadow-lg"
      aria-hidden
    >
      <Tree {...tree} />
    </div>

    <OverviewList items={steps} className="sr-only" />
  </>
);

export default Overview;
