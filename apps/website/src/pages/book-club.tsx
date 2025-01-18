import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
import type { PartialDateString } from "@alveusgg/data/src/types";

import { formatPartialDateString } from "@/utils/datetime";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";

import hIsForHawk from "@/assets/books/h-is-for-hawk.jpg";

import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";

type BookInfo = {
  title: string;
  author: string;
  image: StaticImageData;
  month: PartialDateString & `${number}-${number}`;
  link: string;
};

const books: BookInfo[] = [
  {
    title: "H is for Hawk",
    author: "Helen Macdonald",
    image: hIsForHawk,
    month: "2025-01",
    link: "https://amzn.to/4a2ByGQ",
  },
];

const Book = ({ title, author, image, month, link }: BookInfo) => (
  <div className="w-64">
    <Image
      src={image}
      alt=""
      className="aspect-book h-auto w-full rounded-xl object-cover"
    />

    <Heading>{title}</Heading>
    <p>{author}</p>
    <p>{formatPartialDateString(month)}</p>
    <Link href={link}>Buy</Link>
  </div>
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

        <Section className="grow pt-8">
          {books.map((book) => (
            <Book key={book.title} {...book} />
          ))}
        </Section>
      </div>
    </>
  );
};

export default BookClubPage;
