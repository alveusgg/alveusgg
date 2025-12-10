import { type StaticImageData } from "next/image";

import { type PartialDateString } from "@/utils/datetime-partial";

import aMostRemarkableCreature from "@/assets/book-club/books/a-most-remarkable-creature.jpg";
import adventuresOfAYoungNaturalist from "@/assets/book-club/books/adventures-of-a-young-naturalist.jpg";
import hIsForHawk from "@/assets/book-club/books/h-is-for-hawk.jpg";
import livingWithLynx from "@/assets/book-club/books/living-with-lynx.jpg";
import onTheWing from "@/assets/book-club/books/on-the-wing.jpg";
import steveAndMe from "@/assets/book-club/books/steve-and-me.jpg";
import theAnthropoceneReviewed from "@/assets/book-club/books/the-anthropocene-reviewed.jpg";
import theInsectCrisis from "@/assets/book-club/books/the-insect-crisis.jpg";
import theLastRhinos from "@/assets/book-club/books/the-last-rhinos.jpg";
import whySharksMatter from "@/assets/book-club/books/why-sharks-matter.jpg";

const thickness = {
  xs: "h-6 -translate-z-6 -mb-6",
  sm: "h-8 -translate-z-8 -mb-8",
  md: "h-10 -translate-z-10 -mb-10",
  lg: "h-12 -translate-z-12 -mb-12",
  xl: "h-14 -translate-z-14 -mb-14",
};

export type Month = PartialDateString & `${number}-${number}`;

export type BookInfo = {
  title: string;
  author: string;
  image: StaticImageData;
  month: Month;
  link: string;
  thickness: (typeof thickness)[keyof typeof thickness];
  color: `border-${string}`;
  vodId?: string;
};

const books: [BookInfo, ...BookInfo[]] = [
  {
    title: "Living with Lynx",
    author: "Jonny Hanson",
    image: livingWithLynx,
    month: "2025-12",
    link: "https://amzn.to/48Le5cT",
    thickness: thickness.sm, // 280 pages
    color: "border-gray-200",
  },
  // no 2025-11 book
  {
    title: "On the Wing",
    author: "David E. Alexander",
    image: onTheWing,
    month: "2025-10",
    link: "https://amzn.to/3KrRFVS",
    thickness: thickness.xs, // 230 pages
    color: "border-red-700",
  },
  {
    title: "Why Sharks Matter",
    author: "David Shiffman",
    image: whySharksMatter,
    month: "2025-09",
    link: "https://amzn.to/4fS8THm",
    thickness: thickness.md, // 310 pages
    color: "border-blue-800",
  },
  {
    title: "Steve & Me",
    author: "Terri Irwin",
    image: steveAndMe,
    month: "2025-08",
    link: "https://amzn.to/4moWrRz",
    thickness: thickness.sm, // 290 pages
    color: "border-black",
  },
  // no 2025-07 book
  {
    title: "The Insect Crisis",
    author: "Oliver Milman",
    image: theInsectCrisis,
    month: "2025-06",
    link: "https://amzn.to/4kZ31gL",
    thickness: thickness.sm, // 270 pages
    color: "border-yellow-400",
    vodId: "X2M4FjTqxiA",
  },
  {
    title: "The Anthropocene Reviewed",
    author: "John Green",
    image: theAnthropoceneReviewed,
    month: "2025-05",
    link: "https://amzn.to/42LpJSo",
    thickness: thickness.sm, // 300 pages
    color: "border-black",
    vodId: "tpRWhSPuHlQ",
  },
  {
    title: "The Last Rhinos",
    author: "Lawrence Anthony",
    image: theLastRhinos,
    month: "2025-04",
    link: "https://amzn.to/3YibG59",
    thickness: thickness.md, // 360 pages
    color: "border-alveus-tan-900",
    vodId: "Kkerq_KvYrI",
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
