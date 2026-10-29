import { describe, expect, it, vi } from "vitest";

import { getPdfPageTurn, getPdfSpread } from "@/components/content/PdfBook";

vi.mock("react-pdf", () => ({
  pdfjs: { GlobalWorkerOptions: {}, version: "test" },
  Document: () => null,
  Page: () => null,
}));

describe("getPdfPageTurn", () => {
  const turning = {
    direction: 1,
    active: true,
    ready: true,
    opening: false,
    canFold: true,
    folded: false,
    reducedMotion: false,
  };

  it.each([
    { direction: 1, outgoingIndex: 1, incomingIndex: 0 },
    { direction: -1, outgoingIndex: 0, incomingIndex: 1 },
  ])(
    "keeps both halves of a $direction turn hinged at the spine",
    ({ direction, outgoingIndex, incomingIndex }) => {
      const turn = { ...turning, direction };
      expect(getPdfPageTurn(turn, true, outgoingIndex, 2)).toEqual({
        turning: true,
        rotateY: -direction * 90,
        hidden: false,
        hingeRight: direction < 0,
        startFolded: false,
      });
      expect(getPdfPageTurn(turn, false, incomingIndex, 2)).toEqual({
        turning: true,
        rotateY: direction * 90,
        hidden: true,
        hingeRight: direction > 0,
        startFolded: true,
      });
    },
  );

  it("holds incoming pages hidden until rendering completes", () => {
    const loading = { ...turning, ready: false, canFold: false };
    for (const index of [0, 1]) {
      expect(getPdfPageTurn(loading, false, index, 2).hidden).toBe(true);
      expect(getPdfPageTurn(loading, true, index, 2).hidden).toBe(false);
    }
    expect(getPdfPageTurn(loading, true, 1, 2).rotateY).toBe(0);
  });

  it("waits for alignment before revealing an opening spread or folding", () => {
    const aligning = { ...turning, opening: true, canFold: false };
    expect(getPdfPageTurn(aligning, true, 0, 1).rotateY).toBe(0);
    expect(getPdfPageTurn(aligning, false, 0, 2).hidden).toBe(true);
    expect(getPdfPageTurn(aligning, false, 1, 2).hidden).toBe(true);
  });

  it("hides only the outgoing turning face at the midpoint", () => {
    const folded = { ...turning, folded: true };
    expect(getPdfPageTurn(folded, true, 1, 2).hidden).toBe(true);
    expect(getPdfPageTurn(folded, true, 0, 2).hidden).toBe(false);
    expect(getPdfPageTurn(folded, false, 0, 2)).toMatchObject({
      rotateY: 0,
      hidden: false,
    });
  });

  it.each([1, -1])("turns standalone covers in direction %s", (direction) => {
    const turn = { ...turning, direction };
    expect(getPdfPageTurn(turn, true, 0, 1).turning).toBe(true);
    expect(getPdfPageTurn(turn, false, 0, 1).turning).toBe(true);
  });

  it("does not rotate either face for reduced motion", () => {
    const reduced = { ...turning, reducedMotion: true };
    for (const outgoing of [false, true]) {
      for (const index of [0, 1]) {
        expect(getPdfPageTurn(reduced, outgoing, index, 2)).toMatchObject({
          rotateY: 0,
          hidden: false,
          startFolded: false,
        });
      }
    }
  });

  it("does not fold pages on initial load", () => {
    const initial = { ...turning, direction: 0, active: false };
    for (const index of [0, 1]) {
      expect(getPdfPageTurn(initial, false, index, 2)).toMatchObject({
        turning: false,
        rotateY: 0,
        hidden: false,
        startFolded: false,
      });
    }
  });
});

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
