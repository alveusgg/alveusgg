import React, { useMemo } from "react";
import { graphlib, layout } from "dagre";
import {
  ReactFlow,
  Controls,
  Background,
  type XYPosition,
  type Position,
} from "reactflow";
import "reactflow/dist/style.css";

export type TreeNode = {
  id: string;
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  children: TreeNode[];
};

type TreeNodeWithPosition = TreeNode & {
  targetPosition: Position;
  sourcePosition: Position;
  position: XYPosition;
};

type TreeEdge = {
  id: string;
  source: string;
  target: string;
};

interface TreeProps {
  data: TreeNode | TreeNode[];
}

const withPositions = (
  { nodes, edges }: { nodes: TreeNode[]; edges: TreeEdge[] },
  size = { width: 172, height: 36 },
  direction: "TB" | "LR" = "LR"
) => {
  // Create the graph
  const dagreGraph = new graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { ...size });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate the auto layout
  layout(dagreGraph);

  // Store the nodes positions
  const nodesWithPosition = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const isHorizontal = direction === "LR";
    return {
      ...node,
      // Tell reactflow where to connect the edges
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      // Dagre gives the position as the center, we need the top left corner
      position: {
        x: nodeWithPosition.x - size.width / 2,
        y: nodeWithPosition.y - size.height / 2,
      },
    };
  }) as TreeNodeWithPosition[];

  return { nodes: nodesWithPosition, edges };
};

const getNodesEdges = (data: TreeNode | TreeNode[]) => {
  const ids = new Set<string>();
  const nodes = [] as TreeNode[];
  const edges = [] as TreeEdge[];

  const queue = Array.isArray(data) ? [...data] : [data];
  while (queue.length) {
    const node = queue.shift() as TreeNode;

    // Check for duplicate ids
    if (ids.has(node.id)) throw new Error(`Duplicate node id: ${node.id}`);
    ids.add(node.id);

    // Store the node
    nodes.push(node);

    node.children.forEach((child) => {
      // Generate edges to children
      edges.push({
        id: `${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
      });

      // Queue up the children
      queue.push(child);
    });
  }

  return { nodes, edges };
};

const Tree: React.FC<TreeProps> = ({ data }) => {
  const { nodes, edges } = useMemo(
    () => withPositions(getNodesEdges(data)),
    [data]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export default Tree;
