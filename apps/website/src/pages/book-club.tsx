import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import type { PartialDateString } from "@alveusgg/data/build/types";

import { formatPartialDateString } from "@/utils/datetime";
import { classes } from "@/utils/classes";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Button from "@/components/content/Button";
import TransitionHeight from "@/components/content/TransitionHeight";

import bookClubLogo from "@/assets/book-club/logo.png";
import bookClubFull from "@/assets/book-club/full.png";

import aMostRemarkableCreature from "@/assets/books/a-most-remarkable-creature.jpg";
import hIsForHawk from "@/assets/books/h-is-for-hawk.jpg";

import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";

const thickness = {
  xs: "h-6 -translate-z-6 -mb-6",
  sm: "h-8 -translate-z-8 -mb-8",
  md: "h-10 -translate-z-10 -mb-10",
  lg: "h-12 -translate-z-12 -mb-12",
  xl: "h-14 -translate-z-14 -mb-14",
};

type BookInfo = {
  title: string;
  author: string;
  image: StaticImageData;
  month: PartialDateString & `${number}-${number}`;
  link: string;
  thickness: (typeof thickness)[keyof typeof thickness];
  color: `border-${string}`;
};

const books: BookInfo[] = [
  {
    title: "A Most Remarkable Creature",
    author: "Jonathan Meiburg",
    image: aMostRemarkableCreature,
    month: "2025-02",
    link: "https://amzn.to/410hD8x",
    thickness: thickness.lg,
    color: "border-alveus-tan-200/75",
  },
  {
    title: "H is for Hawk",
    author: "Helen Macdonald",
    image: hIsForHawk,
    month: "2025-01",
    link: "https://amzn.to/4a2ByGQ",
    thickness: thickness.sm,
    color: "border-black",
  },
];

type CoverInfo = Pick<BookInfo, "title" | "author" | "image"> & {
  width?: number;
};

const Cover = ({
  title,
  author,
  image,
  width,
  className,
}: (CoverInfo | Partial<Record<keyof CoverInfo, undefined>>) & {
  className?: string;
}) => (
  <div
    className={classes(
      "relative aspect-2/3 h-auto w-full rounded-l-sm rounded-r-xl bg-alveus-green-900 drop-shadow-lg",
      className,
    )}
  >
    {/* Bookmark (hover) */}
    <div className="absolute right-3 top-0 z-20 h-16 overflow-hidden drop-shadow-md">
      <div className="relative -top-8 h-0 w-8 bg-alveus-green transition-all group-hover:h-full group-focus:h-full">
        <div className="absolute top-full border-0 border-b-[2rem] border-l-[2rem] border-solid border-y-transparent border-l-alveus-green" />
        <div className="absolute top-full border-0 border-b-[2rem] border-r-[2rem] border-solid border-y-transparent border-r-alveus-green" />
      </div>
    </div>

    {/* Shine (hover) */}
    <div className="absolute inset-x-0 top-0 z-10 h-64 max-h-full bg-gradient-to-b from-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100" />

    {/* Crease */}
    <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/10 via-black/10 to-white/30" />
    <div className="absolute inset-y-0 left-1.5 w-1.5 bg-gradient-to-r from-white/30 to-white/0" />
    <div className="absolute inset-y-0 left-2.5 w-1.5 bg-gradient-to-r from-black/0 via-black/10 to-white/10" />
    <div className="absolute inset-y-0 left-4 w-1.5 bg-gradient-to-r from-white/10 via-white/30 to-white/0" />

    {/* Edges */}
    <div className="absolute left-5 right-0 top-0 h-2 bg-gradient-to-b from-white/20 to-white/0" />
    <div className="absolute bottom-0 left-5 right-0 h-2 bg-gradient-to-t from-white/20 to-white/0" />
    <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-white/20 to-white/0" />

    {image && (
      <Image
        src={image}
        alt={`${title} by ${author}`}
        width={width}
        className="size-full rounded-l-sm rounded-r-xl object-cover"
      />
    )}
  </div>
);

