import { useCallback, useMemo } from "react";
import { Handle, type NodeProps, Position, useEdges } from "reactflow";

import { classes } from "@/utils/classes";

import IconExternal from "@/icons/IconExternal";

export interface NodeData {
  container: string;
  eyebrow: { text: string; color: string };
  name: string;
  description?: string;
  url?: string;
}

const Node = ({
  id,
  data,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
  isConnectable,
}: NodeProps<NodeData>) => {
  // Get the source and target edges
  const edges = useEdges();
  let targetEdge, sourceEdge;
  for (const edge of edges) {
    if (!targetEdge && edge.target === id) targetEdge = edge;
    if (!sourceEdge && edge.source === id) sourceEdge = edge;
    if (targetEdge && sourceEdge) break;
  }

  // If this node has a link, we need some extra props
  const Element = data.url ? "a" : "div";
  const linkProps = useMemo(
    () =>
      data.url
        ? {
            href: data.url,
            target: "_blank",
            rel: "noopener noreferrer",
          }
        : {},
    [data.url],
  );

  const handleRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    // Get the current position of the node
    const { offsetTop, offsetLeft } = node;

    // Set an absolute position for the node
    node.style.position = "absolute";
    node.style.top = `${offsetTop}px`;
    node.style.left = `${offsetLeft}px`;
  }, []);

  return (
    <Element
      className={classes(
        "group flex cursor-pointer flex-col rounded-xl border-2 bg-white px-2 py-1 hover:min-w-min hover:shadow-md focus:min-w-min focus:shadow-md",
        data.container,
      )}
      tabIndex={-1}
      {...linkProps}
    >
      {(targetEdge || isConnectable) && (
        <Handle
          type="target"
          position={targetPosition}
          isConnectable={isConnectable}
          ref={handleRef}
          className="-z-10"
        />
      )}
      {(sourceEdge || isConnectable) && (
        <Handle
          type="source"
          position={sourcePosition}
          isConnectable={isConnectable}
          ref={handleRef}
          className="-z-10"
        />
      )}

      <p className={classes("text-xs", data.eyebrow.color)}>
        {data.eyebrow.text}
      </p>
      <div className="my-auto">
        {data.description && (
          <p className="truncate text-alveus-green-900">{data.name}</p>
        )}

        <p
          className={classes(
            "flex items-center gap-1",
            data.description
              ? "text-xs text-alveus-green-700"
              : "text-alveus-green-900",
          )}
        >
          <span
            className={classes(
              "shrink overflow-hidden text-ellipsis whitespace-nowrap",
              data.url && "group-hover:underline",
            )}
          >
            {data.description || data.name}
          </span>

          {data.url && <IconExternal className="shrink-0 grow-0" size={14} />}
        </p>
      </div>
    </Element>
  );
};

export default Node;
