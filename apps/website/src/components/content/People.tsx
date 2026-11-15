import Image, { type ImageProps } from "next/image";
import { type ReactNode } from "react";

import { classes } from "@/utils/classes";

import Heading from "./Heading";
import Link from "./Link";

export interface Person {
  image: ImageProps["src"] | [ImageProps["src"], ImageProps["src"]];
  name: string;
  pronouns?: string;
  title: ReactNode;
  description: ReactNode;
}

type PeopleProps = {
  people: Record<string, Person>;
  link?: boolean;
};

const imageClasses =
  "aspect-square h-auto w-full rounded-2xl bg-alveus-green object-cover";

const People = ({ people, link }: PeopleProps) => (
  <ul className="flex flex-wrap">
    {Object.entries(people).map(([key, person]) => (
      <li
        key={key}
        className="group flex basis-full flex-col md:flex-row"
        tabIndex={-1}
      >
        <a id={key} className="scroll-mt-4" />
        <div className="my-auto w-full max-w-xs shrink-0 p-4">
          <div className="relative aspect-square h-auto w-full overflow-clip rounded-2xl">
            {Array.isArray(person.image) ? (
              <>
                <Image
                  src={person.image[1]}
                  width={320}
                  alt=""
                  className={imageClasses}
                />
                <Image
                  src={person.image[0]}
                  width={320}
                  alt=""
                  className={classes(
                    imageClasses,
                    "absolute inset-x-0 top-0 drop-shadow-[0_-10px_15px_rgba(0,0,0,0.2)] transition-[top] duration-500 group-hover:top-[90%] group-hover:duration-1000 group-focus:top-[90%] group-focus:duration-1000",
                  )}
                />
              </>
            ) : (
              <Image
                src={person.image}
                width={320}
                alt=""
                className={imageClasses}
              />
            )}

            <div className="absolute inset-0 rounded-2xl border-4 border-alveus-green/75" />
          </div>
        </div>
        <div className="my-auto grow p-4">
          <Heading
            level={3}
            className={classes("mt-0 text-4xl", person.pronouns && "text-wrap")}
          >
            {link ? (
              <Link href={`#${key}`} custom>
                {person.name}
              </Link>
            ) : (
              person.name
            )}
            {person.pronouns && (
              <small className="text-xl text-gray-500">{` (${person.pronouns})`}</small>
            )}
          </Heading>
          <Heading level={4} className="text-xl">
            {person.title}
          </Heading>
          <div className="flex flex-col gap-4 text-gray-500">
            {person.description}
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default People;
