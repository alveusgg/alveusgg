"use client";
import React, { useState } from "react";
import enclosures, { type EnclosureKey } from "@alveusgg/data/src/enclosures";
import type {
  Ambassador,
  AmbassadorKey,
} from "@alveusgg/data/src/ambassadors/core";
import type { ImageProps, StaticImageData } from "next/image";

import { getAmbassadorImages } from "@alveusgg/data/src/ambassadors/images";
import { kebabToCamel, sentenceToKebab } from "@/utils/string-case";
import { staff } from "@/pages/about/staff";
import mayaImage from "@/assets/maya.png";
import Link from "./Link";
import ProfileCard from "./ProfileCard";

type LinkHoverProps = {
  species?: Ambassador["species"];
  enclosure?: EnclosureKey;
  position?: string;
  profile?: boolean;
  href: string;
  name: string;
};

export type StaffImage = StaticImageData & {
  alt: string;
};

type StaffMember = {
  name: string;
  title: string;
  img: ImageProps | StaffImage;
  description?: JSX.Element;
};

type Staff = Array<StaffMember>;

const allStaff: Staff = Object.values(staff).map((person) => ({
  img: { ...person.image, alt: `${person.name}'s picture` },
  name: person.name,
  title: person.title,
  description: person.description,
}));

allStaff.push({
  img: { ...mayaImage, alt: "Maya's picture" },
  name: "Maya Higa",
  title: "Founder",
});
console.log(allStaff);
console.log(mayaImage);

const nameToCamelCase = (name: string) => {
  const noSymbols = name.replace(/[{(/.)}]/g, "");
  const camelCased = noSymbols.replace("ñ", "n");
  return kebabToCamel(sentenceToKebab(camelCased));
};

const findMember = (name: string, members: Staff) => {
  // const camelName = nameToCamelCase(name);
  const member = members.find(
    (person) => nameToCamelCase(name) == nameToCamelCase(person.name)
  );
  return member;
};

const LinkHover: React.FC<LinkHoverProps> = ({
  href,
  name,
  species,
  enclosure,
  profile,
  position,
}) => {
  const [cardShown, setCardShown] = useState<boolean>(false);
  const [delay, setDelay] = useState<number | null>(null);

  const camelName = nameToCamelCase(name);
  const img = species
    ? getAmbassadorImages(camelName as AmbassadorKey)[0]
    : findMember(name, allStaff)?.img;

  const enclosureName = species && enclosures[enclosure as EnclosureKey].name;

  const onEnter = () => {
    setDelay(
      window.setTimeout(() => {
        setCardShown(true);
      }, 500)
    );
  };
  const onLeave = () => {
    setCardShown(false);
    if (delay) window.clearTimeout(delay);
  };
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave} className="inline">
      {cardShown && profile && (
        <ProfileCard
          name={name}
          img={img}
          species={species}
          enclosure={enclosureName}
          position={position}
        />
      )}
      <Link className={`${position && "text-yellow-400"}`} href={href}>
        {name}
      </Link>
    </div>
  );
};

export default LinkHover;
