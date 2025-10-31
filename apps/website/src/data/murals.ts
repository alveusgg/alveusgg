interface Grid {
  columns: number;
  rows: number;
  size: number;
  squares: Record<string, string>;
}

interface CoreMural {
  name: string;
  description: string;
}

interface StaticMural extends CoreMural {
  type: "static";
  grid: Promise<Grid>;
}

interface LiveMural extends CoreMural {
  type: "live";
}

type Mural = StaticMural | LiveMural;

const gridCache: Record<string, Promise<Grid>> = {};

const murals = {
  one: {
    name: "Pixel Project",
    description:
      "Explore the institute mural featuring 10,000 pixels unlocked by generous donors, raising $1,000,000 to fund the initial development of the Alveus Research & Recovery Institute.",
    type: "static",
    get grid() {
      return (gridCache["one"] ??= import("@/data/pixel-project-grid.json"));
    },
  },
  two: {
    name: "Pixel Project 2",
    description:
      "We're bringing the Pixel Project back with a brand new mural! If you didn't get a chance to claim a pixel the first time around, we need your help to unlock another 10,000 pixels to further support the Alveus Research & Recovery Institute.",
    type: "live",
  },
} satisfies Record<string, Mural>;

export type MuralId = keyof typeof murals;
export const isMuralId = (value: unknown): value is MuralId =>
  typeof value === "string" && value in murals;

export default murals;
