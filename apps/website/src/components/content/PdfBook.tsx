// PDF.js text extraction needs stream async iteration, missing in Safari 26.
import "@sec-ant/readable-stream/polyfill/asyncIterator";

import { motion } from "motion/react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";

import usePrefersReducedMotion from "@/hooks/motion";

import Button from "@/components/content/Button";

import IconChevronLeft from "@/icons/IconChevronLeft";
import IconChevronRight from "@/icons/IconChevronRight";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `/_deps/pdfjs/pdf.worker.min.mjs?v=${pdfjs.version}`;

const options = {
  cMapUrl: "/_deps/pdfjs/cmaps/",
  standardFontDataUrl: "/_deps/pdfjs/standard_fonts/",
  wasmUrl: "/_deps/pdfjs/wasm/",
};

const PAGE_GAP = 16;
const ALIGN_DURATION = 0.55;
const FOLD_DURATION = 0.3;
const CORNER_SIZE = 72;
const CORNER_DURATION = 0.18;
const ALIGN_EASE = [0.22, 1, 0.36, 1] as const;

type PdfCorner = "left" | "right";
type PdfPages = [number] | [number, number];
type PdfTurnPhase = "idle" | "aligning" | "folding" | "landing";

// PdfBook waits for incoming canvases; PdfSpread advances the turn through
// animation callbacks. PdfPage handles the dog-ear independently of the turn.
// Desktop turns align at the spine, fold the old face, then land the new face.
type PdfTurnState = {
  outgoingPages: PdfPages | [];
  direction: number;
  phase: PdfTurnPhase;
};

type PdfTurnAction =
  | { type: "start"; pages: PdfPages; direction: number }
  | { type: "aligned" | "folded" | "landed" };

export function pdfTurnReducer(
  state: PdfTurnState,
  action: PdfTurnAction,
): PdfTurnState {
  if (action.type === "start") {
    return {
      outgoingPages: action.pages,
      direction: action.direction,
      phase: "aligning",
    };
  }
  if (state.phase === "idle") return state;

  // Multiple faces can finish animating; late callbacks must not rewind the turn.
  switch (action.type) {
    case "aligned":
      return state.phase === "aligning"
        ? { ...state, phase: "folding" }
        : state;
    case "folded":
      return state.phase !== "landing" ? { ...state, phase: "landing" } : state;
    case "landed":
      return { ...state, outgoingPages: [], phase: "idle" };
  }
}

export function getPdfSpread(
  page: number,
  pageCount: number,
  twoPages: boolean,
) {
  const first = twoPages && page > 1 ? page - (page % 2) : page;
  const last = twoPages && first > 1 ? Math.min(first + 1, pageCount) : first;
  const pages: PdfPages = first === last ? [first] : [first, last];

  return {
    pages,
    previous: first > 1 ? Math.max(1, first - (twoPages ? 2 : 1)) : null,
    next: last < pageCount ? last + 1 : null,
  };
}

type PageTurn = {
  direction: number;
  phase: PdfTurnPhase;
  ready: boolean;
  reducedMotion: boolean;
};

export function getPdfPageTurn(
  turn: PageTurn,
  outgoing: boolean,
  index: number,
  pageCount: number,
) {
  const forward = turn.direction > 0;
  const turningIndex = outgoing ? (forward ? 1 : 0) : forward ? 0 : 1;
  const turning =
    turn.direction !== 0 && (pageCount === 1 || index === turningIndex);
  const active = turn.phase !== "idle";
  const canFold = turn.ready && turn.phase !== "aligning";
  const waitingForPages = !turn.ready && active;
  const waitingForAlignment = turn.phase === "aligning";
  const waitingForOutgoingFold = active && turn.phase !== "landing";

  let rotateY = 0;
  if (!turn.reducedMotion && turning) {
    if (outgoing && canFold) rotateY = -turn.direction * 90;
    if (!outgoing && (!turn.ready || waitingForOutgoingFold))
      rotateY = turn.direction * 90;
  }

  const hidden = outgoing
    ? turning && turn.phase === "landing"
    : waitingForPages ||
      waitingForAlignment ||
      (turning && waitingForOutgoingFold && !turn.reducedMotion);

  return {
    turning,
    rotateY,
    hidden,
    hingeRight: outgoing ? turn.direction < 0 : forward,
    startFolded: turning && !outgoing && !turn.reducedMotion,
  };
}

