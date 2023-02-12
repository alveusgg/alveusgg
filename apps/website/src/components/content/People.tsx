import Heading from "./Heading"
import React from "react"
import Image, { type ImageProps } from "next/image"

type PeopleProps = {
  people: Record<string, {
    image: ImageProps["src"],
    name: string,
    title: string,
    description: React.ReactNode,
  }>,
  sideBySide?: boolean,
};

const People: React.FC<PeopleProps> = ({ people, sideBySide = false }) => (
  <ul className={`flex flex-wrap ${sideBySide ? "md:justify-center md:items-start" : ""}`}>
    {Object.entries(people).map(([ key, person ]) => (
      <li key={key} className={`basis-full flex flex-col text-center items-center ${sideBySide ? "md:basis-1/2" : "md:flex-row md:text-left"}`}>
        <div className={`flex-shrink-0 p-4 mx-auto max-w-sm w-full ${sideBySide ? "" : "md:max-w-md md:w-1/3"}`}>
          <Image src={person.image} alt="" className="w-full h-auto aspect-square object-cover rounded-2xl" />
        </div>
        <div className={`flex-grow p-4 ${sideBySide ? "" : "md:w-2/3"}`}>
          <Heading level={2} className="text-4xl">
            {person.name}
          </Heading>
          <Heading level={3} className="text-xl">
            {person.title}
          </Heading>
          <div className="text-gray-500">
            {person.description}
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default People;
