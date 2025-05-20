import { useCallback, useMemo } from "react";
import {
  Handle,
  type NodeProps,
  Position,
  useEdges,
  useUpdateNodeInternals,
} from "reactflow";

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
  const updateNodeInternals = useUpdateNodeInternals();

  // Get the source and target edges
  const edges = useEdges();
  const sourceEdges = useMemo(
    () => edges.filter((edge) => edge.source === id),
    [edges, id],
  );
  const targetEdges = useMemo(
    () => edges.filter((edge) => edge.target === id),
    [edges, id],
  );

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

  // Highlight the connected edges on hover
  const mouseOver = useCallback(() => {
    targetEdges.concat(sourceEdges).forEach((edge) => {
      edge.style = {
        ...edge.style,
        stroke: "var(--color-highlight)",
        strokeWidth: 2,
      };
    });
    updateNodeInternals(id);
  }, [targetEdges, sourceEdges, updateNodeInternals, id]);

  const mouseOut = useCallback(() => {
    targetEdges.concat(sourceEdges).forEach((edge) => {
      const style = { ...edge.style };
      Reflect.deleteProperty(style, "stroke");
      Reflect.deleteProperty(style, "strokeWidth");
      edge.style = style;
    });
    updateNodeInternals(id);
  }, [targetEdges, sourceEdges, updateNodeInternals, id]);

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
        "group flex min-w-0 flex-col rounded-xl border-2 bg-white px-2 py-1 shadow-sm transition-all hover:!min-w-[calc-size(min-content,size))] hover:min-w-min hover:shadow-lg focus:!min-w-[calc-size(min-content,size)] focus:min-w-min focus:shadow-lg",
        data.container,
        data.url && "cursor-pointer",
      )}
      tabIndex={-1}
      {...linkProps}
      onMouseOver={mouseOver}
      onMouseOut={mouseOut}
    >
      {(!!targetEdges.length || isConnectable) && (
        <Handle
          type="target"
          position={targetPosition}
          isConnectable={isConnectable}
          ref={handleRef}
          className="-z-10"
        />
      )}
      {(!!sourceEdges.length || isConnectable) && (
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
