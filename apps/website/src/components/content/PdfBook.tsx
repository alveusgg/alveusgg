import { type ReactNode, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

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
  const [width, setWidth] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<number>();
  const [failed, setFailed] = useState(false);

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
  const pageWidth = twoPages ? Math.floor((width - 16) / 2) : width;
  const { pages, previous, next } = getPdfSpread(page, pageCount, twoPages);

  const onError = (error: unknown) => {
    console.error("Failed to display PDF report", error);
    setFailed(true);
  };

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
            onItemClick={({ pageNumber }) => setPage(pageNumber)}
            externalLinkTarget="_blank"
            externalLinkRel="noopener noreferrer"
          >
            {width > 0 && pageCount > 0 && (
              <div className="flex items-start justify-center gap-4">
                {pages.map((pageNumber) => (
                  <div
                    key={pageNumber}
                    role="group"
                    aria-label={`Page ${pageNumber}`}
                    className="shrink-0 overflow-hidden rounded-sm shadow-lg"
                    style={{
                      width: pageWidth,
                      minHeight: aspectRatio
                        ? pageWidth / aspectRatio
                        : undefined,
                    }}
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={pageWidth}
                      suspense={false}
                      renderTextLayer
                      renderAnnotationLayer
                      onLoadSuccess={(loadedPage) => {
                        const viewport = loadedPage.getViewport({ scale: 1 });
                        setAspectRatio(viewport.width / viewport.height);
                      }}
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
                  </div>
                ))}
              </div>
            )}
          </Document>
        </div>
      )}
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {!failed && pageCount > 0 && (
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
              disabled={previous === null}
              onClick={() => {
                if (previous !== null) setPage(previous);
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
              onClick={() => {
                if (next !== null) setPage(next);
              }}
            >
              <IconChevronRight size={24} aria-hidden />
            </Button>
          </nav>
        )}
        <div className="col-start-3 justify-self-end">{downloads}</div>
      </div>
    </div>
  );
};

export default PdfBook;
