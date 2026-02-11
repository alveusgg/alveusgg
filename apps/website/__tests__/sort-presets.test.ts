import { shuffle } from "lodash";
import { describe, expect, it } from "vitest";

import cameras from "@/data/tech/cameras";
import type { Preset } from "@/data/tech/cameras.types";

import { typeSafeObjectEntries } from "@/utils/helpers";

import { sortPresets } from "../src/utils/sort-presets";

describe("sortPresets", () => {
  it.each(Object.values(cameras).filter((data) => "presets" in data))(
    "sorts $title presets without losing data or throwing an exception",
    (data) => {
      expect(sortPresets(typeSafeObjectEntries(data.presets))?.[0]?.[0]).toBe(
        "home",
      );

      expect(
        sortPresets(typeSafeObjectEntries(data.presets)).toSorted(([a], [b]) =>
          a.localeCompare(b),
        ),
        "input and output contain the same data",
      ).toEqual(
        typeSafeObjectEntries(data.presets).toSorted(([a], [b]) =>
          a.localeCompare(b),
        ),
      );
    },
  );

  it("finds suitable home preset not named home", () => {
    expect(sortPresets(typeSafeObjectEntries(presetsTestData1))?.[0]?.[0]).toBe(
      "point04",
    );
  });

  it("sorts canned data", () => {
    expect(
      sortPresets([
        ...shuffle(typeSafeObjectEntries(presetsTestData1)),
        [
          "home",
          {
            description: "",
            image,
            position: { pan: 0, tilt: 0, zoom: 1 },
          },
        ],
      ]).map((p) => p[0]),
    ).toEqual([
      "home",
      "point01",
      "point02",
      "point03",
      "point04",
      "point05",
      "point06",
      "point07",
      "point08",
      "point09",
      "point10",
      "point11",
      "point12",
      "point13",
      "point14",
      "point15",
      "point16",
      "point17",
      "point18",
      "point19",
      "point20",
      "point21",
      "point22",
      "point23",
      "point24",
      "point25",
      "point26",
      "point27",
      "point28",
      "point29",
      "down1",
      "down2",
      "down3",
      "down4",
      "down5",
      "down6",
    ]);

    expect(
      sortPresets([
        ...shuffle(typeSafeObjectEntries(presetsTestData1)),
        [
          "home",
          {
            description: "",
            image,
            position: { pan: -90, tilt: 0, zoom: 1 },
          },
        ],
      ]).map((p) => p[0]),
    ).toEqual([
      "home",
      "point26",
      "point27",
      "point28",
      "point29",
      "point01",
      "point02",
      "point03",
      "point04",
      "point05",
      "point06",
      "point07",
      "point08",
      "point09",
      "point10",
      "point11",
      "point12",
      "point13",
      "point14",
      "point15",
      "point16",
      "point17",
      "point18",
      "point19",
      "point20",
      "point21",
      "point22",
      "point23",
      "point24",
      "point25",
      "down6",
      "down1",
      "down2",
      "down3",
      "down4",
      "down5",
    ]);

    expect(
      sortPresets([
        ...shuffle(typeSafeObjectEntries(presetsTestData1)),
        [
          "home",
          {
            description: "",
            image,
            position: { pan: 90, tilt: 0, zoom: 1 },
          },
        ],
      ]).map((p) => p[0]),
    ).toEqual([
      "home",
      "point11",
      "point12",
      "point13",
      "point14",
      "point15",
      "point16",
      "point17",
      "point18",
      "point19",
      "point20",
      "point21",
      "point22",
      "point23",
      "point24",
      "point25",
      "point26",
      "point27",
      "point28",
      "point29",
      "point01",
      "point02",
      "point03",
      "point04",
      "point05",
      "point06",
      "point07",
      "point08",
      "point09",
      "point10",
      "down2",
      "down3",
      "down4",
      "down5",
      "down6",
      "down1",
    ]);
  });
});

