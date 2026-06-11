import {
  Controls,
  type Node,
  type NodeProps,
  ReactFlow,
  type ReactFlowInstance,
  useStore,
} from "@xyflow/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { DonorTree, TreeAnnotation } from "@/data/donor-trees";

import { classes } from "@/utils/classes";

import useTooltip from "@/hooks/tooltip";

import "@xyflow/react/dist/style.css";

// xyflow zoom at which we swap from the optimized thumbnail to the full-res image.
const FULL_RES_ZOOM = 0.3;

// Extra pixels added on every side of each annotation node to extend the hover zone.
const ANNOTATION_HOVER_PADDING = 32;

// The highlight bleeds this many pixels beyond the engraved name so it reads
// as a marker rather than a tight crop (boxes average ~86x18px on the image).
const ANNOTATION_HIGHLIGHT_PADDING = 8;

// Image-pixel size of the region framed when zooming to a searched name.
// Boxes are tiny relative to the ~6000px-wide images, so fitting them directly
// would zoom in far too close; frame a fixed context region instead.
const FOCUS_WIDTH = 600;
const FOCUS_HEIGHT = 340;

// --- Image node ---

type ImageData = Record<string, unknown> & { image: DonorTree["image"] };

const TreeImageNode = ({ data }: NodeProps<Node<ImageData>>) => {
  // Boolean selector so this only re-renders when crossing the threshold, not
  // on every pan/zoom frame. The panZoom guard matters: for the first frames
  // after mount the store viewport is a hardcoded zoom 1 (above
  // FULL_RES_ZOOM), which would fire the multi-MB full-res request on every
  // mount before the initial fit applies.
  const showFullRes = useStore(
    (s) => s.panZoom !== null && s.transform[2] >= FULL_RES_ZOOM,
  );

  return (
    <div
      className="pointer-events-none relative select-none"
      style={{ width: data.image.width, height: data.image.height }}
    >
      {/* Optimized thumbnail — always present, visible while full-res loads */}
      <Image
        src={data.image}
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 900px"
        draggable={false}
      />
      {/* Full-res — fetched on demand, overlays thumbnail when zoomed in */}
      {showFullRes && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.image.src}
          alt=""
          draggable={false}
          className="absolute inset-0 size-full"
        />
      )}
    </div>
  );
};

// --- Annotation node ---

type AnnotationData = Record<string, unknown> & {
  name: string;
  active: boolean;
};

// The node bounds are expanded by ANNOTATION_HOVER_PADDING on every side so the
// whole node acts as the hover zone, while the visual rectangle is inset back
// to just around the engraved name.
const AnnotationNode = ({ data }: NodeProps<Node<AnnotationData>>) => {
  const { props, element } = useTooltip({
    content: data.name,
    placement: "top",
    offset: 8,
  });

  return (
    // pointer-events-auto is required: xyflow disables pointer events on
    // non-interactive node wrappers, which would kill the hover tooltip.
    <div className="group pointer-events-auto relative size-full" {...props}>
      <div
        style={{
          inset: ANNOTATION_HOVER_PADDING - ANNOTATION_HIGHLIGHT_PADDING,
          borderWidth: 3,
        }}
        className={classes(
          "absolute rounded-sm border-transparent group-hover:border-gray-400/60",
          // Border only — a background fill makes the engraved text hard to read.
          data.active && "ring-4 ring-yellow-400",
        )}
      />
      {element}
    </div>
  );
};

const nodeTypes = {
  treeImage: TreeImageNode,
  annotation: AnnotationNode,
};

// --- Zoom floor ---

// fitView's default relative padding of 0.1 scales the raw fit zoom by 1/1.1.
const FIT_PADDING = 1.1;

// Keeps the zoom floor at the fitted zoom for the current panel size, so the
// image can always be zoomed out to exactly fit but no further — including
// after the panel resizes (window resize, phone rotation). Must render inside
// <ReactFlow> to read the store.
const PanelMinZoom = ({
  image,
  flow,
  onChange,
}: {
  image: DonorTree["image"];
  flow: ReactFlowInstance | null;
  onChange: (minZoom: number) => void;
}) => {
  const fitZoom = useStore((s) =>
    s.width && s.height
      ? Math.min(s.width / image.width, s.height / image.height) / FIT_PADDING
      : null,
  );
  const prevFitZoom = useRef<number | null>(null);

  useEffect(() => {
    if (!fitZoom) return;
    onChange(fitZoom);
    if (flow) {
      const zoom = flow.getZoom();
      // Re-fit if the panel grew past the current zoom, or if the user was
      // sitting at the old floor (fully zoomed out) when the panel resized.
      const wasAtFloor =
        prevFitZoom.current !== null && zoom <= prevFitZoom.current + 1e-4;
      if (zoom < fitZoom - 1e-6 || wasAtFloor) flow.fitView({ duration: 0 });
    }
    prevFitZoom.current = fitZoom;
  }, [fitZoom, flow, onChange]);

  return null;
};

