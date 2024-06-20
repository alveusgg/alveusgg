import { type MotionValue, motion, useMotionValue } from "framer-motion";
import { type ComponentProps, type ReactNode, useEffect, useMemo } from "react";

import { useTicketEditorContext } from "@/components/events/virtual-ticket/TicketEditor";

type MovableElementName = "div" | "img";

type MovableElement = {
  [K in MovableElementName]: (typeof motion)[K];
}[MovableElementName];

export type MovableData = {
  x: number | MotionValue<number | undefined>;
  y: number | MotionValue<number | undefined>;
};

type MovableProps<K extends MovableElementName> = {
  as: K;
  children?: ReactNode;
  width?: number;
  height?: number;
} & MovableData &
  Omit<ComponentProps<K>, "x" | "y">;

export function useMovableData({
  onPositionChange,
  initialX,
  initialY,
}: {
  onPositionChange?: (x: number, y: number) => void;
  initialX?: number;
  initialY?: number;
}): MovableData {
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  useEffect(() => {
    x.on("change", (currentX) => {
      if (!onPositionChange) return;

      const currentY = y.get();
      if (currentX && currentY) onPositionChange(currentX, currentY);
    });
    y.on("change", (currentY) => {
      if (!onPositionChange) return;

      const currentX = x.get();
      if (currentX && currentY) onPositionChange(currentX, currentY);
    });
  }, [onPositionChange, x, y]);

  return useMemo(() => ({ x, y }), [x, y]);
}

export function Movable<K extends MovableElementName>({
  as: T,
  children,
  x,
  y,
  width = 50,
  height = 50,
  style,
  ...props
}: MovableProps<K>) {
  const MovableT = motion[T] as MovableElement;
  const attributes = props as any;
  const { canvasWidth, canvasHeight } = useTicketEditorContext();

  return (
    <MovableT
      style={{
        userSelect: "none",
        position: "absolute",
        top: 0,
        left: 0,
        x,
        y,
        width,
        height,
        ...style,
      }}
      drag={true}
      dragMomentum={false}
      dragConstraints={{
        top: -height / 2,
        bottom: canvasHeight - height / 2,
        right: canvasWidth - width / 2,
        left: -width / 2,
      }}
      dragElastic={0}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      whileHover={{ cursor: "grab" }}
      whileTap={{ cursor: "grabbing" }}
      whileDrag={{ scale: 1.05 }}
      {...attributes}
    >
      {children}
    </MovableT>
  );
}
