import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
import { type ReactNode, useState } from "react";

import { classes } from "@/utils/classes";
import {
  type PartialDateString,
  formatPartialDateString,
} from "@/utils/datetime-partial";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import TransitionHeight from "@/components/content/TransitionHeight";
import { YouTubeEmbed } from "@/components/content/YouTube";

import IconExternal from "@/icons/IconExternal";
import IconYouTube from "@/icons/IconYouTube";

import aMostRemarkableCreature from "@/assets/book-club/books/a-most-remarkable-creature.jpg";
import adventuresOfAYoungNaturalist from "@/assets/book-club/books/adventures-of-a-young-naturalist.jpg";
import hIsForHawk from "@/assets/book-club/books/h-is-for-hawk.jpg";
import onTheWing from "@/assets/book-club/books/on-the-wing.jpg";
import steveAndMe from "@/assets/book-club/books/steve-and-me.jpg";
import theAnthropoceneReviewed from "@/assets/book-club/books/the-anthropocene-reviewed.jpg";
import theInsectCrisis from "@/assets/book-club/books/the-insect-crisis.jpg";
import theLastRhinos from "@/assets/book-club/books/the-last-rhinos.jpg";
import whySharksMatter from "@/assets/book-club/books/why-sharks-matter.jpg";
import bookClubFull from "@/assets/book-club/full.png";
import bookClubLogo from "@/assets/book-club/logo.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

const thickness = {
  xs: "h-6 -translate-z-6 -mb-6",
  sm: "h-8 -translate-z-8 -mb-8",
  md: "h-10 -translate-z-10 -mb-10",
  lg: "h-12 -translate-z-12 -mb-12",
  xl: "h-14 -translate-z-14 -mb-14",
};

type Month = PartialDateString & `${number}-${number}`;

type BookInfo = {
  title: string;
  author: string;
  image: StaticImageData;
  month: Month[];
  link: string;
  thickness: (typeof thickness)[keyof typeof thickness];
  color: `border-${string}`;
  vodId?: string;
};

const books: BookInfo[] = [
  {
    title: "On the Wing",
    author: "David E. Alexander",
    image: onTheWing,
    month: ["2025-10"],
    link: "https://amzn.to/3KrRFVS",
    thickness: thickness.xs, // 230 pages
    color: "border-red-700",
  },
  {
    title: "Why Sharks Matter",
    author: "David Shiffman",
    image: whySharksMatter,
    month: ["2025-09"],
    link: "https://amzn.to/4fS8THm",
    thickness: thickness.md, // 310 pages
    color: "border-blue-800",
  },
  {
    title: "Steve & Me",
    author: "Terri Irwin",
    image: steveAndMe,
    month: ["2025-08"],
    link: "https://amzn.to/4moWrRz",
    thickness: thickness.sm, // 290 pages
    color: "border-black",
  },
  {
    title: "The Insect Crisis",
    author: "Oliver Milman",
    image: theInsectCrisis,
    month: ["2025-06", "2025-07"],
    link: "https://amzn.to/4kZ31gL",
    thickness: thickness.sm, // 270 pages
    color: "border-yellow-400",
    vodId: "X2M4FjTqxiA",
  },
  {
    title: "The Anthropocene Reviewed",
    author: "John Green",
    image: theAnthropoceneReviewed,
    month: ["2025-05"],
    link: "https://amzn.to/42LpJSo",
    thickness: thickness.sm, // 300 pages
    color: "border-black",
    vodId: "tpRWhSPuHlQ",
  },
  {
    title: "The Last Rhinos",
    author: "Lawrence Anthony",
    image: theLastRhinos,
    month: ["2025-04"],
    link: "https://amzn.to/3YibG59",
    thickness: thickness.md, // 360 pages
    color: "border-alveus-tan-900",
    vodId: "Kkerq_KvYrI",
  },
  {
    title: "Adventures of a Young Naturalist",
    author: "Sir David Attenborough",
    image: adventuresOfAYoungNaturalist,
    month: ["2025-03"],
    link: "https://amzn.to/41qA2um",
    thickness: thickness.lg, // 400 pages
    color: "border-blue-900",
    vodId: "fRjxSfOhk94",
  },
  {
    title: "A Most Remarkable Creature",
    author: "Jonathan Meiburg",
    image: aMostRemarkableCreature,
    month: ["2025-02"],
    link: "https://amzn.to/410hD8x",
    thickness: thickness.lg, // 400 pages
    color: "border-alveus-tan-200/75",
    vodId: "AH0mwSckVns",
  },
  {
    title: "H is for Hawk",
    author: "Helen Macdonald",
    image: hIsForHawk,
    month: ["2025-01"],
    link: "https://amzn.to/4a2ByGQ",
    thickness: thickness.sm, // 320 pages
    color: "border-black",
    vodId: "EfCksCFlq84",
  },
];

const formatMonths = (months: Month[]) =>
  [...months]
    .reverse()
    .reduce((formattedMonths, month) => {
      const [formattedMonth, formattedYear] = formatPartialDateString(
        month,
      ).split(" ") as [string, string];

      // If the year is the same as the previous month, just return the month
      if (formattedMonths[0]?.includes(formattedYear)) {
        return [formattedMonth, ...formattedMonths];
      }

      // Otherwise, return the month and year
      return [`${formattedMonth} ${formattedYear}`, ...formattedMonths];
    }, [] as string[])
    .join(" + ");

