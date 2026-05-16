import { Input, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import pluralize from "pluralize";
import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { classes } from "@/utils/classes";

import type { Pixel } from "@/hooks/pixels";

import Box from "@/components/content/Box";
import Pixels from "@/components/institute/Pixels";

import IconArrowsIn from "@/icons/IconArrowsIn";
import IconArrowsOut from "@/icons/IconArrowsOut";
import IconSearch from "@/icons/IconSearch";
import IconX from "@/icons/IconX";

const PixelsSearch = ({
  children,
  className,
  onFullscreen,
}: {
  children?: ReactNode;
  className?: string;
  onFullscreen?: (fullscreen: boolean) => void;
}) => {
  const { query, replace, isReady } = useRouter();

  // Sync search state with URL query on mount and query changes
  const [search, setSearchState] = useState("");
  useEffect(() => {
    setSearchState(typeof query.s === "string" ? query.s : "");
  }, [query.s]);

  const setSearch = (value: string) => {
    // Update local state immediately for responsive UI
    setSearchState(value);

    if (!isReady) return;

    const { s: _, ...updated } = query;
    if (value.length) {
      updated.s = value;
    }

    replace({ query: updated }, undefined, { shallow: true });
  };

  const [filtered, setFiltered] = useState<number>(0);
  const filter = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return undefined;

    const hashed = window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(normalized))
      .then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      );

    return (pixel: Pixel) =>
      pixel.identifier.toLowerCase().includes(normalized) ||
      hashed.then((h) => pixel.email === h);
  }, [search]);

  const [fullscreen, setFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0.5);

  const fullscreenToggle = useCallback(() => {
    setFullscreen((v) => {
      if (v) {
        document.body.style.overflow = "";
      } else {
        document.body.style.overflow = "hidden";
        window.requestAnimationFrame(() => {
          if (!fullscreenRef.current) return;
          const { scrollWidth, clientWidth } = fullscreenRef.current;
          fullscreenRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        });
      }
      onFullscreen?.(!v);
      return !v;
    });
  }, [onFullscreen]);

  const handleScrollbarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const progress = parseFloat(e.target.value);
      setScrollProgress(progress);
      if (!fullscreenRef.current) return;
      const { scrollWidth, clientWidth } = fullscreenRef.current;
      fullscreenRef.current.scrollLeft = (scrollWidth - clientWidth) * progress;
    },
    [],
  );

  const pixelsRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      fullscreenRef.current = node;

      // Map vertical scrolling to horizontal scrolling, only when in fullscreen
      if (!fullscreen) return;

      const onWheel = (e: WheelEvent) => {
        if (!e.deltaY) return;
        node.scrollLeft += e.deltaY + e.deltaX;
        e.preventDefault();
      };

      const onScroll = () => {
        const { scrollLeft, scrollWidth, clientWidth } = node;
        const maxScroll = scrollWidth - clientWidth;
        if (maxScroll > 0) {
          setScrollProgress(scrollLeft / maxScroll);
        }
      };

      node.addEventListener("wheel", onWheel, { passive: false });
      node.addEventListener("scroll", onScroll);
      return () => {
        node.removeEventListener("wheel", onWheel);
        node.removeEventListener("scroll", onScroll);
      };
    },
    [fullscreen],
  );

  useEffect(() => {
    if (!fullscreen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        fullscreenToggle();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [fullscreen, fullscreenToggle]);

  return (
    <div
      className={classes(
        "flex flex-col",
        fullscreen
          ? "fixed inset-0 isolate z-100 h-screen w-screen touch-none gap-4 bg-alveus-green-900 p-4 ring-8 ring-alveus-green"
          : "gap-8",
        className,
      )}
    >
      <div className="relative z-10 shrink grow">
        {children}

        <Pixels
          filter={filter}
          onFilter={useCallback(
            (pixels: Pixel[]) => {
              setFiltered(pixels.length);
            },
            [setFiltered],
          )}
          className={classes(
            fullscreen &&
              "scrollbar-none aspect-[unset]! h-full! touch-pan-x justify-start! overflow-x-scroll rounded-lg bg-alveus-green shadow-xl ring-4 ring-alveus-green",
          )}
          canvasClassName={classes(
            "rounded-lg",
            fullscreen ? "max-w-none!" : "shadow-xl ring-4 ring-alveus-green",
          )}
          ref={pixelsRef}
        />
      </div>

      {fullscreen && (
        <div className="relative z-10 shrink-0 rounded-lg bg-alveus-green-900/50 p-3 backdrop-blur-xs">
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={scrollProgress}
            onChange={handleScrollbarChange}
            className="h-3 w-full cursor-grab appearance-none rounded-full bg-alveus-green-800 shadow-inner active:cursor-grabbing slider-thumb:size-6 slider-thumb:appearance-none slider-thumb:rounded-md slider-thumb:border-0 slider-thumb:bg-alveus-tan slider-thumb:shadow-lg slider-thumb:transition-transform slider-thumb:hover:scale-110 slider-thumb:active:scale-95"
            title="Scroll horizontally"
          />
        </div>
      )}

      <Box
        dark
        className={classes(
          "z-10 flex shrink-0 overflow-visible bg-alveus-green-800/75 p-0 backdrop-blur-xs",
          fullscreen && "max-md:mb-4",
        )}
      >
        <button
          type="button"
          onClick={() => setSearch("")}
          title="Clear search"
          className="peer absolute inset-y-0 left-0 z-20 rounded-xl p-3 transition-colors hover:bg-alveus-green disabled:pointer-events-none"
          disabled={!search.length}
        >
          {search.length ? (
            <IconX className="size-5" />
          ) : (
            <IconSearch className="m-0.5 size-4" />
          )}
        </button>

        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for pixels by Twitch username or donation email..."
          className="shrink grow rounded-xl py-3 pl-10 font-mono text-xs transition-[padding] outline-none peer-hover:pl-12 placeholder:text-alveus-tan/75 sm:text-sm"
        />

        <Transition show={!!search.trim()}>
          <p
            className={classes(
              "shrink-0 text-sm tabular-nums opacity-75 transition-all data-closed:opacity-0 max-md:absolute max-md:top-full max-md:left-2 md:my-auto md:pl-2",
              fullscreen
                ? "text-alveus-tan"
                : "text-alveus-green md:text-alveus-tan",
            )}
          >
            {`Found ${filtered.toLocaleString()} ${pluralize("pixel", filtered)}`}
          </p>
        </Transition>

        <button
          type="button"
          onClick={fullscreenToggle}
          title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className={classes(
            "z-20 shrink-0 rounded-xl p-3 text-sm transition-colors",
            fullscreen ? "hover:bg-alveus-green" : "hover:bg-alveus-green-800",
          )}
        >
          {fullscreen ? (
            <IconArrowsIn className="size-5" />
          ) : (
            <IconArrowsOut className="size-5" />
          )}
        </button>
      </Box>
    </div>
  );
};

export default PixelsSearch;