type PdfPageProps = {
  pageNumber: number;
  width: number;
  corner: PdfCorner | undefined;
  previews: PdfCorner[];
  reducedMotion: boolean;
  onLoad: ComponentProps<typeof Page>["onLoadSuccess"];
  onRender: () => void;
  onError: (error: unknown) => void;
};

const PdfPage = ({
  pageNumber,
  width,
  corner,
  previews,
  reducedMotion,
  onLoad,
  onRender,
  onError,
}: PdfPageProps) => {
  const leftCorner = corner === "left" ? CORNER_SIZE : 0;
  const rightCorner = corner === "right" ? CORNER_SIZE : 0;

  return (
    <div className="relative">
      <motion.div
        className="overflow-hidden rounded-sm"
        initial={false}
        animate={{
          // Keep the same polygon vertices so Motion can interpolate both corners.
          clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${rightCorner}px), calc(100% - ${rightCorner}px) 100%, ${leftCorner}px 100%, 0 calc(100% - ${leftCorner}px))`,
        }}
        transition={{ duration: reducedMotion ? 0 : CORNER_DURATION }}
      >
        <Page
          pageNumber={pageNumber}
          width={width}
          suspense={false}
          renderTextLayer
          renderAnnotationLayer
          onLoadSuccess={onLoad}
          onRenderSuccess={onRender}
          loading={
            <p role="status" className="p-8 text-center">
              Loading page {pageNumber}...
            </p>
          }
          onLoadError={onError}
          onRenderError={onError}
          onGetTextError={onError}
          onRenderTextLayerError={onError}
          onGetAnnotationsError={onError}
          onRenderAnnotationLayerError={onError}
        />
      </motion.div>
      {/* Keep previews on the page so they close while the page itself turns. */}
      {previews.map((side) => (
        <PdfCornerPreview
          key={side}
          pageNumber={pageNumber + (side === "left" ? -1 : 1)}
          pageWidth={width}
          left={side === "left"}
          visible={corner === side}
          reducedMotion={reducedMotion}
          onError={onError}
        />
      ))}
    </div>
  );
};

type PdfSpreadProps = {
  pageCount: number;
  corner: PdfCorner | undefined;
  pages: number[];
  outgoing: boolean;
  turn: PageTurn;
  width: number;
  pageWidth: number;
  twoPages: boolean;
  aspectRatio: number | undefined;
  onAligned: () => void;
  onFolded: () => void;
  onLanded: () => void;
  onPageLoad: PdfPageProps["onLoad"];
  onPageRender: (pageNumber: number) => void;
  onError: PdfPageProps["onError"];
};

const PdfSpread = ({
  pageCount,
  corner,
  pages,
  outgoing,
  turn,
  width,
  pageWidth,
  twoPages,
  aspectRatio,
  onAligned,
  onFolded,
  onLanded,
  onPageLoad,
  onPageRender,
  onError,
}: PdfSpreadProps) => {
  const spreadWidth = pages.length * pageWidth + (pages.length - 1) * PAGE_GAP;
  const active = turn.phase !== "idle";
  const atSpine = twoPages && active && (!outgoing || turn.ready);
  const singlePageOnRight =
    pages.length === 1 && (outgoing ? turn.direction > 0 : turn.direction < 0);
  const offset = atSpine
    ? (width - (pageWidth * 2 + PAGE_GAP)) / 2 +
      (singlePageOnRight ? pageWidth + PAGE_GAP : 0)
    : (width - spreadWidth) / 2;
  const incomingHidden =
    !outgoing && ((!turn.ready && active) || turn.phase === "aligning");
  const inaccessible = outgoing || (!turn.ready && active);
  const sliding = !twoPages && active && !turn.reducedMotion;
  const slideOffset = outgoing
    ? turn.ready
      ? -turn.direction * width
      : 0
    : turn.ready
      ? 0
      : turn.direction * width;

  return (
    <motion.div
      initial={sliding && !outgoing ? { x: turn.direction * width } : false}
      animate={{ x: sliding ? slideOffset : offset }}
      onAnimationComplete={() => {
        if (sliding && !outgoing && turn.ready) onLanded();
        if (outgoing && turn.ready) onAligned();
      }}
      transition={{
        duration: turn.reducedMotion ? 0 : ALIGN_DURATION,
        ease: ALIGN_EASE,
      }}
      className={
        outgoing
          ? "absolute top-0 left-0 flex items-start gap-4"
          : "relative flex items-start gap-4"
      }
      aria-hidden={inaccessible}
      inert={inaccessible}
      style={{
        width: spreadWidth,
        // Swap stacking at the spine, but retain the stationary outgoing page until landing.
        zIndex: outgoing !== (turn.phase === "landing") ? 20 : 10,
        perspective: 1600,
        visibility: incomingHidden ? "hidden" : undefined,
      }}
    >
      {pages.map((pageNumber, index) => {
        const face = getPdfPageTurn(turn, outgoing, index, pages.length);
        const previews: PdfCorner[] = [];
        if (index === 0 && pageNumber > 1) previews.push("left");
        if (index === pages.length - 1 && pageNumber < pageCount)
          previews.push("right");

        return (
          <motion.div
            key={pageNumber}
            role="group"
            aria-label={`Page ${pageNumber}`}
            className="shrink-0 drop-shadow-lg"
            initial={
              twoPages && face.startFolded
                ? { rotateY: turn.direction * 90 }
                : false
            }
            animate={{ rotateY: twoPages ? face.rotateY : 0 }}
            transition={{
              rotateY: {
                duration:
                  face.turning && !turn.reducedMotion ? FOLD_DURATION : 0,
                ease: outgoing ? "easeIn" : "easeOut",
              },
            }}
            onAnimationComplete={() => {
              if (!twoPages) return;
              if (!face.turning) return;
              if (outgoing && turn.ready && turn.phase !== "aligning")
                onFolded();
              if (
                !outgoing &&
                turn.ready &&
                (turn.phase === "landing" || turn.reducedMotion)
              )
                onLanded();
            }}
            style={{
              width: pageWidth,
              transformOrigin: face.hingeRight ? "right center" : "left center",
              backfaceVisibility: "hidden",
              visibility: twoPages && face.hidden ? "hidden" : undefined,
              minHeight: aspectRatio ? pageWidth / aspectRatio : undefined,
            }}
          >
            {/* Shadow stays outside the clipped surface so it follows the dog-ear. */}
            <PdfPage
              pageNumber={pageNumber}
              width={pageWidth}
              corner={
                !active && !outgoing && corner && previews.includes(corner)
                  ? corner
                  : undefined
              }
              previews={previews}
              reducedMotion={turn.reducedMotion}
              onLoad={onPageLoad}
              onRender={() => {
                if (!outgoing) onPageRender(pageNumber);
              }}
              onError={onError}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

type PdfNavigationProps = ReturnType<typeof getPdfSpread> & {
  busy: boolean;
  onNavigate: (page: number) => void;
};

const PdfCornerPreview = ({
  pageNumber,
  pageWidth,
  left,
  visible,
  reducedMotion,
  onError,
}: {
  pageNumber: number;
  pageWidth: number;
  left: boolean;
  visible: boolean;
  reducedMotion: boolean;
  onError: (error: unknown) => void;
}) => (
  <motion.span
    aria-hidden
    className="pointer-events-none absolute bottom-0"
    style={{
      width: CORNER_SIZE,
      height: CORNER_SIZE,
      left: left ? 0 : undefined,
      right: left ? undefined : 0,
      transformOrigin: left ? "bottom left" : "bottom right",
      filter: `drop-shadow(${left ? 3 : -3}px -3px 4px rgb(0 0 0 / 30%))`,
    }}
    initial={false}
    animate={{ scale: visible ? 1 : 0 }}
    transition={{ duration: reducedMotion ? 0 : CORNER_DURATION }}
  >
    {/* Clip inside the shadow wrapper so the folded triangle casts onto the page. */}
    <span
      className={`absolute inset-0 overflow-hidden bg-white ${left ? "rounded-tr-sm" : "rounded-tl-sm"}`}
      style={{
        clipPath: left
          ? "polygon(0 0, 100% 0, 100% 100%)"
          : "polygon(0 0, 100% 0, 0 100%)",
      }}
    >
      {/* Reflect the reverse page's bottom corner across the diagonal crease. */}
      <span
        className="absolute inset-0"
        style={{
          transform: left
            ? "matrix(0, 1, 1, 0, 0, 0)"
            : `matrix(0, -1, -1, 0, ${CORNER_SIZE}, ${CORNER_SIZE})`,
          transformOrigin: "0 0",
        }}
      >
        <span
          className="absolute bottom-0"
          style={{
            width: pageWidth,
            left: left ? undefined : 0,
            right: left ? 0 : undefined,
          }}
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            suspense={false}
            renderTextLayer={false}
            // Decorative copies must not replace real pages as PDF link destinations.
            _enableRegisterUnregisterPage={false}
            renderAnnotationLayer={false}
            loading={null}
            onLoadError={onError}
            onRenderError={onError}
          />
        </span>
      </span>
      <span
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${left ? 135 : 225}deg, transparent 35%, rgb(0 0 0 / 25%) 100%)`,
        }}
      />
    </span>
  </motion.span>
);

