import { Input, Transition } from "@headlessui/react";
import { type NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import pluralize from "pluralize";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { classes } from "@/utils/classes";

import type { Pixel } from "@/hooks/pixels";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Donate from "@/components/content/Donate";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Pixels from "@/components/institute/Pixels";
import PixelsDescription from "@/components/institute/PixelsDescription";
import Wolves from "@/components/institute/Wolves";

import IconArrowRight from "@/icons/IconArrowRight";
import IconArrowsIn from "@/icons/IconArrowsIn";
import IconArrowsOut from "@/icons/IconArrowsOut";
import IconSearch from "@/icons/IconSearch";
import IconX from "@/icons/IconX";

import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import buildingHeroImage from "@/assets/institute/hero/building.png";
import usfwsRedWolfWalkingImage from "@/assets/institute/usfws-red-wolf-walking.jpg";

const InstitutePixelsPage: NextPage = () => {
  const { query, replace, isReady } = useRouter();

  const [search, setSearchState] = useState("");

  // Sync search state with URL query on mount and query changes
  useEffect(() => {
    const querySearch = typeof query.s === "string" ? query.s : "";
    setSearchState(querySearch);
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
    const trimmed = search.trim();
    if (!trimmed) return undefined;

    const hashedExact = window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(trimmed))
      .then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      );

    const hashedNormalized = window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(trimmed.toLowerCase()))
      .then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      );

    return (pixel: Pixel) =>
      pixel.identifier.toLowerCase().includes(trimmed.toLowerCase()) ||
      Promise.all([hashedExact, hashedNormalized]).then(
        ([exact, norm]) => pixel.email === exact || pixel.email === norm,
      );
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
      return !v;
    });
  }, []);

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
    <>
      <Meta
        title="Pixel Project | Alveus Research & Recovery Institute"
        description="Explore the institute mural featuring 10,000 pixels unlocked by generous donors, raising $1,000,000 to fund the initial development of the Alveus Research & Recovery Institute."
        image={buildingHeroImage.src}
      >
        {fullscreen && (
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
        )}
      </Meta>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <Heading>Alveus Research & Recovery Institute Pixel Project</Heading>
        <Button
          href="/institute"
          dark
          className="inline-flex items-center gap-2"
        >
          <IconArrowRight className="size-5 -scale-x-100" />
          Learn More About the Institute
        </Button>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section
        className="grow overflow-hidden py-8"
        containerClassName="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3 items-start"
        offsetParent={!fullscreen}
      >
        <div
          className={classes(
            fullscreen
              ? "fixed inset-0 isolate z-100 flex h-screen w-screen touch-none flex-col gap-4 bg-alveus-green-900 p-4 ring-8 ring-alveus-green"
              : "contents",
          )}
        >
          <div className="relative z-10 col-span-full shrink grow">
            <Image
              src={leafRightImage2}
              alt=""
              className="pointer-events-none absolute bottom-0 left-full -z-10 h-3/4 max-h-64 w-auto -translate-x-2 -scale-x-100 drop-shadow-md select-none"
            />
            <Image
              src={leafLeftImage3}
              alt=""
              className="pointer-events-none absolute top-full left-0 -z-10 h-2/5 max-h-48 w-auto -translate-x-2/5 -translate-y-1/3 -scale-x-100 drop-shadow-md select-none"
            />

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
                fullscreen
                  ? "max-w-none!"
                  : "shadow-xl ring-4 ring-alveus-green",
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
              "z-10 col-span-full flex shrink-0 overflow-visible bg-alveus-green-800/75 p-0 backdrop-blur-xs",
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
              placeholder="Search for pixels by Twitch username or PayPal email..."
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
                fullscreen
                  ? "hover:bg-alveus-green"
                  : "hover:bg-alveus-green-800",
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

        <div className="relative pb-8 max-lg:order-last xl:col-span-2">
          <Image
            src={leafLeftImage2}
            alt=""
            className="pointer-events-none absolute right-0 -bottom-12 z-10 h-auto w-1/2 max-w-40 -scale-x-100 drop-shadow-md select-none"
          />

          <Box dark>
            <Heading level={2}>Saving Animals From Extinction</Heading>

            <p className="text-lg">
              We&apos;re taking the Alveus approach to the wild, and with your
              help, we successfully raised $1,000,000 to fund the initial
              development of the Alveus Research & Recovery Institute. All
              10,000 pixels on our mural have been unlocked by generous donors
              like you, each displaying the name of a vital original supporter
              of the Institute. While all pixels have been claimed, donations
              are still greatly needed to support the ongoing development and
              operations of the institute.
            </p>

            <Wolves
              image={{
                src: usfwsRedWolfWalkingImage,
                alt: "Red wolf, Hillebrand, Steve/USFWS, Public Domain, https://www.fws.gov/media/just-little-closer",
              }}
            >
              <p className="text-lg">
                The Alveus Research & Recovery Institute is aiming to create a
                conservation breeding program for the critically endangered
                Mexican Gray and Red wolves, helping to maintain a population
                under human care with the end goal of reintroducing these
                incredible animals back into the wild.
              </p>

              <Button
                href="/institute"
                dark
                className="mt-4 inline-flex items-center gap-2"
              >
                <IconArrowRight className="size-5 -scale-x-100" />
                Learn More About the Institute
              </Button>
            </Wolves>

            <p className="mt-4 text-xs text-balance opacity-75">
              Alveus Sanctuary will use all donations as part of the Pixel
              Project to fund the initial development of the institute.
              <br />
              In the event that more funds are raised than are needed for the
              project, additional funds will be allocated to the operations of
              the institute.
            </p>
          </Box>
        </div>

        <div className="flex flex-col gap-8">
          <Box dark>
            <PixelsDescription className="text-center text-2xl" />

            <Heading level={2} className="mt-8 text-xl">
              Can&apos;t find your pixel?
            </Heading>
            <p>
              If you donated via Twitch Charity, your pixel will show your
              Twitch username and you can search using that. If you donated via
              PayPal directly, your pixel will show your first name but you can
              also search using your PayPal email address.
            </p>
          </Box>

          <Donate type="twitch" highlight />
          <Donate type="paypal" link="/paypal/pixels" />
        </div>
      </Section>
    </>
  );
};

export default InstitutePixelsPage;
