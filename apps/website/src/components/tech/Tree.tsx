import {
  Background,
  Controls,
  type EdgeTypes,
  type NodeTypes,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  type XYPosition,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import type { Node as DagreNode } from "dagre";
import { graphlib, layout } from "dagre";
import { useEffect, useMemo } from "react";

import "@xyflow/react/dist/style.css";

export type TreeNode<T> = {
  id: string;
  data: T;
  children: TreeNode<T>[];
  type?: string;
};

type TreeNodeInternal<T> = TreeNode<T> & {
  draggable: boolean;
  connectable: boolean;
  selectable: boolean;
  zIndex: number;
};

type TreeNodePositioned<T> = TreeNodeInternal<T> & {
  targetPosition: Position;
  sourcePosition: Position;
  position: XYPosition;
};

type TreeEdgeInternal = {
  id: string;
  source: string;
  target: string;
  focusable: boolean;
};

export type TreeInstance<T extends Record<string, unknown>> = ReactFlowInstance<
  TreeNodePositioned<T>,
  TreeEdgeInternal
>;

interface TreeProps<T extends Record<string, unknown>> {
  data: TreeNode<T> | TreeNode<T>[];
  nodeTypes?: NodeTypes;
  edgeType?: EdgeTypes[string];
  nodeSize?: { width: number; height: number };
  nodeSpacing?: { ranks: number; siblings: number };
  onInit?: (instance: TreeInstance<T>) => void;
}

const withPositions = <T,>(
  { nodes, edges }: { nodes: TreeNodeInternal<T>[]; edges: TreeEdgeInternal[] },
  size: { width: number; height: number },
  separation: { ranks: number; siblings: number },
  direction: "TB" | "LR" = "LR",
) => {
  // Create the graph
  const dagreGraph = new graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    ranksep: separation.ranks,
    nodesep: separation.siblings,
    rankdir: direction,
  });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { ...size });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate the auto layout
  layout(dagreGraph);

  // Get the nodes where all the children are leaf nodes
  // For each parent, find the nearest child, and fix any misalignment
  // Without this, leaf nodes sometimes appear to not be grouped together
  nodes.forEach(({ id, children }) => {
    if (!children.length) return;
    if (children.some((child) => child.children.length)) return;

    // Get the parent node
    const dagreParent = dagreGraph.node(id);
    if (!dagreParent) return;

    // Determine which axis we want to align on
    const axis = direction === "LR" ? "y" : "x";
    const dimension = direction === "LR" ? "height" : "width";

    // Get the children nodes
    type ChildNode = { id: string } & DagreNode;
    const dagreChildren = children
      .reduce<ChildNode[]>((acc, { id }) => {
        const node = dagreGraph.node(id);
        if (!node) return acc;
        return [...acc, { id, ...node }];
      }, [])
      .sort((a, b) => a[axis] - b[axis]);
    if (!dagreChildren[0]) return;

    // Find the child node that is nearest to the parent
    const [nearestNode, nearestIdx] = dagreChildren
      .slice(1)
      .reduce<[ChildNode, number]>(
        (acc, child, idx) => {
          const accDistance = Math.abs(acc[0][axis] - dagreParent[axis]);
          const childDistance = Math.abs(child[axis] - dagreParent[axis]);
          return childDistance < accDistance ? [child, idx + 1] : acc;
        },
        [dagreChildren[0], 0],
      );

    let idx: number, pos: number;

    // Walk backwards from the nearest node, and fix any misalignment
    for (idx = nearestIdx - 1, pos = nearestNode[axis]; idx >= 0; idx--) {
      const node = dagreChildren[idx];
      if (!node) continue; // Make TS happy

      // Apply the expected position
      const expectedPos = pos - node[dimension] - separation.siblings;
      dagreGraph.setNode(node.id, { ...node, [axis]: expectedPos });

      pos = expectedPos;
    }

    // Walk forwards from the nearest node, and fix any misalignment
    for (
      idx = nearestIdx + 1, pos = nearestNode[axis] + nearestNode[dimension];
      idx < dagreChildren.length;
      idx++
    ) {
      const node = dagreChildren[idx];
      if (!node) continue; // Make TS happy

      // Apply the expected position
      const expectedPos = pos + separation.siblings;
      dagreGraph.setNode(node.id, { ...node, [axis]: expectedPos });

      pos = expectedPos + node[dimension];
    }
  });

  // Store the node positions
  const nodesWithPosition: TreeNodePositioned<T>[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const isHorizontal = direction === "LR";
    return {
      ...node,
      // Tell reactflow where to connect the edges
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      // Dagre gives the position as the center, we need the top left corner
      position: {
        x: nodeWithPosition.x - size.width / 2,
        y: nodeWithPosition.y - size.height / 2,
      },
    };
  });

  return { nodes: nodesWithPosition, edges };
};