const PdfEdgeNavigation = ({
  previous,
  next,
  busy,
  onNavigate,
  onCornerChange,
}: Omit<PdfNavigationProps, "pages"> & {
  onCornerChange: (corner: PdfCorner | undefined) => void;
}) => {
  return (
    <>
      {[
        {
          page: previous,
          label: "Previous page",
          side: "left-0 rounded-l-sm",
          left: true,
        },
        {
          page: next,
          label: "Next page",
          side: "right-0 rounded-r-sm",
          left: false,
        },
      ].map(({ page, label, side, left }) =>
        page === null ? null : (
          <button
            key={label}
            type="button"
            aria-label={label}
            title={label}
            aria-disabled={busy}
            onMouseEnter={() => {
              if (!busy) onCornerChange(left ? "left" : "right");
            }}
            onMouseLeave={() => onCornerChange(undefined)}
            onFocus={() => {
              if (!busy) onCornerChange(left ? "left" : "right");
            }}
            onBlur={() => onCornerChange(undefined)}
            onClick={() => {
              if (!busy) onNavigate(page);
            }}
            style={{ width: CORNER_SIZE }}
            className={`pointer-events-auto absolute inset-y-0 ${side} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green aria-disabled:pointer-events-none`}
          />
        ),
      )}
    </>
  );
};

