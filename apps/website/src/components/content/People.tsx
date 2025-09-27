import Image from "next/image";

import type { Person } from "@/data/staff";

import { classes } from "@/utils/classes";

import Heading from "./Heading";
import Link from "./Link";

type PeopleProps = {
  people: Record<string, Person>;
  columns?: 1 | 2;
  align?: "left" | "center";
  link?: boolean;
};

const imageClasses =
  "aspect-square h-auto w-full rounded-2xl bg-alveus-green object-cover";

const People = ({ people, columns = 1, align = "left", link }: PeopleProps) => (
  <ul
    className={classes(
      "flex flex-wrap",
      ...(columns === 1
        ? []
        : [
            "md:-m-4 md:items-start",
            align === "center" && "md:justify-center",
          ]),
    )}
  >
    {Object.entries(people).map(([key, person]) => (
      <li
        key={key}
        className={classes(
          "group flex basis-full flex-col",
          ...(columns === 1
            ? ["md:flex-row"]
            : [
                "md:basis-1/2 md:p-4",
                align === "center" && "items-center text-center",
              ]),
        )}
        tabIndex={-1}
      >
        <a id={key} className="scroll-mt-4" />
        <div
          className={classes(
            "my-auto w-full max-w-xs flex-shrink-0 p-4",
            align === "center" && "mx-auto",
          )}
        >
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
        <div
          className={classes(
            "my-auto flex-grow p-4",
            columns === 1 && align === "center" && "text-center",
          )}
        >
          <Heading level={2} className="mt-0 text-4xl">
            {link ? (
              <Link href={`#${key}`} custom>
                {person.name}
              </Link>
            ) : (
              person.name
            )}
          </Heading>
          <Heading level={3} className="text-xl">
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
