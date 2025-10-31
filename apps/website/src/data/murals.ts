import muralV1Grid from "@/data/pixel-project-grid.json";

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
  grid: Grid;
}

interface LiveMural extends CoreMural {
  type: "live";
}

type Mural = StaticMural | LiveMural;

const murals = {
  one: {
    name: "Pixel Project",
    type: "static",
    grid: muralV1Grid as Grid,
  },
  two: {
    name: "Pixel Project 2",
    type: "live",
  },
} satisfies Record<string, Mural>;

export type MuralId = keyof typeof murals;
export default murals;
