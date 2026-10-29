import { describe, expect, it, vi } from "vitest";

import { getPdfSpread } from "@/components/content/PdfBook";

vi.mock("react-pdf", () => ({
  pdfjs: { GlobalWorkerOptions: {}, version: "test" },
  Document: () => null,
  Page: () => null,
}));

describe("getPdfSpread", () => {
  it("shows a standalone cover", () => {
    expect(getPdfSpread(1, 12, true)).toEqual({
      pages: [1],
      previous: null,
      next: 2,
    });
  });

  it("pairs even and odd interior pages", () => {
    for (const page of [2, 3]) {
      expect(getPdfSpread(page, 12, true)).toEqual({
        pages: [2, 3],
        previous: 1,
        next: 4,
      });
    }
  });

  it("shows an unpaired final page without exceeding the page count", () => {
    expect(getPdfSpread(12, 12, true)).toEqual({
      pages: [12],
      previous: 10,
      next: null,
    });
  });

  it("shows a paired final spread for an odd page count", () => {
    expect(getPdfSpread(13, 13, true)).toEqual({
      pages: [12, 13],
      previous: 10,
      next: null,
    });
  });

  it("handles a single-page report", () => {
    expect(getPdfSpread(1, 1, true)).toEqual({
      pages: [1],
      previous: null,
      next: null,
    });
  });

  it("visits every page exactly once in either layout", () => {
    for (const twoPages of [false, true]) {
      for (const count of [1, 2, 3, 12, 13]) {
        const visited: number[] = [];
        let current: number | null = 1;
        while (current !== null) {
          const spread = getPdfSpread(current, count, twoPages);
          visited.push(...spread.pages);
          current = spread.next;
        }
        expect(visited).toEqual(
          Array.from({ length: count }, (_, index) => index + 1),
        );
      }
    }
  });

  it("keeps the selected page visible when switching layouts", () => {
    expect(getPdfSpread(5, 12, true).pages).toContain(5);
    expect(getPdfSpread(5, 12, false)).toEqual({
      pages: [5],
      previous: 4,
      next: 6,
    });
    expect(getPdfSpread(12, 12, false)).toEqual({
      pages: [12],
      previous: 11,
      next: null,
    });
  });
});
