import React from "react";
import Image, { type ImageProps } from "next/image";
import Heading from "./Heading";

type PeopleProps = {
  people: Record<
    string,
    {
      image: ImageProps["src"];
      name: string;
      title: string;
      description: React.ReactNode;
    }
  >;
  sideBySide?: boolean;
};

const People: React.FC<PeopleProps> = ({ people, sideBySide = false }) => (
  <ul
    className={`flex flex-wrap ${
      sideBySide ? "md:items-start md:justify-center" : ""
    }`}
  >
    {Object.entries(people).map(([key, person]) => (
      <li
        key={key}
        className={`flex basis-full flex-col items-center text-center ${
          sideBySide ? "md:basis-1/2" : "md:flex-row md:text-left"
        }`}
      >
        <div
          className={`mx-auto w-full max-w-sm flex-shrink-0 p-4 ${
            sideBySide ? "" : "md:w-1/3 md:max-w-md"
          }`}
        >
          <Image
            src={person.image}
            alt=""
            className="aspect-square h-auto w-full rounded-2xl object-cover"
          />
        </div>
        <div className={`flex-grow p-4 ${sideBySide ? "" : "md:w-2/3"}`}>
          <Heading level={2} className="text-4xl">
            {person.name}
          </Heading>
          <Heading level={3} className="text-xl">
            {person.title}
          </Heading>
          <div className="text-gray-500">{person.description}</div>
        </div>
      </li>
    ))}
  </ul>
);

export default People;