// --- Main panel ---

type Props = {
  tree: DonorTree;
  activeAnnotation: TreeAnnotation | null;
};

export default function DonorTreePanel({ tree, activeAnnotation }: Props) {
  // The instance is only stored once the initial fit has completed, so the
  // effects below never race against it. NOTE: do not gate viewport work on
  // useNodesInitialized — it never turns true for these handle-less nodes.
  const [flow, setFlow] = useState<ReactFlowInstance | null>(null);
  // Maintained by PanelMinZoom at the fitted zoom for the current panel size,
  // so the image cannot be zoomed out smaller than the panel.
  const [minZoom, setMinZoom] = useState(0.02);

  const handleInit = useCallback(async (instance: ReactFlowInstance) => {
    // fitView is queued internally until nodes are measured, so awaiting it
    // guarantees the initial fit has been applied before we continue.
    await instance.fitView({ duration: 0 });
    setFlow(instance);
  }, []);

  // Zoom to the searched name; on a fresh mount this runs right after the
  // initial whole-tree fit, animating from the overview into the name.
  useEffect(() => {
    if (!flow || !activeAnnotation) return;
    const [x1, y1, x2, y2] = activeAnnotation.box;
    const width = Math.max(x2 - x1, FOCUS_WIDTH);
    const height = Math.max(y2 - y1, FOCUS_HEIGHT);
    flow.fitBounds(
      {
        x: (x1 + x2 - width) / 2,
        y: (y1 + y2 - height) / 2,
        width,
        height,
      },
      { padding: 0.1, duration: 800 },
    );
  }, [flow, activeAnnotation]);

  const nodes = useMemo<Node[]>(() => {
    const imageNode: Node<ImageData> = {
      id: "image",
      type: "treeImage",
      position: { x: 0, y: 0 },
      data: { image: tree.image },
      style: { width: tree.image.width, height: tree.image.height },
      draggable: false,
      selectable: false,
      connectable: false,
      focusable: false,
    };

    const annNodes: Node<AnnotationData>[] = tree.annotations.map((ann, i) => {
      const [x1, y1, x2, y2] = ann.box;
      return {
        id: `ann-${i}`,
        type: "annotation",
        position: {
          x: x1 - ANNOTATION_HOVER_PADDING,
          y: y1 - ANNOTATION_HOVER_PADDING,
        },
        // The highlight MUST flow through this controlled nodes prop:
        // instance.setNodes is a silent no-op without defaultNodes or
        // onNodesChange (see xyflow BatchProvider).
        data: {
          name: ann.name,
          active:
            activeAnnotation !== null && ann.name === activeAnnotation.name,
        },
        style: {
          width: x2 - x1 + 2 * ANNOTATION_HOVER_PADDING,
          height: y2 - y1 + 2 * ANNOTATION_HOVER_PADDING,
        },
        draggable: false,
        connectable: false,
        selectable: false,
        focusable: false,
      };
    });

    return [imageNode, ...annNodes];
  }, [tree, activeAnnotation]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-alveus-green-300/20 shadow-lg">
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        minZoom={minZoom}
        maxZoom={4}
        fitView
        // NOTE: onlyRenderVisibleElements is incompatible with the awaited
        // fitView in handleInit — unrendered nodes never get measured, so the
        // promise never resolves and `flow` stays null.
        // Until the initial fit applies, the viewport defaults to zoom 1,
        // which is above FULL_RES_ZOOM and would fire the full-res image
        // request on every mount. Start far below the threshold instead.
        defaultViewport={{ x: 0, y: 0, zoom: 0.05 }}
        onInit={handleInit}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
        <PanelMinZoom image={tree.image} flow={flow} onChange={setMinZoom} />
      </ReactFlow>
    </div>
  );
}
