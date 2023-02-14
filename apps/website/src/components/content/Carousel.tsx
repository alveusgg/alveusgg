import Image, { type ImageProps } from "next/image"
import React, { useCallback, useEffect, useRef, useState } from "react"
import IconAngleLeft from "../../icons/IconAngleLeft"
import IconAngleRight from "../../icons/IconAngleRight"

type CarouselProps = {
  images: {
    src: ImageProps["src"],
    alt: string,
  }[],
  auto?: number | null,
};

const Carousel: React.FC<CarouselProps> = ({ images, auto = 2000 }) => {
  // Allow the user to scroll to the next/previous image
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<{ left: number, right: number } | null>(null);
  const move = useCallback((direction: "left" | "right") => {
    const { current } = ref;
    if (!current || !current.children[0]) return;

    // Get the width of the first child
    const { width } = current.children[0].getBoundingClientRect();

    // Determine the new scroll offset
    let offset = Math.round(current.scrollLeft + (width * (direction === "left" ? -1 : 1)));

    // If we're at the start, scroll to the end
    if (offset < 0) offset = Math.round(current.scrollWidth - current.clientWidth);
    // If we're at the end, scroll back to the start
    else if (offset > current.scrollWidth - current.clientWidth) offset = 0;

    // Bind a scroll listener, so we know when we've reached the new offset
    const listener = () => {
      if (Math.round(current.scrollLeft) === offset) {
        current.removeEventListener("scroll", listener);
        last.current = { left: current.scrollLeft, right: current.scrollLeft };
      }
    };
    current.addEventListener("scroll", listener);

    // Scroll to the new offset
    last.current = { left: Math.min(current.scrollLeft, offset), right: Math.max(current.scrollLeft, offset) }
    current.scrollBy({
      left: offset - current.scrollLeft,
      behavior: "smooth",
    });
  }, []);

  // If the user interacts, we want to pause the auto-scroll for a bit
  const [ paused, setPaused ] = useState(false);
  const pausedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interacted = useCallback(() => {
    if (auto) {
      setPaused(true);
      if (pausedTimeout.current) clearTimeout(pausedTimeout.current);
      pausedTimeout.current = setTimeout(() => setPaused(false), auto * 2);
    }
  }, [ auto ]);

  // When we've scrolled, track if we've hit the start or end (and pause auto-scroll if it was the user)
  const [ state, setState ] = useState<"start" | "scrolling" | "end">("start");
  const scrolled = useCallback(() => {
    const { current } = ref;
    if (!current || !current.children[0]) return;

    // Get the width of the first child
    const { width } = current.children[0].getBoundingClientRect();

    // If we've moved the half a width to the left of the last from/to, we've scrolled
    if (last.current && current.scrollLeft < last.current.left - width / 2) interacted();
    if (last.current && current.scrollLeft > last.current.right + width / 2) interacted();

    // If we're less than half a width from the start, we're at the start
    if (current.scrollLeft < width / 2) setState("start");
    // If we're less than half a width from the end, we're at the end
    else if (current.scrollLeft > current.scrollWidth - current.clientWidth - width / 2) setState("end");
    // Otherwise, we're scrolling
    else setState("scrolling");
  }, [ interacted ]);

  // Allow the user to drag to scroll
  const drag = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
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
      if (dx !== 0 || dy !== 0) interacted();
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
    };
    document.addEventListener("mouseup", up);

    // Switch the cursor and disable scroll snapping
    current.style.cursor = "grabbing";
    current.style.scrollSnapType = "none";
  }, [ interacted ]);

  // Run the auto scroll if requested, and not paused
  useEffect(() => {
    if (!auto || paused) return;

    const interval = setInterval(() => {
      if (!ref.current) return;
      move("right");
    }, auto);
    return () => clearInterval(interval);
  }, [ auto, paused, move ]);

  return (
    <div className="flex flex-nowrap">
      <button
        className="flex-shrink-0 p-1 group cursor-pointer disabled:cursor-default"
        type="button"
        onClick={() => { interacted(); move("left"); }}
        disabled={state === "start"}
      >
        <span className="sr-only">Previous</span>
        <IconAngleLeft className="group-disabled:opacity-20 transition-opacity" size={24} />
      </button>

      <div
        className="flex flex-nowrap flex-grow overflow-x-auto snap-mandatory snap-x scrollbar-none select-none cursor-grab"
        ref={ref}
        onScroll={scrolled}
        onMouseDown={drag}
      >
        {images.map((image, index) => (
          <div key={index} className="basis-full md:basis-1/3 flex-shrink-0 p-8 snap-center">
            <Image
              src={image.src}
              alt={image.alt}
              draggable={false}
              className="w-full h-auto max-w-[10rem] mx-auto"
            />
          </div>
        ))}
      </div>

      <button
        className="flex-shrink-0 p-1 group cursor-pointer disabled:cursor-default"
        type="button"
        onClick={() => { interacted(); move("right"); }}
        disabled={state === "end"}
      >
        <span className="sr-only">Next</span>
        <IconAngleRight className="group-disabled:opacity-20 transition-opacity" size={24} />
      </button>
    </div>
  );
};

export default Carousel;
