import React, { useCallback, useEffect, useRef, useState } from "react";

import { classes } from "@/utils/classes";

import usePrefersReducedMotion from "@/hooks/motion";

import IconChevronLeft from "@/icons/IconChevronLeft";
import IconChevronRight from "@/icons/IconChevronRight";

type CarouselProps = {
  id?: string;
  items: Record<string, React.ReactNode>;
  auto?: number | null;
  className?: string;
  wrapperClassName?: string;
  itemClassName?: string;
};

const Carousel: React.FC<CarouselProps> = ({
  items,
  auto = 2000,
  id,
  className = "",
  wrapperClassName = "",
  itemClassName = "basis-full sm:basis-1/2 lg:basis-1/3 p-4",
}) => {
  const reducedMotion = usePrefersReducedMotion();

  // Allow the user to scroll to the next/previous image
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<{ left: number; right: number } | null>(null);
  const move = useCallback((direction: "left" | "right") => {
    const { current } = ref;
    if (!current || !current.children[0]) return;

    // Get the width of the first child
    const { width } = current.children[0].getBoundingClientRect();

    // Determine the new scroll offset
    let offset = Math.round(
      current.scrollLeft + width * (direction === "left" ? -1 : 1),
    );

    // If we're half a width before the start, scroll to the end
    if (offset < -(width / 2))
      offset = Math.round(current.scrollWidth - current.clientWidth);
    // If we're half a width after the end, scroll to the start
    else if (offset > current.scrollWidth - current.clientWidth + width / 2)
      offset = 0;

    // Bind a scroll listener, so we know when we've reached the new offset
    const listener = () => {
      if (Math.round(current.scrollLeft) === offset) {
        current.removeEventListener("scroll", listener);
        last.current = { left: current.scrollLeft, right: current.scrollLeft };
      }
    };
    current.addEventListener("scroll", listener);

    // Scroll to the new offset
    last.current = {
      left: Math.min(current.scrollLeft, offset),
      right: Math.max(current.scrollLeft, offset),
    };
    current.scrollBy({
      left: offset - current.scrollLeft,
      behavior: "smooth",
    });
  }, []);

  // If the user interacts, we want to pause the auto-scroll for a bit
  const [paused, setPaused] = useState(false);
  const pausedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interacted = useCallback(() => {
    if (auto) {
      setPaused(true);
      if (pausedTimeout.current) clearTimeout(pausedTimeout.current);
      pausedTimeout.current = setTimeout(() => setPaused(false), auto * 2);
    }
  }, [auto]);

  // When we've scrolled, track if we've hit the start or end (and pause auto-scroll if it was the user)
  const [state, setState] = useState<"none" | "start" | "scrolling" | "end">(
    "start",
  );
  const scrolled = useCallback(() => {
    const { current } = ref;
    if (!current) return;

    // If there are no children, set the state to none
    if (!current.children[0]) {
      setState("none");
      return;
    }

    // Get the width of the first child
    const { width } = current.children[0].getBoundingClientRect();

    // If we've moved the half a width to the left of the last from/to, we've scrolled
    if (last.current && current.scrollLeft < last.current.left - width / 2)
      interacted();
    if (last.current && current.scrollLeft > last.current.right + width / 2)
      interacted();

    // Check how close we are to the ends
    const nearLeft = current.scrollLeft < width / 2;
    const nearRight =
      current.scrollLeft >
      current.scrollWidth - current.clientWidth - width / 2;

    // Update our scroll state
    if (nearLeft && nearRight) setState("none");
    else if (nearLeft) setState("start");
    else if (nearRight) setState("end");
    else setState("scrolling");
  }, [interacted]);

  // Run the scroll handler on load to check our current state
  // Run it on any window resize to check our state
  useEffect(() => {
    scrolled();

    window.addEventListener("resize", scrolled);
    return () => window.removeEventListener("resize", scrolled);
  }, [scrolled]);

  // Allow the user to drag to scroll
  const drag = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { current } = ref;
      if (!current) return;

      // Get the current scroll/mouse position
      const pos = {
        left: current.scrollLeft,
        top: current.scrollTop,
        x: event.clientX,
        y: event.clientY,
      };

      const move = (e: MouseEvent) => {
        // Check how far we've moved
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;

        // Scroll the element
        current.scrollTop = pos.top - dy;
        current.scrollLeft = pos.left - dx;

        // If we've moved the mouse, we've interacted
        if (dx !== 0 || dy !== 0) {
          interacted();

          // Disable pointer events on the children
          for (const child of current.children)
            (child as HTMLDivElement).style.pointerEvents = "none";
        }
      };
      document.addEventListener("mousemove", move);

      const up = () => {
        // Remove the handlers
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);

        // Avoid sharp snapping
        if (current.children[0]) {
          const { width, height } = current.children[0].getBoundingClientRect();
          const dx = current.scrollLeft % width;
          const dy = current.scrollTop % height;
          current.scrollBy({
            left: dx < width / 2 ? -dx : width - dx,
            top: dy < height / 2 ? -dy : height - dy,
            behavior: "smooth",
          });
        }

        // Reset the cursor and snapping
        current.style.removeProperty("cursor");
        current.style.removeProperty("scroll-snap-type");

        // Re-enable pointer events on the children
        for (const child of current.children)
          (child as HTMLDivElement).style.removeProperty("pointer-events");
      };
      document.addEventListener("mouseup", up);

      // Switch the cursor and disable scroll snapping
      current.style.cursor = "grabbing";
      current.style.scrollSnapType = "none";
    },
    [interacted],
  );

  // Run the auto scroll if requested, and not paused, and not preferring reduced motion
  useEffect(() => {
    if (!auto || paused || reducedMotion) return;

    const interval = setInterval(() => {
      if (!ref.current) return;
      move("right");
    }, auto);
    return () => clearInterval(interval);
  }, [auto, paused, move, reducedMotion]);

  return (
    <div id={id} className={classes("flex flex-nowrap", className)}>
      <button
        className={classes(
          "group flex-shrink-0 cursor-pointer p-1 disabled:cursor-default",
          state === "none" && "hidden",
        )}
        type="button"
        onClick={() => {
          interacted();
          move("left");
        }}
        disabled={state === "start" || state === "none"}
      >
        <span className="sr-only">Previous</span>
        <IconChevronLeft
          className="transition-opacity group-disabled:opacity-20"
          size={24}
        />
      </button>

      <div
        className={classes(
          "scrollbar-none flex flex-grow snap-x snap-mandatory flex-nowrap overflow-x-auto",
          wrapperClassName,
          state === "none" ? "justify-evenly" : "cursor-grab",
        )}
        ref={ref}
        onScroll={scrolled}
        onMouseDown={state === "none" ? undefined : drag}
      >
        {Object.entries(items).map(([key, item]) => (
          <div
            key={key}
            className={`${itemClassName} flex-shrink-0 snap-start`}
            draggable={false}
          >
            {item}
          </div>
        ))}
      </div>

      <button
        className={classes(
          "group flex-shrink-0 cursor-pointer p-1 disabled:cursor-default",
          state === "none" && "hidden",
        )}
        type="button"
        onClick={() => {
          interacted();
          move("right");
        }}
        disabled={state === "end" || state === "none"}
      >
        <span className="sr-only">Next</span>
        <IconChevronRight
          className="transition-opacity group-disabled:opacity-20"
          size={24}
        />
      </button>
    </div>
  );
};

export default Carousel;
