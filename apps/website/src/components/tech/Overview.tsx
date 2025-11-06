import { useMemo } from "react";

import steps, { type Step } from "@/data/tech/overview";

import { classes } from "@/utils/classes";
import { convertToSlug } from "@/utils/slugs";

import Tree, { type TreeNode } from "@/components/tech/Tree";

import Node, { type NodeData } from "./Node";

const nodeTypes: {
  [k in Step["type"]]: {
    container: string;
    eyebrow: {
      text: string;
      color: string;
    };
  };
} = {
  server: {
    container: "border-yellow-700",
    eyebrow: { text: "Server", color: "text-yellow-700" },
  },
  source: {
    container: "border-green-700",
    eyebrow: { text: "Source", color: "text-green-700" },
  },
  github: {
    container: "border-alveus-green-700",
    eyebrow: { text: "GitHub", color: "text-alveus-green-700" },
  },
  service: {
    container: "border-blue-700",
    eyebrow: { text: "Service", color: "text-blue-700" },
  },
  output: {
    container: "border-pink-700",
    eyebrow: { text: "Output", color: "text-pink-700" },
  },
  control: {
    container: "border-blue-400",
    eyebrow: { text: "Control", color: "text-blue-400" },
  },
};

const toTree = (
  steps: Step | Step[],
  cache?: Map<Step, TreeNode<NodeData>>,
): TreeNode<NodeData>[] => {
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
        container: classes("h-20 w-48", nodeTypes[step.type].container),
        eyebrow: nodeTypes[step.type].eyebrow,
        name: step.name,
        description: step.description,
        url: step.url,
      },
      children: [] as TreeNode<NodeData>[],
    };
    cache.set(step, tree);

    // Process the children after we've cached this node
    // This allows us to handle circular dependencies
    tree.children = toTree(step.children || [], cache);

    return tree;
  });
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
          {nodeTypes[item.type].eyebrow.text}: {item.name}
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

const Overview = () => {
  const tree = useMemo(
    () => ({
      data: toTree(steps),
      nodeTypes: { overview: Node },
      nodeSize: { width: 192, height: 80 },
      nodeSpacing: { ranks: 60, siblings: 20 },
    }),
    [], // steps is a static import, so no dependencies needed
  );

  return (
    <>
      <div
        className="h-[50vh] min-h-[50vh] resize-y overflow-hidden rounded-2xl rounded-br-none border border-alveus-green bg-alveus-tan text-gray-900 shadow-lg dark:bg-gray-800"
        aria-hidden
      >
        <Tree {...tree} />
      </div>

      <OverviewList items={steps} className="sr-only" />
    </>
  );
};

export default Overview;
