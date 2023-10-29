import { type ReactNode } from "react";

import {
  type TicketConfig,
  defaultTicketHeight,
  defaultTicketWidth,
} from "@/utils/virtual-tickets";

export type TicketProps = TicketConfig & {
  children?: ReactNode;
  additionalElements?: ReactNode;
};

export function Ticket({
  children,
  additionalElements,
  width = defaultTicketWidth,
  height = defaultTicketHeight,
  canvasOffsetTop = 0,
  canvasOffsetLeft = 0,
  canvasWidth = width,
  canvasHeight = height,
  backgroundImage,
  foregroundImage,
  maskImage,
}: TicketProps) {
  return (
    <div
      data-alveus-virtual-ticket-mask={maskImage}
      style={{
        display: "flex",
        position: "relative",
        width,
        height,
        maskImage: maskImage && `url("${maskImage}")`,
        maskSize: maskImage && `100% 100%`,
        WebkitMaskImage: maskImage && `url("${maskImage}")`,
        WebkitMaskSize: maskImage && `100% 100%`,
      }}
    >
      {backgroundImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            userSelect: "none",
          }}
          src={backgroundImage}
          alt=""
          draggable={false}
        />
      )}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: canvasOffsetTop,
          left: canvasOffsetLeft,
          width: canvasWidth,
          height: canvasHeight,
          userSelect: "none",
        }}
      >
        {children}
      </div>
      {foregroundImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            userSelect: "none",
          }}
          src={foregroundImage}
          alt=""
          draggable={false}
        />
      )}

      {additionalElements}
    </div>
  );
}
