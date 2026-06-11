import type { StaticImageData } from "next/image";

import tree1Image from "@/assets/donor-trees/1.webp";
import tree2Image from "@/assets/donor-trees/2.webp";
import tree3Image from "@/assets/donor-trees/3.webp";
import tree4Image from "@/assets/donor-trees/4.webp";
import tree5Image from "@/assets/donor-trees/5.webp";
import tree6Image from "@/assets/donor-trees/6.webp";

import tree1Annotations from "./donor-trees/1.json";
import tree2Annotations from "./donor-trees/2.json";
import tree3Annotations from "./donor-trees/3.json";
import tree4Annotations from "./donor-trees/4.json";
import tree5Annotations from "./donor-trees/5.json";
import tree6Annotations from "./donor-trees/6.json";

export type TreeAnnotation = {
  box: [number, number, number, number]; // [x1, y1, x2, y2] in image pixels
  name: string;
};

export type DonorTree = {
  id: number;
  image: StaticImageData;
  annotations: TreeAnnotation[];
};

export const DONOR_TREES: DonorTree[] = [
  {
    id: 1,
    image: tree1Image,
    annotations: tree1Annotations as TreeAnnotation[],
  },
  {
    id: 2,
    image: tree2Image,
    annotations: tree2Annotations as TreeAnnotation[],
  },
  {
    id: 3,
    image: tree3Image,
    annotations: tree3Annotations as TreeAnnotation[],
  },
  {
    id: 4,
    image: tree4Image,
    annotations: tree4Annotations as TreeAnnotation[],
  },
  {
    id: 5,
    image: tree5Image,
    annotations: tree5Annotations as TreeAnnotation[],
  },
  {
    id: 6,
    image: tree6Image,
    annotations: tree6Annotations as TreeAnnotation[],
  },
];

// All donor names, derived from the tree annotations, sorted for the search
// dropdown. Every name in this list is guaranteed to be findable on a tree.
export const DONOR_NAMES: string[] = [
  ...new Set(
    DONOR_TREES.flatMap((tree) => tree.annotations.map((a) => a.name)),
  ),
].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
