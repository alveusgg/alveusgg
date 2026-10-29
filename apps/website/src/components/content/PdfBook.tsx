import { motion } from "motion/react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
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
const ALIGN_EASE = [0.22, 1, 0.36, 1] as const;

export function getPdfSpread(
  page: number,
  pageCount: number,
  twoPages: boolean,
) {
  const first = twoPages && page > 1 ? page - (page % 2) : page;
  const last = twoPages && first > 1 ? Math.min(first + 1, pageCount) : first;

  return {
    pages: first === last ? [first] : [first, last],
    previous: first > 1 ? Math.max(1, first - (twoPages ? 2 : 1)) : null,
    next: last < pageCount ? last + 1 : null,
  };
}

type PageTurn = {
  direction: number;
  active: boolean;
  ready: boolean;
  opening: boolean;
  canFold: boolean;
  folded: boolean;
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
  const waitingForPages = !turn.ready && turn.active;
  const waitingForAlignment = turn.opening && !turn.canFold;
  const waitingForOutgoingFold = !turn.folded && turn.active;

  let rotateY = 0;
  if (!turn.reducedMotion && turning) {
    if (outgoing && turn.canFold) rotateY = -turn.direction * 90;
    if (!outgoing && (!turn.ready || waitingForOutgoingFold))
      rotateY = turn.direction * 90;
  }

  const hidden = outgoing
    ? turning && turn.folded
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
  onLoad: ComponentProps<typeof Page>["onLoadSuccess"];
  onRender: () => void;
  onError: (error: unknown) => void;
};

const PdfPage = ({
  pageNumber,
  width,
  onLoad,
  onRender,
  onError,
}: PdfPageProps) => (
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
);

type PdfSpreadProps = {
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
  const atSpine = twoPages && turn.active && (!outgoing || turn.ready);
  const singlePageOnRight =
    pages.length === 1 && (outgoing ? turn.direction > 0 : turn.direction < 0);
  const offset = atSpine
    ? (width - (pageWidth * 2 + PAGE_GAP)) / 2 +
      (singlePageOnRight ? pageWidth + PAGE_GAP : 0)
    : (width - spreadWidth) / 2;
  const incomingHidden =
    !outgoing &&
    ((!turn.ready && turn.active) || (turn.opening && !turn.canFold));
  const inaccessible = outgoing || (!turn.ready && turn.active);
  const sliding = !twoPages && turn.active && !turn.reducedMotion;
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
        zIndex: outgoing !== turn.folded ? 20 : 10,
        perspective: 1600,
        visibility: incomingHidden ? "hidden" : undefined,
      }}
    >
      {pages.map((pageNumber, index) => {
        const face = getPdfPageTurn(turn, outgoing, index, pages.length);

        return (
          <motion.div
            key={pageNumber}
            role="group"
            aria-label={`Page ${pageNumber}`}
            className="shrink-0 overflow-hidden rounded-sm shadow-lg"
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
              if (outgoing && turn.canFold) onFolded();
              if (
                !outgoing &&
                turn.ready &&
                (turn.folded || turn.reducedMotion)
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
            <PdfPage
              pageNumber={pageNumber}
              width={pageWidth}
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

type PdfPaginationProps = ReturnType<typeof getPdfSpread> & {
  pageCount: number;
  disabled: boolean;
  onNavigate: (page: number) => void;
};

const PdfPagination = ({
  pages,
  previous,
  next,
  pageCount,
  disabled,
  onNavigate,
}: PdfPaginationProps) => (
  <nav
    aria-label="Report pages"
    className="col-start-2 flex w-fit items-center gap-2 rounded-full bg-alveus-green p-1 text-alveus-tan shadow-lg"
  >
    <Button
      as="button"
      dark
      type="button"
      aria-label="Previous"
      title="Previous"
      className="border-transparent p-3"
      disabled={previous === null || disabled}
      onClick={() => {
        if (previous !== null) onNavigate(previous);
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
      disabled={next === null || disabled}
      onClick={() => {
        if (next !== null) onNavigate(next);
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
  const [failed, setFailed] = useState(false);
  const [direction, setDirection] = useState(0);
  const [outgoingPages, setOutgoingPages] = useState<number[]>([]);
  const [folded, setFolded] = useState(false);
  const [aligned, setAligned] = useState(false);
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
  const ready = spread.pages.every((number) =>
    renderedPages.includes(`${number}-${pageWidth}`),
  );
  useEffect(() => {
    if (prefersReducedMotion && ready && outgoingPages.length > 0) {
      setOutgoingPages([]);
    }
  }, [prefersReducedMotion, ready, outgoingPages.length]);
  const opening =
    twoPages && outgoingPages.length === 1 && spread.pages.length === 2;
  // Opening translates first, then folds the outgoing face, then lands the incoming face.
  const turn: PageTurn = {
    direction,
    active: outgoingPages.length > 0,
    ready,
    opening,
    canFold: ready && (!opening || aligned || prefersReducedMotion),
    folded,
    reducedMotion: prefersReducedMotion,
  };

  const goToPage = (nextPage: number) => {
    if (spread.pages.includes(nextPage)) return;
    setOutgoingPages(spread.pages);
    setFolded(false);
    setAligned(false);
    setDirection(nextPage > page ? 1 : -1);
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

  const spreads = turn.active ? [outgoingPages, spread.pages] : [spread.pages];

  return (
    <div ref={containerRef} className="w-full max-w-6xl">
      {failed ? (
        <p role="alert" className="p-8 text-center">
          Unable to display the report. Please use the download menu below.
        </p>
      ) : (
        <div role="group" aria-label={`${title} PDF viewer`}>
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
                      key={pages[0]}
                      pages={pages}
                      outgoing={pages === outgoingPages}
                      turn={turn}
                      width={width}
                      pageWidth={pageWidth}
                      twoPages={twoPages}
                      aspectRatio={aspectRatio}
                      onAligned={() => setAligned(true)}
                      onFolded={() => setFolded(true)}
                      onLanded={() => setOutgoingPages([])}
                      onPageLoad={onPageLoad}
                      onPageRender={onPageRender}
                      onError={onError}
                    />
                  ))}
                </div>
              </div>
            )}
          </Document>
        </div>
      )}
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {!failed && pageCount > 0 && (
          <PdfPagination
            {...spread}
            pageCount={pageCount}
            disabled={!ready || turn.active}
            onNavigate={goToPage}
          />
        )}
        <div className="col-start-3 justify-self-end">{downloads}</div>
      </div>
    </div>
  );
};

export default PdfBook;