const lightboxItems = books.reduce<Record<string, ReactNode>>(
  (acc, book) =>
    book.vodId
      ? {
          ...acc,
          [book.vodId]: (
            <YouTubeEmbed
              videoId={book.vodId}
              caption={`${book.title} | ${formatMonths(book.month)}`}
            />
          ),
        }
      : acc,
  {},
);

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
      "relative aspect-2/3 h-auto w-full overflow-hidden rounded-l-sm rounded-r-xl bg-alveus-green-900 drop-shadow-lg",
      className,
    )}
  >
    {/* Bookmark (hover) */}
    <div className="absolute top-0 right-3 z-20 h-16 w-8 -translate-y-full transition-transform group-hover:translate-y-0 group-focus:translate-y-0">
      <div className="opacity-0 drop-shadow-md drop-shadow-black/50 transition-opacity delay-(--default-transition-duration) duration-0 group-hover:opacity-100 group-hover:delay-0 group-focus:opacity-100 group-focus:delay-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2 4"
          className="h-full w-auto fill-alveus-green stroke-white/25"
        >
          <path d="M0 0 0 4 1 3 2 4 2 0" strokeWidth={0.2} />
        </svg>
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
    <div className="absolute top-0 right-0 left-5 h-2 bg-gradient-to-b from-white/20 to-white/0" />
    <div className="absolute right-0 bottom-0 left-5 h-2 bg-gradient-to-t from-white/20 to-white/0" />
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
  vodId,
  lightbox,
  width,
  className,
}: BookInfo & {
  lightbox: (id: string) => void;
  width?: number;
  className?: string;
}) => (
  <Disclosure as="div" className={className}>
    {({ open }) => (
      <>
        <DisclosureButton className="group w-full overflow-visible text-start perspective-normal focus:outline-hidden">
          <div className="origin-[50%_40%] transition-all duration-1000 transform-3d group-data-[open]:mb-[-100%] group-data-[open]:-translate-y-1/4 group-data-[open]:translate-z-2 group-data-[open]:scale-70 group-data-[open]:scale-3d group-data-[open]:rotate-x-[85deg]">
            <Cover
              title={title}
              author={author}
              image={image}
              width={width}
              className="transition-transform duration-1000 group-data-[open]:translate-x-1 group-data-[open]:-translate-z-0.5"
            />
            <div
              className={classes(
                "w-full origin-top -translate-y-0.5 scale-x-95 rotate-x-90 rounded-l-xl rounded-r-xs border-4 border-r-0 border-solid bg-gradient-to-b from-alveus-tan-50 via-gray-100 to-alveus-tan-50 transition-transform duration-1000 group-data-[open]:scale-x-100",
                thickness,
                color,
              )}
            />
          </div>

          <Heading
            level={2}
            className="relative mt-4 mb-0 transition-[color,font-size,line-height] duration-[150ms,1000ms,1000ms] group-data-[open]:text-lg group-hover:group-[&:not([data-open])]:text-alveus-green-700 group-focus:group-[&:not([data-open])]:text-alveus-green-700"
          >
            <div className="absolute -top-1 left-0 h-1 w-16 bg-alveus-green/50" />
            {formatMonths(month)}
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

            <Button
              href={link}
              className="mt-8 flex items-center justify-between gap-2"
              external
            >
              Buy on Amazon.com
              <IconExternal size="1em" />
            </Button>

            {vodId && (
              <Button
                href={`https://www.youtube.com/watch?v=${vodId}`}
                external
                onClick={(e: MouseEvent) => {
                  e.preventDefault();
                  lightbox(vodId);
                }}
                className="mt-2 flex items-center justify-between gap-2"
              >
                Re-Watch the Meeting
                <IconYouTube size="1em" />
              </Button>
            )}
          </DisclosurePanel>
        </TransitionHeight>
      </>
    )}
  </Disclosure>
);

const BookClubPage: NextPage = () => {
  const [lightboxOpen, setLightboxOpen] = useState<string>();

  return (
    <>
      <Meta
        title="Book Club"
        description="Join the staff at Alveus and the community in reading and discussing books together."
        image={bookClubFull.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-10 left-0 z-10 hidden h-auto w-1/2 max-w-36 -scale-y-100 rotate-[20deg] drop-shadow-md select-none lg:block"
        />

        <Section
          dark
          className="py-0"
          containerClassName="flex flex-wrap-reverse items-center justify-between"
        >
          <div className="w-full pt-4 pb-16 md:w-3/5 md:py-24">
            <Heading>Alveus Book Club</Heading>
            <p className="text-lg">
              Join the staff at Alveus and the community in reading books
              together! Every other month we&apos;ll all meet together in a{" "}
              <Link href="/live" external dark>
                livestream chat
              </Link>{" "}
              to discuss the most recent book. Head to your local library or
              bookstore to pick up a copy of the book, or use the links below to
              purchase a copy online. If reading isn&apos;t your thing, we also
              encourage listening to the audiobook version of each book.
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
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-32 drop-shadow-md select-none lg:block 2xl:-bottom-48 2xl:max-w-40"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-60 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-bottom-64 2xl:max-w-48"
        />

        <Section className="grow">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {books.map((book) => (
              <Book
                key={book.title}
                {...book}
                lightbox={setLightboxOpen}
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
                    // If we have an even number of books, show on desktop only
                    // Otherwise, show on desktop except the first which is shown on tablet
                    books.length % 2 === 0 || i > 0 ? "xl:block" : "md:block",
                  )}
                >
                  <Cover />
                </div>
              ),
            )}
          </div>

          <Lightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(undefined)}
            items={lightboxItems}
          />

          <p className="mt-16 text-center text-xs text-alveus-green italic">
            Amazon.com links provided are affiliate links. Purchases made
            through these links help support Alveus Sanctuary.
          </p>
        </Section>
      </div>
    </>
  );
};

export default BookClubPage;
