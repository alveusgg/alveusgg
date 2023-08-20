import React, { useCallback, useMemo } from "react";
import type { Node as DagreNode } from "dagre";
import { graphlib, layout } from "dagre";
import {
  ReactFlow,
  Background,
  Controls,
  Position,
  type NodeTypes,
  type EdgeTypes,
  type XYPosition,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

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

interface TreeProps<T> {
  data: TreeNode<T> | TreeNode<T>[];
  nodeTypes?: NodeTypes;
  edgeType?: EdgeTypes[string];
  nodeSize?: { width: number; height: number };
  defaultZoom?: number;
}

const withPositions = <T,>(
  { nodes, edges }: { nodes: TreeNodeInternal<T>[]; edges: TreeEdgeInternal[] },
  size: { width: number; height: number },
  separation = { ranks: 100, siblings: 50 },
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
  const ids = new Set<string>();
  const nodes = [] as TreeNodeInternal<T>[];
  const edges = [] as TreeEdgeInternal[];
  let deepest = 0;

  const queue = Array.isArray(data)
    ? data.map((item) => [item, 0])
    : [[data, 0]];
  while (queue.length) {
    const [node, depth] = queue.shift() as [TreeNode<T>, number];

    // Check for duplicate ids
    if (ids.has(node.id)) throw new Error(`Duplicate node id: ${node.id}`);
    ids.add(node.id);

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

const Tree = <T,>({
  data,
  nodeTypes,
  edgeType,
  nodeSize = { width: 180, height: 40 },
  defaultZoom = 1,
}: TreeProps<T>) => {
  // Take the nested data and convert it to a flat list of nodes and edges
  const { nodes, edges } = useMemo(
    () => withPositions(getNodesEdges(data), nodeSize),
    [data, nodeSize],
  );

  // When the tree loads, center it
  const init = useCallback(
    (instance: ReactFlowInstance) => {
      const firstNode = nodes[0];
      if (!firstNode) return;

      // Center on 0, 0
      instance.setCenter(0, 0);

      // Wait for the viewport to update
      window.requestAnimationFrame(() => {
        const viewport = instance.getViewport();

        // Center the first node vertically
        // But remain horizontally pinned to the left
        instance.setCenter(viewport.x, firstNode.position.y, {
          zoom: defaultZoom,
        });
      });
    },
    [nodes, defaultZoom],
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
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      proOptions={{ hideAttribution: true }}
      onInit={init}
    >
      <Background />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
};

export default Tree;
