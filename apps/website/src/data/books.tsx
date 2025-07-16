import { type StaticImageData } from "next/image";

import type { PartialDateString } from "@alveusgg/data/build/types";

import aMostRemarkableCreature from "@/assets/book-club/books/a-most-remarkable-creature.jpg";
import adventuresOfAYoungNaturalist from "@/assets/book-club/books/adventures-of-a-young-naturalist.jpg";
import hIsForHawk from "@/assets/book-club/books/h-is-for-hawk.jpg";
import theAnthropoceneReviewed from "@/assets/book-club/books/the-anthropocene-reviewed.jpg";
import theLastRhinos from "@/assets/book-club/books/the-last-rhinos.jpg";

const thickness = {
  xs: "h-6 -translate-z-6 -mb-6",
  sm: "h-8 -translate-z-8 -mb-8",
  md: "h-10 -translate-z-10 -mb-10",
  lg: "h-12 -translate-z-12 -mb-12",
  xl: "h-14 -translate-z-14 -mb-14",
};

export type BookInfo = {
  title: string;
  author: string;
  image: StaticImageData;
  month: PartialDateString & `${number}-${number}`;
  link: string;
  thickness: (typeof thickness)[keyof typeof thickness];
  color: `border-${string}`;
  vodId?: string;
};

const books: BookInfo[] = [
  {
    title: "The Anthropocene Reviewed",
    author: "John Green",
    image: theAnthropoceneReviewed,
    month: "2025-05",
    link: "https://amzn.to/42LpJSo",
    thickness: thickness.sm, // 300 pages
    color: "border-black",
  },
  {
    title: "The Last Rhinos",
    author: "Lawrence Anthony",
    image: theLastRhinos,
    month: "2025-04",
    link: "https://amzn.to/3YibG59",
    thickness: thickness.md, // 360 pages
    color: "border-alveus-tan-900",
  },
  {
    title: "Adventures of a Young Naturalist",
    author: "Sir David Attenborough",
    image: adventuresOfAYoungNaturalist,
    month: "2025-03",
    link: "https://amzn.to/41qA2um",
    thickness: thickness.lg, // 400 pages
    color: "border-blue-900",
    vodId: "fRjxSfOhk94",
  },
  {
    title: "A Most Remarkable Creature",
    author: "Jonathan Meiburg",
    image: aMostRemarkableCreature,
    month: "2025-02",
    link: "https://amzn.to/410hD8x",
    thickness: thickness.lg, // 400 pages
    color: "border-alveus-tan-200/75",
    vodId: "AH0mwSckVns",
  },
  {
    title: "H is for Hawk",
    author: "Helen Macdonald",
    image: hIsForHawk,
    month: "2025-01",
    link: "https://amzn.to/4a2ByGQ",
    thickness: thickness.sm, // 320 pages
    color: "border-black",
    vodId: "EfCksCFlq84",
  },
];

export default books;