const PdfPagination = ({
  pages,
  previous,
  next,
  pageCount,
  busy,
  onNavigate,
}: PdfNavigationProps & { pageCount: number }) => (
  <nav
    aria-label="Report pages"
    className="flex w-fit items-center gap-2 rounded-full bg-alveus-green p-1 text-alveus-tan shadow-lg md:col-start-2"
  >
    <Button
      as="button"
      dark
      type="button"
      aria-label="Previous"
      title="Previous"
      className="border-transparent p-3"
      disabled={previous === null}
      aria-disabled={busy}
      onClick={() => {
        if (!busy && previous !== null) onNavigate(previous);
      }}
    >
      <IconChevronLeft size={24} aria-hidden />
    </Button>
    <p
      role="status"
      aria-live="polite"
      className="grid px-2 text-center text-sm whitespace-nowrap tabular-nums"
    >
      <span aria-hidden className="invisible col-start-1 row-start-1">
        Pages {pageCount}-{pageCount} of {pageCount}
      </span>
      <span className="col-start-1 row-start-1">
        {pages.length === 1
          ? `Page ${pages[0]}`
          : `Pages ${pages[0]}-${pages[1]}`}{" "}
        of {pageCount}
      </span>
    </p>
    <Button
      as="button"
      dark
      type="button"
      aria-label="Next"
      title="Next"
      className="border-transparent p-3"
      disabled={next === null}
      aria-disabled={busy}
      onClick={() => {
        if (!busy && next !== null) onNavigate(next);
      }}
    >
      <IconChevronRight size={24} aria-hidden />
    </Button>
  </nav>
);

