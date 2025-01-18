import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import type { PartialDateString } from "@alveusgg/data/src/types";

import { formatPartialDateString } from "@/utils/datetime";
import { classes } from "@/utils/classes";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";

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
    title: "H is for Hawk",
    author: "Helen Macdonald",
    image: hIsForHawk,
    month: "2025-01",
    link: "https://amzn.to/4a2ByGQ",
    thickness: thickness.xs,
    color: "border-black",
  },
  {
    title: "H is for Hawk",
    author: "Helen Macdonald",
    image: hIsForHawk,
    month: "2025-01",
    link: "https://amzn.to/4a2ByGQ",
    thickness: thickness.md,
    color: "border-black",
  },
  {
    title: "H is for Hawk",
    author: "Helen Macdonald",
    image: hIsForHawk,
    month: "2025-01",
    link: "https://amzn.to/4a2ByGQ",
    thickness: thickness.xl,
    color: "border-black",
  },
];

const Book = ({
  title,
  author,
  image,
  month,
  link,
  thickness,
  color,
}: BookInfo) => (
  <Disclosure as="div" className="w-64">
    <DisclosureButton className="group overflow-visible perspective-500 focus:outline-none">
      <div className="relative origin-[50%_40%] transition-all duration-1000 transform-style-3d group-data-[open]:mb-[-100%] group-data-[open]:-translate-y-1/4 group-data-[open]:translate-z-2 group-data-[open]:rotate-x-[85deg] group-data-[open]:scale3d-[0.70]">
        <div className="absolute right-3 top-0 z-20 h-16 overflow-hidden drop-shadow-md">
          <div className="relative -top-8 h-0 w-8 bg-alveus-green transition-all group-hover:h-full group-focus:h-full">
            <div className="absolute top-full border-0 border-b-[2rem] border-l-[2rem] border-solid border-y-transparent border-l-alveus-green" />
            <div className="absolute top-full border-0 border-b-[2rem] border-r-[2rem] border-solid border-y-transparent border-r-alveus-green" />
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 z-10 h-64 max-h-full bg-gradient-to-b from-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100" />
        <Image
          src={image}
          alt={`${title} by ${author}`}
          className="aspect-book h-auto w-full rounded-xl object-cover transition-transform duration-1000 group-data-[open]:translate-x-0.5 group-data-[open]:-translate-z-0.5"
        />
        <div
          className={classes(
            "w-full origin-top rounded-l-xl rounded-r-sm border-4 border-r-0 border-solid bg-white transition-transform duration-1000 -translate-y-0.5 rotate-x-90 scale-x-95 group-data-[open]:scale-x-100",
            thickness,
            color,
          )}
        />
      </div>
    </DisclosureButton>

    <p>{formatPartialDateString(month)}</p>

    <DisclosurePanel>
      <Heading>{title}</Heading>
      <p>{author}</p>

      <Link href={link}>Buy</Link>
    </DisclosurePanel>
  </Disclosure>
);

const BookClubPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Book Club"
        description="Join the staff at Alveus and the community in reading and discussing a book together each month."
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
              together in a livestream chat to discuss the book.
            </p>
          </div>

          {/* <Image
            src={}
            width={576}
            alt=""
            className="mx-auto w-full max-w-xl p-4 pt-8 md:mx-0 md:w-2/5 md:pt-4"
          /> */}
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-40 select-none drop-shadow-md lg:block 2xl:-bottom-48 2xl:max-w-48"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-60 right-0 z-10 hidden h-auto w-1/2 max-w-40 select-none drop-shadow-md lg:block 2xl:-bottom-64 2xl:max-w-48"
        />

        <Section
          className="grow pt-8"
          containerClassName="flex flex-row gap-8 overflow-x-auto overflow-y-clip"
        >
          {books.map((book) => (
            <Book key={book.title} {...book} />
          ))}
        </Section>
      </div>
    </>
  );
};

export default BookClubPage;