const image = { height: 0, width: 0, src: "" } as const;
const presetsTestData1: Record<string, Preset> = {
  point01: {
    description: "",
    image,
    position: { pan: -178, tilt: -1, zoom: 200 },
  },
  point02: {
    description: "",
    image,
    position: { pan: -170, tilt: -2, zoom: 2000 },
  },
  point03: {
    description: "",
    image,
    position: { pan: -160, tilt: -20, zoom: 3000 },
  },
  point04: {
    description: "",
    image,
    position: { pan: -150, tilt: -2, zoom: 1 },
  },
  point05: {
    description: "",
    image,
    position: { pan: -145, tilt: -1.5, zoom: 1500 },
  },
  point06: {
    description: "",
    image,
    position: { pan: -140, tilt: -0.1, zoom: 8800 },
  },
  point07: {
    description: "",
    image,
    position: { pan: -130, tilt: -4, zoom: 7250 },
  },
  point08: {
    description: "",
    image,
    position: { pan: -120, tilt: -24, zoom: 1 },
  },
  point09: {
    description: "",
    image,
    position: { pan: -110, tilt: -14, zoom: 1000 },
  },
  point10: {
    description: "",
    image,
    position: { pan: -100, tilt: -1.3, zoom: 200 },
  },
  point11: {
    description: "",
    image,
    position: { pan: -90, tilt: -22, zoom: 1000 },
  },
  point12: {
    description: "",
    image,
    position: { pan: -80, tilt: -22, zoom: 1 },
  },
  point13: {
    description: "",
    image,
    position: { pan: -70, tilt: -12, zoom: 2200 },
  },
  point14: {
    description: "",
    image,
    position: { pan: -60, tilt: -1, zoom: 5503 },
  },
  point15: {
    description: "",
    image,
    position: { pan: -55, tilt: -1, zoom: 2000 },
  },
  point16: {
    description: "",
    image,
    position: { pan: -50, tilt: -1, zoom: 2000 },
  },
  point17: {
    description: "",
    image,
    position: { pan: -40, tilt: -3, zoom: 2000 },
  },
  point18: {
    description: "",
    image,
    position: { pan: -30, tilt: -9.5, zoom: 7000 },
  },
  point19: {
    description: "",
    image,
    position: { pan: -20, tilt: -2.5, zoom: 5000 },
  },
  point20: {
    description: "",
    image,
    position: { pan: -10, tilt: -2, zoom: 5000 },
  },
  point21: {
    description: "",
    image,
    position: { pan: 10, tilt: 2, zoom: 200 },
  },
  point22: {
    description: "",
    image,
    position: { pan: 30, tilt: -21, zoom: 1 },
  },
  point23: {
    description: "",
    image,
    position: { pan: 50, tilt: -2.2, zoom: 2000 },
  },
  point24: {
    description: "",
    image,
    position: { pan: 70, tilt: -9.2, zoom: 200 },
  },
  point25: {
    description: "",
    image,
    position: { pan: 90, tilt: -2.2, zoom: 2000 },
  },
  point26: {
    description: "",
    image,
    position: { pan: 120, tilt: -6.2, zoom: 100 },
  },
  point27: {
    description: "",
    image,
    position: { pan: 140, tilt: -2, zoom: 1000 },
  },
  point28: {
    description: "",
    image,
    position: { pan: 160, tilt: -15, zoom: 1 },
  },
  point29: {
    description: "",
    image,
    position: { pan: 179, tilt: -1, zoom: 1000 },
  },
  down1: {
    description: "",
    image,
    position: { pan: -170, tilt: -35, zoom: 1 },
  },
  down2: {
    description: "",
    image,
    position: { pan: -90, tilt: -45, zoom: 1 },
  },
  down3: {
    description: "",
    image,
    position: { pan: -10, tilt: -35, zoom: 1 },
  },
  down4: {
    description: "",
    image,
    position: { pan: 45, tilt: -38, zoom: 1 },
  },
  down5: {
    description: "",
    image,
    position: { pan: 90, tilt: -37, zoom: 1 },
  },
  down6: {
    description: "",
    image,
    position: { pan: 170, tilt: -47, zoom: 1 },
  },
};