const Book = ({
  title,
  author,
  image,
  month,
  link,
  thickness,
  color,
  width,
  className,
}: BookInfo & { width?: number; className?: string }) => (
  <Disclosure as="div" className={className}>
    {({ open }) => (
      <>
        <DisclosureButton className="group overflow-visible text-start perspective-normal focus:outline-none">
          <div className="origin-[50%_40%] transition-all duration-1000 transform-3d group-data-[open]:mb-[-100%] group-data-[open]:-translate-y-1/4 group-data-[open]:translate-z-2 group-data-[open]:rotate-x-[85deg] group-data-[open]:scale-3d group-data-[open]:scale-70">
            <Cover
              title={title}
              author={author}
              image={image}
              width={width}
              className="transition-transform duration-1000 group-data-[open]:translate-x-1 group-data-[open]:-translate-z-0.5"
            />
            <div
              className={classes(
                "w-full origin-top rounded-l-xl rounded-r-xs border-4 border-r-0 border-solid bg-gradient-to-b from-alveus-tan-50 via-gray-100 to-alveus-tan-50 transition-transform duration-1000 -translate-y-0.5 rotate-x-90 scale-x-95 group-data-[open]:scale-x-100",
                thickness,
                color,
              )}
            />
          </div>

          <Heading
            level={2}
            className="relative mb-0 mt-4 transition-[color,font-size,line-height] duration-[150ms,1000ms,1000ms] group-hover:group-[&:not([data-open])]:text-alveus-green-700 group-focus:group-[&:not([data-open])]:text-alveus-green-700 group-data-[open]:text-lg"
          >
            <div className="absolute -top-1 left-0 h-1 w-16 bg-alveus-green/50" />
            {formatPartialDateString(month)}
          </Heading>
        </DisclosureButton>

        <TransitionHeight
          show={open}
          enter="duration-500 delay-500"
          leave="duration-500"
        >
          <DisclosurePanel static>
            <Heading level={3} className="my-0">
              {title}
            </Heading>
            <p>
              <span className="text-sm opacity-50">by </span>
              {author}
            </p>

            <Button href={link} className="mt-8" external>
              Buy on Amazon.com
            </Button>
          </DisclosurePanel>
        </TransitionHeight>
      </>
    )}
  </Disclosure>
);

const BookClubPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Book Club"
        description="Join the staff at Alveus and the community in reading and discussing a book together each month."
        image={bookClubFull.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-10 left-0 z-30 hidden h-auto w-1/2 max-w-36 select-none drop-shadow-md rotate-[20deg] -scale-y-100 lg:block"
        />

        <Section
          dark
          className="py-0"
          containerClassName="flex flex-wrap-reverse items-center justify-between"
        >
          <div className="w-full pb-16 pt-4 md:w-3/5 md:py-24">
            <Heading>Alveus Book Club</Heading>
            <p className="text-lg">
              Join the staff at Alveus and the community in reading a book
              together each month. At the end of each month we&apos;ll all meet
              together in a livestream chat to discuss the book. Head to your
              local library or bookstore to pick up a copy of the book, or use
              the links below to purchase a copy online. If reading isn&apos;t
              your thing, we also encourage listening to the audiobook version
              each month.
            </p>
          </div>

          <Image
            src={bookClubLogo}
            width={576}
            alt=""
            className="mx-auto w-full max-w-xl md:mx-0 md:w-2/5"
          />
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-32 select-none drop-shadow-md lg:block 2xl:-bottom-48 2xl:max-w-40"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-60 right-0 z-10 hidden h-auto w-1/2 max-w-40 select-none drop-shadow-md lg:block 2xl:-bottom-64 2xl:max-w-48"
        />

        <Section className="grow">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {books.map((book) => (
              <Book
                key={book.title}
                {...book}
                width={256}
                className="mx-auto w-64"
              />
            ))}

            {/* Pad with placeholders to a multiple of 4 */}
            {Array.from({ length: (4 - (books.length % 4)) % 4 }).map(
              (_, i) => (
                <div
                  key={i}
                  className={classes(
                    "group mx-auto hidden w-64",
                    // If we're not the first placeholder, we're for desktop only
                    i > 0 ? "xl:block" : "md:block",
                  )}
                >
                  <Cover />
                </div>
              ),
            )}
          </div>

          <p className="mt-16 text-center text-xs italic text-alveus-green">
            Amazon.com links provided are affiliate links. Purchases made
            through these links help support Alveus Sanctuary.
          </p>
        </Section>
      </div>
    </>
  );
};

export default BookClubPage;
