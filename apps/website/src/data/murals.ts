interface Grid {
  columns: number;
  rows: number;
  size: number;
  squares: Record<string, string>;
}

interface CoreMural {
  name: string;
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
    type: "static",
    get grid() {
      return (gridCache["one"] ??= import("@/data/pixel-project-grid.json"));
    },
  },
  two: {
    name: "Pixel Project 2",
    type: "live",
  },
} satisfies Record<string, Mural>;

export type MuralId = keyof typeof murals;
export const isMuralId = (value: unknown): value is MuralId =>
  typeof value === "string" && value in murals;

export default murals;
