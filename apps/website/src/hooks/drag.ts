import { type MouseEvent as ReactMouseEvent, useCallback } from "react";

const useDragScroll = (snap = false, interacted?: () => void) =>
  useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const { currentTarget } = event;

      // Get the current scroll/mouse position
      const pos = {
        left: currentTarget.scrollLeft,
        top: currentTarget.scrollTop,
        x: event.clientX,
        y: event.clientY,
      };

      const move = (e: MouseEvent) => {
        // Check how far we've moved
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;

        // Scroll the element
        currentTarget.scrollTop = pos.top - dy;
        currentTarget.scrollLeft = pos.left - dx;

        // If we've moved the mouse, we've interacted
        if (dx !== 0 || dy !== 0) {
          if (interacted) interacted();

          // Disable pointer events on the children
          for (const child of currentTarget.children)
            (child as HTMLDivElement).style.pointerEvents = "none";
        }
      };
      document.addEventListener("mousemove", move);

      const up = () => {
        // Remove the handlers
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);

        // Avoid sharp snapping
        if (snap && currentTarget.children[0]) {
          const { width, height } =
            currentTarget.children[0].getBoundingClientRect();
          const dx = currentTarget.scrollLeft % width;
          const dy = currentTarget.scrollTop % height;
          currentTarget.scrollBy({
            left: dx < width / 2 ? -dx : width - dx,
            top: dy < height / 2 ? -dy : height - dy,
            behavior: "smooth",
          });
        }

        // Reset the cursor and snapping
        currentTarget.style.removeProperty("cursor");
        currentTarget.style.removeProperty("scroll-snap-type");

        // Re-enable pointer events on the children
        for (const child of currentTarget.children)
          (child as HTMLDivElement).style.removeProperty("pointer-events");
      };
      document.addEventListener("mouseup", up);

      // Switch the cursor and disable scroll snapping
      currentTarget.style.cursor = "grabbing";
      currentTarget.style.scrollSnapType = "none";
    },
    [snap, interacted],
  );

export default useDragScroll;