const PdfBook = ({
  file,
  title,
  downloads,
}: {
  file: string;
  title: string;
  downloads?: ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [width, setWidth] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<number>();
  const [activeCorner, setActiveCorner] = useState<PdfCorner>();
  const [failed, setFailed] = useState(false);
  const [{ outgoingPages, direction, phase }, dispatchTurn] = useReducer(
    pdfTurnReducer,
    { outgoingPages: [], direction: 0, phase: "idle" },
  );
  const active = phase !== "idle";
  const [renderedPages, setRenderedPages] = useState<string[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const twoPages = width >= 768;
  const pageWidth = twoPages ? Math.floor((width - PAGE_GAP) / 2) : width;
  const spread = getPdfSpread(page, pageCount, twoPages);
  const spreadWidth =
    spread.pages.length * pageWidth + (spread.pages.length - 1) * PAGE_GAP;
  // A page is ready only after its canvas has rendered at the current width.
  const ready = spread.pages.every((number) =>
    renderedPages.includes(`${number}-${pageWidth}`),
  );

  useEffect(() => {
    if (prefersReducedMotion && ready && active) {
      dispatchTurn({ type: "landed" });
    }
  }, [prefersReducedMotion, ready, active]);

  const opening =
    twoPages && outgoingPages.length === 1 && spread.pages.length === 2;
  // Only opening a single cover needs alignment before folding.
  const turn: PageTurn = {
    direction,
    phase:
      phase === "aligning" && (!opening || prefersReducedMotion)
        ? "folding"
        : phase,
    ready,
    reducedMotion: prefersReducedMotion,
  };

  const goToPage = (nextPage: number) => {
    if (!ready || active || spread.pages.includes(nextPage)) return;
    setActiveCorner(undefined);
    dispatchTurn({
      type: "start",
      pages: spread.pages,
      direction: nextPage > page ? 1 : -1,
    });
    setPage(nextPage);
    setRenderedPages([]);
  };

  const onError = (error: unknown) => {
    console.error("Failed to display PDF report", error);
    setFailed(true);
  };

  const onPageLoad: PdfPageProps["onLoad"] = (loadedPage) => {
    const viewport = loadedPage.getViewport({ scale: 1 });
    setAspectRatio(viewport.width / viewport.height);
  };

  const onPageRender = (pageNumber: number) => {
    const key = `${pageNumber}-${pageWidth}`;
    setRenderedPages((current) =>
      current.includes(key) ? current : [...current, key],
    );
  };

  const spreads = active ? [outgoingPages, spread.pages] : [spread.pages];
  const navigationBusy = !ready || active;

  return (
    <div ref={containerRef} className="w-full max-w-6xl">
      {failed ? (
        <p role="alert" className="p-8 text-center">
          Unable to display the report. Please use the download menu below.
        </p>
      ) : (
        <div
          role="group"
          aria-label={`${title} PDF viewer`}
          aria-busy={navigationBusy}
        >
          <Document
            file={file}
            options={options}
            suspense={false}
            loading={
              <p role="status" className="p-8 text-center">
                Loading report...
              </p>
            }
            onLoadSuccess={({ numPages }) => setPageCount(numPages)}
            onLoadError={onError}
            onSourceError={onError}
            onItemClick={({ pageNumber }) => goToPage(pageNumber)}
            externalLinkTarget="_blank"
            externalLinkRel="noopener noreferrer"
          >
            {width > 0 && pageCount > 0 && (
              <div className={twoPages ? undefined : "overflow-hidden"}>
                <div className="relative">
                  {spreads.map((pages) => (
                    <PdfSpread
                      pageCount={pageCount}
                      corner={activeCorner}
                      // Retain existing canvases as the outgoing spread instead of remounting.
                      key={pages.join("-")}
                      pages={pages}
                      outgoing={pages === outgoingPages}
                      turn={turn}
                      width={width}
                      pageWidth={pageWidth}
                      twoPages={twoPages}
                      aspectRatio={aspectRatio}
                      onAligned={() => dispatchTurn({ type: "aligned" })}
                      onFolded={() => dispatchTurn({ type: "folded" })}
                      onLanded={() => dispatchTurn({ type: "landed" })}
                      onPageLoad={onPageLoad}
                      onPageRender={onPageRender}
                      onError={onError}
                    />
                  ))}
                  <div
                    className="pointer-events-none absolute inset-y-0 z-30"
                    style={{
                      left: (width - spreadWidth) / 2,
                      width: spreadWidth,
                    }}
                  >
                    <PdfEdgeNavigation
                      onCornerChange={setActiveCorner}
                      {...spread}
                      busy={navigationBusy}
                      onNavigate={goToPage}
                    />
                  </div>
                </div>
              </div>
            )}
          </Document>
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:grid md:grid-cols-[1fr_auto_1fr]">
        {!failed && pageCount > 0 && (
          <PdfPagination
            {...spread}
            pageCount={pageCount}
            busy={navigationBusy}
            onNavigate={goToPage}
          />
        )}
        <div className="md:col-start-3 md:justify-self-end">{downloads}</div>
      </div>
    </div>
  );
};

export default PdfBook;
