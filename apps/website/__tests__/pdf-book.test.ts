import { describe, expect, it, vi } from "vitest";

import {
  getPdfPageTurn,
  getPdfSpread,
  pdfTurnReducer,
} from "@/components/content/PdfBook";

vi.mock("react-pdf", () => ({
  pdfjs: { GlobalWorkerOptions: {}, version: "test" },
  Document: () => null,
  Page: () => null,
}));

describe("pdfTurnReducer", () => {
  const idle: Parameters<typeof pdfTurnReducer>[0] = {
    outgoingPages: [],
    direction: 0,
    phase: "idle",
  };
  const started = pdfTurnReducer(idle, {
    type: "start",
    pages: [2, 3],
    direction: 1,
  });

  it("starts each turn with the previous spread and fresh progress", () => {
    expect(
      pdfTurnReducer(
        { ...started, phase: "landing" },
        { type: "start", pages: [4, 5], direction: -1 },
      ),
    ).toEqual({
      outgoingPages: [4, 5],
      direction: -1,
      phase: "aligning",
    });
  });

  it("aligns, folds, then releases the outgoing spread on landing", () => {
    const aligned = pdfTurnReducer(started, { type: "aligned" });
    expect(aligned.phase).toBe("folding");
    const folded = pdfTurnReducer(aligned, { type: "folded" });
    expect(folded.phase).toBe("landing");
    expect(folded.outgoingPages).toEqual([2, 3]);
    expect(pdfTurnReducer(folded, { type: "landed" }).outgoingPages).toEqual(
      [],
    );
  });

  it("allows interior spreads to fold without a separate alignment animation", () => {
    expect(pdfTurnReducer(started, { type: "folded" }).phase).toBe("landing");
  });

  it("allows mobile and reduced-motion turns to land without folding", () => {
    expect(pdfTurnReducer(started, { type: "landed" }).outgoingPages).toEqual(
      [],
    );
  });

  it("does not rewind progress when alignment finishes after folding", () => {
    const folded = pdfTurnReducer(started, { type: "folded" });
    expect(pdfTurnReducer(folded, { type: "aligned" })).toBe(folded);
    expect(pdfTurnReducer(folded, { type: "folded" })).toBe(folded);
  });

  it("ignores animation callbacks when there is no outgoing spread", () => {
    for (const type of ["aligned", "folded", "landed"] as const) {
      expect(pdfTurnReducer(idle, { type })).toBe(idle);
    }
  });
});

describe("getPdfPageTurn", () => {
  const turning = {
    direction: 1,
    phase: "folding" as const,
    ready: true,
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
    const loading = { ...turning, ready: false };
    for (const index of [0, 1]) {
      expect(getPdfPageTurn(loading, false, index, 2).hidden).toBe(true);
      expect(getPdfPageTurn(loading, true, index, 2).hidden).toBe(false);
    }
    expect(getPdfPageTurn(loading, true, 1, 2).rotateY).toBe(0);
  });

  it("waits for alignment before revealing an opening spread or folding", () => {
    const aligning = { ...turning, phase: "aligning" as const };
    expect(getPdfPageTurn(aligning, true, 0, 1).rotateY).toBe(0);
    expect(getPdfPageTurn(aligning, false, 0, 2).hidden).toBe(true);
    expect(getPdfPageTurn(aligning, false, 1, 2).hidden).toBe(true);
  });

  it.each([
    { direction: 1, outgoingIndex: 1, incomingIndex: 0 },
    { direction: -1, outgoingIndex: 0, incomingIndex: 1 },
  ])(
    "swaps turning faces at the midpoint in direction $direction",
    ({ direction, outgoingIndex, incomingIndex }) => {
      const folded = { ...turning, direction, phase: "landing" as const };
      expect(getPdfPageTurn(folded, true, outgoingIndex, 2).hidden).toBe(true);
      expect(getPdfPageTurn(folded, false, incomingIndex, 2)).toMatchObject({
        rotateY: 0,
        hidden: false,
      });
    },
  );

  it.each([1, -1])(
    "keeps stationary pages visible throughout a direction %s fold",
    (direction) => {
      for (const phase of ["folding", "landing"] as const) {
        const turn = { ...turning, direction, phase };
        const outgoingIndex = direction > 0 ? 0 : 1;
        const incomingIndex = direction > 0 ? 1 : 0;
        for (const [outgoing, index] of [
          [true, outgoingIndex],
          [false, incomingIndex],
        ] as const) {
          expect(getPdfPageTurn(turn, outgoing, index, 2)).toMatchObject({
            turning: false,
            rotateY: 0,
            hidden: false,
          });
        }
      }
    },
  );

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
    const initial = { ...turning, direction: 0, phase: "idle" as const };
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