const getNodesEdges = <T,>(data: TreeNode<T> | TreeNode<T>[]) => {
  const ids = new Map<string, TreeNode<T>>();
  const nodes = [] as TreeNodeInternal<T>[];
  const edges = [] as TreeEdgeInternal[];
  let deepest = 0;

  const queue = Array.isArray(data)
    ? data.map((item) => [item, 0])
    : [[data, 0]];
  while (queue.length) {
    const [node, depth] = queue.shift() as [TreeNode<T>, number];

    // Check for duplicate ids
    // While this is a tree, we do allow for children to be shared
    const existing = ids.get(node.id);
    if (existing) {
      if (existing !== node) throw new Error(`Duplicate node id: ${node.id}`);
      continue;
    }
    ids.set(node.id, node);

    // Keep track of the deepest node
    if (depth > deepest) deepest = depth;

    // Store the node
    nodes.push({
      ...node,
      // Tell reactflow to not allow dragging
      draggable: false,
      connectable: false,
      // But do allow focusing
      selectable: true,
      // And use the depth as the z-index
      zIndex: depth,
    });

    node.children.forEach((child) => {
      // Generate edges to children
      edges.push({
        id: `${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
        focusable: false,
      });

      // Queue up the children
      queue.push([child, depth + 1]);
    });
  }

  return {
    nodes: nodes.map((node) => ({
      ...node,
      // Invert the z-index so that the shallowest node is on top
      zIndex: deepest - node.zIndex,
    })),
    edges,
  };
};

const useNodesEdgesState = <T extends Record<string, unknown>>(
  data: TreeNode<T> | TreeNode<T>[],
  nodeSize: { width: number; height: number },
  nodeSpacing: { ranks: number; siblings: number },
) => {
  // Take the nested data and convert it to a flat list of nodes and edges
  const { nodes, edges } = useMemo(
    () => withPositions(getNodesEdges(data), nodeSize, nodeSpacing),
    [data, nodeSize, nodeSpacing],
  );

  const [statefulNodes, setNodes, onNodesChange] = useNodesState(nodes);
  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  const [statefulEdges, setEdges, onEdgesChange] = useEdgesState(edges);
  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  return {
    nodes: statefulNodes,
    edges: statefulEdges,
    onNodesChange,
    onEdgesChange,
  };
};

const defaultNodeSize = { width: 180, height: 40 };
const defaultNodeSpacing = { ranks: 100, siblings: 50 };

const Tree = <T extends Record<string, unknown>>({
  data,
  nodeTypes,
  edgeType,
  nodeSize = defaultNodeSize,
  nodeSpacing = defaultNodeSpacing,
  onInit,
}: TreeProps<T>) => {
  // Convert the nested data into stateful nodes and edges
  const { nodes, edges, onNodesChange, onEdgesChange } = useNodesEdgesState(
    data,
    nodeSize,
    nodeSpacing,
  );

  // Override the default edge type if one is provided
  const edgeTypes = useMemo(
    () => (edgeType ? { default: edgeType } : undefined),
    [edgeType],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      proOptions={{ hideAttribution: true }}
      fitView
      onInit={onInit}
    >
      <Background />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
};

export default Tree;
